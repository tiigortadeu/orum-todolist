import { DashboardNluResult } from './dashboard-nlu';

/**
 * Interface para dados brutos
 */
export interface RawData {
  records: Record<string, any>[];
  metadata?: {
    source: string;
    timestamp: string;
    fields?: Record<string, { type: string; description?: string }>;
  };
}

/**
 * Interface para dados formatados para visualização
 */
export interface ProcessedData {
  chartType: string;
  title: string;
  data: Array<{
    category: string;
    value: number;
    [key: string]: any;
  }>;
  xAxisLabel?: string;
  yAxisLabel?: string;
  metadata?: Record<string, any>;
}

/**
 * Agente para processamento de dados brutos em formato para visualização
 */
export class DataProcessorAgent {
  /**
   * Processa dados brutos em formato adequado para visualização
   */
  process(rawData: RawData, nluResult: DashboardNluResult): ProcessedData {
    console.log('DataProcessor: Processando dados brutos para visualização');
    
    try {
      // Detectar o tipo de dados e aplicar o processamento adequado
      if (rawData.metadata?.source === 'tasks') {
        return this.processTasksData(rawData, nluResult);
      } else {
        // Para outros tipos de dados
        return this.processGenericData(rawData, nluResult);
      }
    } catch (error) {
      console.error('DataProcessor: Erro ao processar dados:', error);
      
      // Retornar dados de erro formatados para mostrar ao usuário
      return {
        chartType: 'bar',
        title: 'Erro ao processar dados',
        data: [{ category: 'Erro', value: 0 }]
      };
    }
  }
  
  /**
   * Método compatível com a versão anterior - usado pelo orquestrador
   */
  async processData(
    rawData: RawData,
    chartType: string,
    metrics: string[],
    dimensions: string[]
  ): Promise<ProcessedData> {
    console.log(`DataProcessor: Processando dados para gráfico "${chartType}"`);
    
    // Criar um objeto NLU simplificado para reutilizar o código existente
    const nluResult: DashboardNluResult = {
      chartType: chartType || 'column',
      metrics: metrics || [],
      dimensions: dimensions || [],
      filters: [],
      entities: [],
      language: 'pt-br'
    };
    
    // Usar o método process que já implementamos
    return this.process(rawData, nluResult);
  }
  
  /**
   * Processa dados de tarefas para visualização
   */
  private processTasksData(rawData: RawData, nluResult: DashboardNluResult): ProcessedData {
    console.log('DataProcessor: Processando dados de tarefas');
    
    // Determinar tipo de gráfico adequado para tarefas
    let chartType = 'column';
    
    if (nluResult.chartType && nluResult.chartType.toLowerCase() !== 'auto') {
      // Mapear 'priority' para 'column' ou 'bar' que são tipos válidos para Chart.js
      if (nluResult.chartType.toLowerCase() === 'priority') {
        chartType = 'bar';
      } else {
        chartType = nluResult.chartType.toLowerCase();
      }
    }
    
    // Determinar título com base nas especificações do NLU ou usar padrão
    let title = 'Tarefas por Prioridade';
    
    if (nluResult.requestedTitle) {
      title = nluResult.requestedTitle;
    }
    
    // Verificar se já está no formato correto e converter se necessário
    let formattedData: Array<{category: string, value: number, [key: string]: any}> = [];
    
    if (rawData.records && Array.isArray(rawData.records)) {
      formattedData = rawData.records.map(record => {
        return {
          category: String(record.category || 'Desconhecido'),
          value: Number(record.value || 0),
          // Preservar outras propriedades
          ...record
        };
      });
    }
    
    // Verificar se já está no formato correto
    const processedData: ProcessedData = {
      chartType,
      title,
      data: formattedData,
      xAxisLabel: 'Prioridade',
      yAxisLabel: 'Número de Tarefas',
      metadata: {
        source: 'tasks',
        timestamp: new Date().toISOString()
      }
    };
    
    return processedData;
  }
  
  /**
   * Processa dados genéricos para visualização
   */
  private processGenericData(rawData: RawData, nluResult: DashboardNluResult): ProcessedData {
    // Determinar tipo de gráfico com base no NLU ou usar padrão
    let chartType = 'column';
    
    if (nluResult.chartType && nluResult.chartType.toLowerCase() !== 'auto') {
      chartType = nluResult.chartType.toLowerCase();
    } else {
      // Auto-detectar o melhor tipo de gráfico com base nos dados
      chartType = this.detectBestChartType(rawData, nluResult);
    }
    
    // Determinar título
    let title = 'Visualização de Dados';
    
    if (nluResult.requestedTitle) {
      title = nluResult.requestedTitle;
    } else if (nluResult.metrics.length > 0 && nluResult.dimensions.length > 0) {
      title = `${nluResult.metrics.join(', ')} por ${nluResult.dimensions.join(', ')}`;
    }
    
    // Processar e formatar dados para o gráfico
    const processedData: ProcessedData = {
      chartType,
      title,
      data: this.formatDataForChart(rawData, nluResult),
      xAxisLabel: nluResult.dimensions[0] || '',
      yAxisLabel: nluResult.metrics[0] || '',
      metadata: rawData.metadata
    };
    
    return processedData;
  }
  
  /**
   * Detecta o melhor tipo de gráfico com base nos dados e intenção
   */
  private detectBestChartType(rawData: RawData, nluResult: DashboardNluResult): string {
    // Número de registros
    const recordCount = rawData.records.length;
    
    // Se temos tempo/data como dimensão, priorizar gráficos de linha ou área
    if (nluResult.dimensions.some(d => 
      ['tempo', 'data', 'mês', 'ano', 'trimestre', 'semana', 'dia'].includes(d.toLowerCase()))
    ) {
      // Para séries temporais, preferir linha ou área
      return recordCount > 10 ? 'line' : 'column';
    }
    
    // Para comparações de categoria simples
    if (recordCount <= 5) {
      return 'column'; // ou 'bar' para horizontais
    } else if (recordCount <= 10) {
      return 'bar';
    } else {
      return 'bar'; // Para muitos registros, barras horizontais funcionam melhor
    }
  }
  
  /**
   * Formata dados para o tipo de gráfico selecionado
   */
  private formatDataForChart(rawData: RawData, nluResult: DashboardNluResult): Array<{category: string, value: number}> {
    // Implementação básica assumindo que os dados já estão em formato compatível
    return rawData.records.map(record => {
      return {
        category: String(record.category || record.name || 'Desconhecido'),
        value: Number(record.value || 0)
      };
    });
  }
} 