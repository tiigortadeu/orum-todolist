import { DashboardNluAgent, DashboardNluResult } from './dashboard-nlu';
import { DataRetrieverAgent } from './data-retriever';
import { DataProcessorAgent } from './data-processor';
import { ChartConfigAgent, ChartConfig } from './chart-config';
import { OrumaivAgent } from '../adk-agent';

/**
 * Interface para o resultado do processamento de dashboard
 */
export interface DashboardResult {
  nluResult: DashboardNluResult;
  chartConfig: ChartConfig;
  title?: string;
  description?: string;
  source?: string;
  success: boolean;
  error?: string;
}

/**
 * Orquestrador para o pipeline de geração de dashboard
 */
export class DashboardOrchestrator {
  private nluAgent: DashboardNluAgent;
  private dataRetrieverAgent: DataRetrieverAgent;
  private dataProcessorAgent: DataProcessorAgent;
  private chartConfigAgent: ChartConfigAgent;
  private adkAgent: OrumaivAgent | null;
  
  constructor(adkAgent: OrumaivAgent | null = null) {
    this.adkAgent = adkAgent;
    this.nluAgent = new DashboardNluAgent();
    this.dataRetrieverAgent = new DataRetrieverAgent();
    this.dataProcessorAgent = new DataProcessorAgent();
    this.chartConfigAgent = new ChartConfigAgent();
  }
  
