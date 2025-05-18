import { DashboardNluResult } from './dashboard-nlu';
import { RawData } from './data-processor';
import { getTasks, Task } from '../../tasks/task-service';

/**
 * Interface para fontes de dados
 */
export interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'mock' | 'file' | 'database';
  config: Record<string, any>;
}

/**
 * Mapeamento de entidades para fontes de dados
 */
const ENTITY_DATA_SOURCE_MAPPING: Record<string, string> = {
  'vendas': 'sales',
  'lucro': 'profit',
  'receita': 'revenue',
  'clientes': 'customers',
  'produtos': 'products',
  'regiões': 'regions',
  'região': 'regions',
  'tempo': 'time',
  'mês': 'time',
  'trimestre': 'time',
  'ano': 'time',
  'tarefas': 'tasks',
  'tarefa': 'tasks',
  'prioridade': 'tasks',
  'prioridades': 'tasks'
};

/**
 * Agente para busca e recuperação de dados
 */
export class DataRetrieverAgent {
  private dataSources: Record<string, DataSource> = {
    // Fontes de dados pré-configuradas
    'sales': {
      id: 'sales',
      name: 'Dados de Vendas',
      type: 'mock',
      config: { mockDataset: 'sales' }
    },
    'profit': {
      id: 'profit',
      name: 'Dados de Lucro',
      type: 'mock',
      config: { mockDataset: 'profit' }
    },
    'revenue': {
      id: 'revenue',
      name: 'Dados de Receita',
      type: 'mock',
      config: { mockDataset: 'revenue' }
    },
    'customers': {
      id: 'customers',
      name: 'Dados de Clientes',
      type: 'mock',
      config: { mockDataset: 'customers' }
    },
    'products': {
      id: 'products',
      name: 'Dados de Produtos',
      type: 'mock',
      config: { mockDataset: 'products' }
    },
    'regions': {
      id: 'regions',
      name: 'Dados de Regiões',
      type: 'mock',
      config: { mockDataset: 'regions' }
    },
    'time': {
      id: 'time',
      name: 'Dados Temporais',
      type: 'mock',
      config: { mockDataset: 'time' }
    },
    'tasks': {
      id: 'tasks',
      name: 'Dados de Tarefas',
      type: 'mock',
      config: { mockDataset: 'tasks' }
    }
  };
  
  /**
   * Recupera dados com base no resultado do NLU
   */
  async retrieveData(nluResult: DashboardNluResult): Promise<RawData> {
    console.log(`DataRetriever: Buscando dados para métricas [${nluResult.metrics.join(', ')}] e dimensões [${nluResult.dimensions.join(', ')}]`);
    
    try {
      // Identificar a fonte de dados principal com base nas métricas e dimensões
      const dataSource = this.identifyDataSource(nluResult);
      console.log(`DataRetriever: Fonte de dados identificada: ${dataSource.name}`);
      
      // Buscar os dados da fonte identificada
      const rawData = await this.fetchDataFromSource(dataSource, nluResult);
      
      return rawData;
    } catch (error) {
      console.error('DataRetriever: Erro ao buscar dados:', error);
      throw error;
    }
  }
  
  /**
   * Identifica a fonte de dados mais apropriada com base nas métricas e dimensões
   */
  private identifyDataSource(nluResult: DashboardNluResult): DataSource {
    // Verificar entidades explícitas
    for (const entity of nluResult.entities) {
      if (entity.name === 'task_attribute' && entity.value.toLowerCase().includes('prioridade')) {
        return this.dataSources['tasks'];
      }
    }
    
    // Verificar se está relacionado com prioridade ou tarefas
    if (nluResult.chartType.toLowerCase().includes('priority') || 
        nluResult.chartType.toLowerCase().includes('prioridade')) {
      return this.dataSources['tasks'];
    }
    
    // Verificar métricas primeiro
    for (const metric of nluResult.metrics) {
      const dataSourceId = ENTITY_DATA_SOURCE_MAPPING[metric.toLowerCase()];
      if (dataSourceId && this.dataSources[dataSourceId]) {
        return this.dataSources[dataSourceId];
      }
    }
    
    // Verificar dimensões em seguida
    for (const dimension of nluResult.dimensions) {
      const dataSourceId = ENTITY_DATA_SOURCE_MAPPING[dimension.toLowerCase()];
      if (dataSourceId && this.dataSources[dataSourceId]) {
        return this.dataSources[dataSourceId];
      }
    }
    
    // Fonte padrão se nenhuma correspondência for encontrada
    return this.dataSources['sales'] || {
      id: 'default',
      name: 'Dados Padrão',
      type: 'mock',
      config: { mockDataset: 'default' }
    };
  }
  
