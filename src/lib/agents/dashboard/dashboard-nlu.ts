import { NluAgent } from '../nlu';
import { getGoogleApiKey } from '../../config/api-keys';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

/**
 * Interface para os resultados do entendimento de linguagem natural (NLU)
 * para requisições de dashboard
 */
export interface DashboardNluResult {
  // Tipo de gráfico solicitado
  chartType: string;
  
  // Métricas a serem medidas
  metrics: string[];
  
  // Dimensões para agrupar ou visualizar dados
  dimensions: string[];
  
  // Filtros a serem aplicados
  filters: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  
  // Intervalo de tempo para dados
  timeRange?: {
    period?: 'último dia' | 'última semana' | 'último mês' | 'último trimestre' | 'último ano';
    start?: Date;
    end?: Date;
  };
  
  // Entidades identificadas na solicitação
  entities: Array<{
    name: string;
    value: string;
    type?: string;
  }>;
  
  // Idioma da solicitação
  language: string;
  
  // Título solicitado para o gráfico
  requestedTitle?: string;
  
  // Configurações adicionais para o gráfico
  chartConfig?: Record<string, any>;
  
  // Campos legados para compatibilidade
  intent?: string;
  confidence?: number;
  chartFunction?: string;
  preferences?: {
    title?: string;
    colors?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    axisLabels?: {
      x?: string;
      y?: string;
    };
  };
}

/**
 * Mapeamento de tipos de gráficos para funções de geração
 */
const CHART_TYPE_MAPPING: Record<string, string> = {
  'barra': 'generate_bar_chart',
  'barras': 'generate_bar_chart',
  'bar': 'generate_bar_chart',
  'linha': 'generate_line_chart',
  'linhas': 'generate_line_chart',
  'line': 'generate_line_chart',
  'pizza': 'generate_pie_chart',
  'pie': 'generate_pie_chart',
  'área': 'generate_area_chart',
  'area': 'generate_area_chart',
  'coluna': 'generate_column_chart',
  'colunas': 'generate_column_chart',
  'column': 'generate_column_chart',
  'dispersão': 'generate_scatter_chart',
  'scatter': 'generate_scatter_chart',
  'histograma': 'generate_histogram_chart',
  'histogram': 'generate_histogram_chart',
  'radar': 'generate_radar_chart',
  'rede': 'generate_network_graph',
  'network': 'generate_network_graph',
  'árvore': 'generate_treemap_chart',
  'treemap': 'generate_treemap_chart',
  'heatmap': 'generate_heatmap',
  'nuvem de palavras': 'generate_word_cloud_chart',
  'word cloud': 'generate_word_cloud_chart',
  'dual': 'generate_dual_axes_chart',
  'fluxo': 'generate_flow_diagram',
  'flow': 'generate_flow_diagram',
  'espinha de peixe': 'generate_fishbone_diagram',
  'fishbone': 'generate_fishbone_diagram',
  'mapa mental': 'generate_mind_map',
  'prioridade': 'generate_bar_chart',
  'priority': 'generate_bar_chart',
  'priority chart': 'generate_bar_chart'
};

/**
 * Classe para processamento de linguagem natural para dashboards
 */