  /**
   * Processa uma solicitação de dashboard
   */
  async processDashboardRequest(message: string, context: any = {}): Promise<DashboardResult> {
    console.log(`DashboardOrchestrator: Processando solicitação - "${message}"`);
    
    try {
      // 1. NLU: Processar e entender a mensagem
      console.log('DashboardOrchestrator: Iniciando processamento NLU');
      const nluResult = await this.nluAgent.process(message, context);
      console.log('DashboardOrchestrator: Resultado do NLU:', nluResult);
      
      // 2. Busca de Dados: Recuperar dados relevantes
      console.log('DashboardOrchestrator: Iniciando busca de dados');
      const rawData = await this.dataRetrieverAgent.retrieveData(nluResult);
      console.log('DashboardOrchestrator: Dados recuperados com sucesso');
      
      // 3. Processamento de Dados: Transformar e preparar os dados
      console.log('DashboardOrchestrator: Iniciando processamento de dados');
      const processedData = await this.dataProcessorAgent.processData(
        rawData,
        nluResult.chartType,
        nluResult.metrics,
        nluResult.dimensions
      );
      console.log('DashboardOrchestrator: Dados processados com sucesso');
      
      // 4. Configuração do Gráfico: Gerar configuração do Chart.js
      console.log('DashboardOrchestrator: Gerando configuração do gráfico para Chart.js');
      const chartConfig = this.chartConfigAgent.generateChartConfig(
        processedData,
        nluResult
      );
      console.log('DashboardOrchestrator: Configuração Chart.js gerada com sucesso');
      
      // 5. Gerar título e descrição para o dashboard
      const title = this.generateTitle(nluResult);
      const description = await this.generateDashboardExplanation({
        nluResult,
        chartConfig,
        success: true
      });
      
      // 6. Resultado final
      return {
        nluResult,
        chartConfig,
        title,
        description,
        source: processedData.metadata?.source,
        success: true
      };
    } catch (error: any) {
      console.error('DashboardOrchestrator: Erro no processamento:', error);
      return {
        nluResult: {
          intent: 'dashboard_generation_error',
          entities: [],
          confidence: 0,
          chartType: '',
          chartFunction: '',
          metrics: [],
          dimensions: [],
          filters: [],
          preferences: {},
          language: 'pt-br'
        },
        chartConfig: {
          chartType: 'bar',
          data: {
            labels: [],
            datasets: []
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Erro ao gerar gráfico'
              },
              legend: {
                display: false
              },
              tooltip: {
                enabled: true
              }
            }
          }
        },
        success: false,
        error: error.message || 'Erro desconhecido no processamento do dashboard'
      };
    }
  }
  
  /**
   * Gera um título para o dashboard com base no resultado do NLU
   */
  private generateTitle(nluResult: DashboardNluResult): string {
    const metrics = nluResult.metrics?.join(' e ') || '';
    const dimensions = nluResult.dimensions?.join(' por ') || '';
    
    if (metrics && dimensions) {
      return `${metrics} por ${dimensions}`;
    } else if (metrics) {
      return `${metrics}`;
    } else if (dimensions) {
      return `Dados por ${dimensions}`;
    } else if (nluResult.chartType.toLowerCase().includes('prioridade')) {
      return 'Tarefas por Prioridade';
    } else {
      return 'Dashboard';
    }
  }
  
  /**
   * Gera uma explicação textual para o dashboard gerado
   */
  async generateDashboardExplanation(dashboardResult: DashboardResult): Promise<string> {
    try {
      // Se temos o ADK Agent disponível, usamos ele para gerar uma explicação melhor
      if (this.adkAgent && this.adkAgent.isInitialized()) {
        const prompt = `
          Um dashboard foi gerado com as seguintes características:
          - Tipo de gráfico: ${dashboardResult.nluResult.chartType}
          - Métricas: ${dashboardResult.nluResult.metrics.join(', ')}
          - Dimensões: ${dashboardResult.nluResult.dimensions.join(', ')}
          
          Por favor, forneça uma explicação curta e clara sobre o que este dashboard mostra e o que podemos aprender com ele.
          Seja conciso, direto e informativo.
        `;
        
        return await this.adkAgent.sendMessage(prompt);
      }
      
      // Explicação padrão sem o ADK Agent
      const metrics = dashboardResult.nluResult.metrics.join(', ') || 'dados';
      const dimensions = dashboardResult.nluResult.dimensions.join(', ') || 'categorias';
      
      let explanation = `Este gráfico de ${dashboardResult.nluResult.chartType} mostra ${metrics}`;
      
      if (dimensions) {
        explanation += ` por ${dimensions}`;
      }
      
      if (dashboardResult.nluResult.timeRange?.period) {
        explanation += ` no ${dashboardResult.nluResult.timeRange.period}`;
      }
      
      explanation += '.';
      
      return explanation;
    } catch (error: any) {
      console.error('DashboardOrchestrator: Erro ao gerar explicação:', error);
      return 'Foi gerado um dashboard com base na sua solicitação.';
    }
  }
  
  /**
   * Processa solicitação para explicar um dashboard existente
   */
  async explainExistingDashboard(dashboardId: string, message: string): Promise<string> {
    try {
      // Se tivermos o ADK Agent disponível, usamos ele para gerar uma explicação melhor
      if (this.adkAgent && this.adkAgent.isInitialized()) {
        // TODO: Recuperar dados do dashboard com o dashboardId
        const dashboardData = { id: dashboardId, type: 'Gráfico de barras', metrics: ['Vendas', 'Lucro'] };
        
        const prompt = `
          O usuário quer entender melhor o dashboard com ID ${dashboardId}. 
          Ele perguntou: "${message}"
          
          Dados do dashboard:
          - Tipo: ${dashboardData.type}
          - Métricas: ${dashboardData.metrics.join(', ')}
          
          Por favor, explique de forma clara e concisa o que este dashboard mostra, respondendo diretamente à pergunta do usuário.
        `;
        
        return await this.adkAgent.sendMessage(prompt);
      }
      
      // Explicação padrão sem o ADK Agent
      return `O dashboard ${dashboardId} mostra dados relevantes para a sua análise. Ele foi criado para visualizar métricas importantes de forma clara e direta.`;
    } catch (error: any) {
      console.error('DashboardOrchestrator: Erro ao explicar dashboard existente:', error);
      return `Desculpe, não foi possível explicar o dashboard ${dashboardId} devido a um erro.`;
    }
  }
} 