  /**
   * Busca dados de uma fonte específica, aplicando filtros e transformações iniciais
   */
  private async fetchDataFromSource(
    dataSource: DataSource,
    nluResult: DashboardNluResult
  ): Promise<RawData> {
    // Implementamos inicialmente apenas dados mockados
    if (dataSource.type === 'mock') {
      return this.getMockData(dataSource.config.mockDataset, nluResult);
    }
    
    // Implementações futuras para outras fontes de dados
    throw new Error(`Fonte de dados do tipo ${dataSource.type} não implementada`);
  }
  
  /**
   * Gera dados mockados para testes e desenvolvimento
   */
  private async getMockData(dataset: string, nluResult: DashboardNluResult): Promise<RawData> {
    console.log(`DataRetriever: Gerando dados mockados para dataset "${dataset}"`);
    
    // Dados mockados são gerados com base no dataset solicitado
    switch (dataset) {
      case 'sales':
        return this.generateSalesMockData(nluResult);
      case 'profit':
        return this.generateProfitMockData(nluResult);
      case 'revenue':
        return this.generateRevenueMockData(nluResult);
      case 'customers':
        return this.generateCustomersMockData(nluResult);
      case 'products':
        return this.generateProductsMockData(nluResult);
      case 'regions':
        return this.generateRegionsMockData(nluResult);
      case 'time':
        return this.generateTimeMockData(nluResult);
      case 'tasks':
        return this.generateTasksMockData(nluResult);
      default:
        return this.generateSalesMockData(nluResult);
    }
  }
  