export class DashboardNluAgent {
  /**
   * Processa o texto da requisição e extrai informações relevantes
   */
  async process(userInput: string, context: any = {}): Promise<DashboardNluResult> {
    console.log(`DashboardNLU: Processando entrada do usuário: "${userInput}"`);
    
    // Implementação simplificada para demonstração
    // Em uma implementação real, usaríamos um modelo de NLU mais sofisticado
    
    const result: DashboardNluResult = {
      chartType: 'auto',
      metrics: [],
      dimensions: [],
      filters: [],
      entities: [],
      language: 'pt-br'
    };
    
    // Detectar se é uma pergunta sobre quantidade de tarefas
    const isTaskCountQuestion = this.isTaskCountQuestion(userInput);
    if (isTaskCountQuestion) {
      console.log('DashboardNLU: Detectada pergunta sobre contagem de tarefas');
      result.metrics.push('tarefas');
      result.chartType = 'column';
      
      // Verificar se há menção a período específico
      if (userInput.match(/hoje|amanhã|esta semana|essa semana|próxima semana|proxima semana|este mês|esse mês|próximo mês|proximo mês/i)) {
        const timeEntity = this.extractTimeEntity(userInput);
        result.entities.push({
          name: 'time_period',
          value: timeEntity
        });
        
        result.dimensions.push('período');
        
        // Adicionar filtro de tempo se necessário
        result.filters.push({
          field: 'time_period',
          operator: '=',
          value: timeEntity
        });
      }
      
      // Verificar se há menção a prioridade específica
      if (userInput.match(/alta prioridade|prioridade alta|média prioridade|prioridade média|baixa prioridade|prioridade baixa/i)) {
        const priorityEntity = this.extractPriorityEntity(userInput);
        result.entities.push({
          name: 'task_priority',
          value: priorityEntity
        });
        
        result.dimensions.push('prioridade');
        
        // Adicionar filtro de prioridade
        result.filters.push({
          field: 'priority',
          operator: '=',
          value: priorityEntity
        });
      } else {
        // Se não especificou prioridade, queremos ver por prioridade
        result.dimensions.push('prioridade');
      }
      
      // Definir título baseado na pergunta
      if (result.dimensions.includes('período') && result.dimensions.includes('prioridade')) {
        result.requestedTitle = `Tarefas por período e prioridade`;
      } else if (result.dimensions.includes('período')) {
        result.requestedTitle = `Tarefas por período`;
      } else if (result.dimensions.includes('prioridade')) {
        result.requestedTitle = `Tarefas por prioridade`;
      } else {
        result.requestedTitle = `Total de tarefas`;
      }
      
      return result;
    }
    
    // Detecção de tipo de gráfico a partir de palavras-chave
    if (userInput.match(/barra|barras/i)) {
      result.chartType = 'bar';
    } else if (userInput.match(/coluna|colunas/i)) {
      result.chartType = 'column';
    } else if (userInput.match(/linha|linhas/i)) {
      result.chartType = 'line';
    } else if (userInput.match(/pizza|torta/i)) {
      result.chartType = 'pie';
    } else if (userInput.match(/área|area/i)) {
      result.chartType = 'area';
    } else if (userInput.match(/scatter|dispersão|dispersao/i)) {
      result.chartType = 'scatter';
    } else if (userInput.match(/prioridade|priority/i) && !result.dimensions.includes('prioridade')) {
      // Se temos apenas a palavra prioridade na consulta, 
      // definimos o chartType como 'bar' para visualização de tarefas por prioridade
      result.chartType = 'bar';
      result.dimensions.push('prioridade');
    }
    
    // Detecção simples de métricas
    if (userInput.match(/venda|vendas/i)) {
      result.metrics.push('vendas');
    }
    if (userInput.match(/lucro|lucros/i)) {
      result.metrics.push('lucro');
    }
    if (userInput.match(/receita|receitas/i)) {
      result.metrics.push('receita');
    }
    if (userInput.match(/tarefas|tarefa/i)) {
      result.metrics.push('tarefas');
    }
    
    // Detecção simples de dimensões
    if (userInput.match(/produto|produtos/i)) {
      result.dimensions.push('produtos');
    }
    if (userInput.match(/região|regiões|regional/i)) {
      result.dimensions.push('regiões');
    }
    if (userInput.match(/mês|mes|mensal/i)) {
      result.dimensions.push('mês');
    }
    if (userInput.match(/trimestre|trimestral/i)) {
      result.dimensions.push('trimestre');
    }
    if (userInput.match(/ano|anual/i)) {
      result.dimensions.push('ano');
    }
    if (userInput.match(/prioridade|prioridades/i)) {
      result.dimensions.push('prioridade');
    }
    
    // Detecção simples de período de tempo
    if (userInput.match(/último mês|ultimo mes/i)) {
      result.timeRange = { period: 'último mês' };
    } else if (userInput.match(/último trimestre|ultimo trimestre/i)) {
      result.timeRange = { period: 'último trimestre' };
    } else if (userInput.match(/último ano|ultimo ano/i)) {
      result.timeRange = { period: 'último ano' };
    }
    
    // Detecção simples de título
    const titleMatch = userInput.match(/título[:\s]+([^,.]+)/i) || 
                       userInput.match(/com título[:\s]+([^,.]+)/i) ||
                       userInput.match(/intitulado[:\s]+([^,.]+)/i);
    
    if (titleMatch && titleMatch[1]) {
      result.requestedTitle = titleMatch[1].trim();
    }
    
    // Detecção de entidades específicas
    if (userInput.match(/prioridade alta/i)) {
      result.entities.push({ name: 'task_attribute', value: 'prioridade alta' });
    }
    if (userInput.match(/prioridade média|prioridade media/i)) {
      result.entities.push({ name: 'task_attribute', value: 'prioridade média' });
    }
    if (userInput.match(/prioridade baixa/i)) {
      result.entities.push({ name: 'task_attribute', value: 'prioridade baixa' });
    }
    
    console.log('DashboardNLU: Resultado do processamento:', result);
    
    return result;
  }

  /**
   * Verifica se a entrada do usuário é uma pergunta sobre contagem de tarefas
   */
  private isTaskCountQuestion(input: string): boolean {
    // Expressões regulares para detectar perguntas sobre contagem
    const countPatterns = [
      /quantas? tarefas/i,
      /número de tarefas/i,
      /total de tarefas/i,
      /contagem de tarefas/i,
      /conte as tarefas/i,
      /me diga quantas tarefas/i,
      /me mostre quantas tarefas/i,
      /tarefas (que)? eu tenho/i,
      /tarefas pendentes/i,
      /tarefas para (hoje|amanhã|esta semana|esse mês)/i
    ];
    
    // Verificar se algum padrão corresponde
    return countPatterns.some(pattern => pattern.test(input));
  }
  
  /**
   * Extrai entidade de período de tempo da entrada do usuário
   */
  private extractTimeEntity(input: string): string {
    if (input.match(/hoje/i)) return 'hoje';
    if (input.match(/amanhã|amanha/i)) return 'amanhã';
    if (input.match(/esta semana|essa semana/i)) return 'esta semana';
    if (input.match(/próxima semana|proxima semana/i)) return 'próxima semana';
    if (input.match(/este mês|esse mês/i)) return 'este mês';
    if (input.match(/próximo mês|proximo mês/i)) return 'próximo mês';
    
    return 'todos';
  }
  
  /**
   * Extrai entidade de prioridade da entrada do usuário
   */
  private extractPriorityEntity(input: string): string {
    if (input.match(/alta prioridade|prioridade alta/i)) return 'alta';
    if (input.match(/média prioridade|prioridade média|media prioridade|prioridade media/i)) return 'média';
    if (input.match(/baixa prioridade|prioridade baixa/i)) return 'baixa';
    
    return 'todas';
  }
} 