  /**
   * Gera dados de tarefas da aplicação
   */
  private async generateTasksMockData(nluResult: DashboardNluResult): Promise<RawData> {
    console.log('DataRetriever: Buscando dados reais de tarefas');
    
    try {
      // Buscar tarefas reais do banco de dados/serviço em vez de usar tarefas fixas
      const tasks = await getTasks();
      console.log('DataRetriever: Tarefas recuperadas:', JSON.stringify(tasks));
      
      // Reiniciar contagem para garantir precisão
      const priorityMap: Record<string, number> = {
        'low': 0,
        'medium': 0, 
        'high': 0
      };
      
      // Contar tarefas não concluídas (checked: false) por prioridade
      tasks.filter(task => !task.checked).forEach(task => {
        if (task.priority in priorityMap) {
          priorityMap[task.priority]++;
        } else {
          console.warn('Tarefa com prioridade desconhecida:', task.priority);
        }
      });
      
      console.log('DataRetriever: Contagem precisa de tarefas por prioridade:', priorityMap);
      
      // Transformar para o formato necessário para gráficos
      const formattedRecords = Object.entries(priorityMap).map(([priority, count]) => {
        let label: string;
        
        // Traduzir e formatar os nomes das prioridades
        switch(priority) {
          case 'low':
            label = 'Baixa';
            break;
          case 'medium':
            label = 'Média';
            break;
          case 'high':
            label = 'Alta';
            break;
          default:
            label = priority;
        }
        
        return {
          category: label,
          value: count,
          priority: priority
        };
      });
      
      // Ordenar do maior para o menor valor
      formattedRecords.sort((a, b) => b.value - a.value);
      
      return {
        records: formattedRecords,
        metadata: {
          source: 'tasks',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('DataRetriever: Erro ao buscar tarefas reais:', error);
      
      // Retornar dados vazios em caso de erro
      return {
        records: [
          { category: 'Baixa', value: 0, priority: 'low' },
          { category: 'Média', value: 0, priority: 'medium' },
          { category: 'Alta', value: 0, priority: 'high' }
        ],
        metadata: {
          source: 'tasks',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
  
  /**
   * Verifica se uma tarefa está agendada para hoje
   */
  private isTaskForToday(task: Task): boolean {
    // Verificar se a data da tarefa é hoje
    if (!task.dueDate) return false;
    
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  }
  
  /**
   * Verifica se uma tarefa está agendada para a próxima semana
   */
  private isTaskForNextWeek(task: Task): boolean {
    // Verificar se a data da tarefa está na próxima semana
    if (!task.dueDate) return false;
    
    const today = new Date();
    const nextWeekStart = new Date(today);
    nextWeekStart.setDate(today.getDate() + 1);
    
    const nextWeekEnd = new Date(today);
    nextWeekEnd.setDate(today.getDate() + 7);
    
    const taskDate = new Date(task.dueDate);
    
    return taskDate >= nextWeekStart && taskDate <= nextWeekEnd;
  }
  
  /**
   * Mapeia valores de prioridade em linguagem natural para valores do sistema
   */
  private mapPriorityValue(priority: string): string {
    const mapping: Record<string, string> = {
      'alta': 'high',
      'média': 'medium',
      'media': 'medium',
      'baixa': 'low'
    };
    
    return mapping[priority.toLowerCase()] || priority;
  }
  
  /**
   * Gera dados mockados para vendas
   */
  private generateSalesMockData(nluResult: DashboardNluResult): RawData {
    // Lista de produtos para o mock
    const products = ['Laptop', 'Smartphone', 'Tablet', 'Monitor', 'Teclado', 'Mouse', 'Headphone', 'Smartwatch'];
    
    // Lista de regiões
    const regions = ['Norte', 'Sul', 'Leste', 'Oeste', 'Nordeste', 'Sudeste', 'Centro-Oeste'];
    
    // Lista de meses
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Lista de anos
    const years = ['2020', '2021', '2022', '2023'];
    
    // Função auxiliar para gerar números aleatórios
    const randomNumber = (min: number, max: number) => 
      Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Criar registros de vendas
    const records: Record<string, any>[] = [];
    
    // Número de registros a serem gerados
    const numRecords = 100;
    
    for (let i = 0; i < numRecords; i++) {
      const product = products[randomNumber(0, products.length - 1)];
      const region = regions[randomNumber(0, regions.length - 1)];
      const month = months[randomNumber(0, months.length - 1)];
      const year = years[randomNumber(0, years.length - 1)];
      
      // Valores aleatórios para métricas
      const quantity = randomNumber(1, 50);
      const unitPrice = randomNumber(100, 3000);
      const salesValue = quantity * unitPrice;
      const discount = randomNumber(0, 20) / 100; // 0% a 20%
      const finalValue = salesValue * (1 - discount);
      const cost = salesValue * 0.6; // 60% do valor de venda
      const profit = finalValue - cost;
      
      records.push({
        id: i + 1,
        produto: product,
        região: region,
        mês: month,
        ano: year,
        data: `${month}/${year}`,
        quantidade: quantity,
        preço_unitário: unitPrice,
        valor_venda: salesValue,
        desconto: discount,
        valor_final: finalValue,
        custo: cost,
        lucro: profit
      });
    }
    
    // Aplicar filtros baseados no NLU, se especificados
    let filteredRecords = [...records];
    
    if (nluResult.filters && nluResult.filters.length > 0) {
      filteredRecords = records.filter(record => {
        return nluResult.filters.every(filter => {
          const fieldValue = record[filter.field];
          
          if (fieldValue === undefined) return true;
          
          switch (filter.operator) {
            case '=':
            case 'eq':
              return fieldValue == filter.value;
            case '>':
            case 'gt':
              return fieldValue > filter.value;
            case '<':
            case 'lt':
              return fieldValue < filter.value;
            case '>=':
            case 'gte':
              return fieldValue >= filter.value;
            case '<=':
            case 'lte':
              return fieldValue <= filter.value;
            case 'contains':
              return String(fieldValue).includes(String(filter.value));
            default:
              return true;
          }
        });
      });
    }
    
    // Aplicar filtro de período de tempo, se especificado
    if (nluResult.timeRange && nluResult.timeRange.period) {
      const currentDate = new Date();
      
      if (nluResult.timeRange.period === 'último trimestre') {
        const lastQuarterMonth = currentDate.getMonth() - 3;
        const lastQuarterYear = currentDate.getFullYear() + (lastQuarterMonth < 0 ? -1 : 0);
        
        filteredRecords = filteredRecords.filter(record => {
          const recordYear = parseInt(record.ano);
          const recordMonthIndex = months.indexOf(record.mês);
          
          if (recordYear === lastQuarterYear) {
            const normalizedMonth = lastQuarterMonth < 0 ? lastQuarterMonth + 12 : lastQuarterMonth;
            return recordMonthIndex >= normalizedMonth && recordMonthIndex < normalizedMonth + 3;
          }
          
          return false;
        });
      } else if (nluResult.timeRange.period === 'último ano') {
        const lastYear = currentDate.getFullYear() - 1;
        
        filteredRecords = filteredRecords.filter(record => {
          return parseInt(record.ano) === lastYear;
        });
      } else if (nluResult.timeRange.period === 'último mês') {
        const lastMonthIndex = currentDate.getMonth() - 1;
        const lastMonthYear = currentDate.getFullYear() + (lastMonthIndex < 0 ? -1 : 0);
        const lastMonth = months[lastMonthIndex < 0 ? lastMonthIndex + 12 : lastMonthIndex];
        
        filteredRecords = filteredRecords.filter(record => {
          return record.mês === lastMonth && parseInt(record.ano) === lastMonthYear;
        });
      }
    }
    
    return {
      records: filteredRecords,
      metadata: {
        source: 'mock_sales',
        timestamp: new Date().toISOString(),
        fields: {
          produto: { type: 'string', description: 'Nome do produto' },
          região: { type: 'string', description: 'Região de venda' },
          mês: { type: 'string', description: 'Mês da venda' },
          ano: { type: 'string', description: 'Ano da venda' },
          data: { type: 'string', description: 'Data completa da venda' },
          quantidade: { type: 'number', description: 'Quantidade vendida' },
          preço_unitário: { type: 'number', description: 'Preço unitário' },
          valor_venda: { type: 'number', description: 'Valor total da venda antes de descontos' },
          desconto: { type: 'number', description: 'Percentual de desconto aplicado' },
          valor_final: { type: 'number', description: 'Valor final após descontos' },
          custo: { type: 'number', description: 'Custo total dos produtos' },
          lucro: { type: 'number', description: 'Lucro obtido' }
        }
      }
    };
  }
  
  /**
   * Geradores de mock data para outros datasets
   */
  private generateProfitMockData(nluResult: DashboardNluResult): RawData {
    // Similar ao sales, mas focado em dados de lucro
    return this.generateSalesMockData(nluResult);
  }
  
  private generateRevenueMockData(nluResult: DashboardNluResult): RawData {
    // Similar ao sales, mas focado em dados de receita
    return this.generateSalesMockData(nluResult);
  }
  
  private generateCustomersMockData(nluResult: DashboardNluResult): RawData {
    // Dados de clientes
    return this.generateSalesMockData(nluResult);
  }
  
  private generateProductsMockData(nluResult: DashboardNluResult): RawData {
    // Dados de produtos
    return this.generateSalesMockData(nluResult);
  }
  
  private generateRegionsMockData(nluResult: DashboardNluResult): RawData {
    // Dados específicos de regiões
    return this.generateSalesMockData(nluResult);
  }
  
  private generateTimeMockData(nluResult: DashboardNluResult): RawData {
    // Dados temporais
    return this.generateSalesMockData(nluResult);
  }
} 