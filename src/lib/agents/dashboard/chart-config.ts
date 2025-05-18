import { DashboardNluResult } from './dashboard-nlu';
import { ProcessedData } from './data-processor';

// Estendendo o tipo para metadados do ProcessedData para nossas necessidades
type ExtendedMetadata = {
  source: string;
  timestamp: string;
  type?: string;
  label?: string;
  [key: string]: any;
};

/**
 * Interface para a configuração de gráficos com Chart.js
 */
export interface ChartConfig {
  // Tipo de gráfico (bar, line, pie, doughnut, etc)
  chartType: string;
  // Dados formatados para Chart.js
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
      fill?: boolean;
      tension?: number;
    }>;
  };
  // Opções de configuração do Chart.js
  options: {
    responsive: boolean;
    maintainAspectRatio: boolean;
    plugins: {
      title?: {
        display: boolean;
        text: string;
      };
      legend?: {
        display: boolean;
        position?: 'top' | 'left' | 'bottom' | 'right';
      };
      tooltip?: {
        enabled: boolean;
      };
    };
    scales?: {
      x?: {
        title?: {
          display: boolean;
          text: string;
        };
      };
      y?: {
        title?: {
          display: boolean;
          text: string;
        };
        beginAtZero?: boolean;
      };
    };
  };
}

/**
 * Agente para configuração de gráficos
 */
export class ChartConfigAgent {
  /**
   * Gera configuração para gráficos baseado em dados processados e resultado NLU
   */
  generateChartConfig(processedData: ProcessedData, nluResult: DashboardNluResult): ChartConfig {
    // Determinar o tipo de gráfico em formato Chart.js
    const chartType = this.mapChartType(nluResult.chartType);
    
    // Extrair labels e datasets dos dados processados
    const { labels, datasets } = this.extractChartData(processedData, chartType);
    
    // Gerar títulos para eixos com base em métricas e dimensões
    const xAxisTitle = nluResult.dimensions?.[0] || '';
    const yAxisTitle = nluResult.metrics?.[0] || '';
    
    // Título do gráfico
    const title = this.generateTitle(nluResult);
    
    // Criar configuração do Chart.js
    return {
      chartType,
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!title,
            text: title
          },
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            enabled: true
          }
        },
        scales: chartType !== 'pie' && chartType !== 'doughnut' ? {
          x: {
            title: {
              display: !!xAxisTitle,
              text: xAxisTitle
            }
          },
          y: {
            title: {
              display: !!yAxisTitle,
              text: yAxisTitle
            },
            beginAtZero: true
          }
        } : undefined
      }
    };
  }

  /**
   * Mapeia o tipo de gráfico do NLU para o tipo do Chart.js
   */
  private mapChartType(chartType: string): string {
    const mapping: Record<string, string> = {
      'bar': 'bar',
      'barra': 'bar',
      'barras': 'bar',
      
      'line': 'line',
      'linha': 'line',
      'linhas': 'line',
      
      'pie': 'pie',
      'pizza': 'pie',
      
      'area': 'line', // Área é um gráfico de linha com fill=true
      'área': 'line',
      
      'column': 'bar',
      'coluna': 'bar',
      'colunas': 'bar',
      
      'scatter': 'scatter',
      'dispersão': 'scatter',
      
      'radar': 'radar',
      
      'doughnut': 'doughnut',
      'rosca': 'doughnut',
      
      'priority': 'bar',
      'prioridade': 'bar',
      'tarefas': 'bar'
    };
    
    // Primeiro verificar o tipo de gráfico específico
    const lowerChartType = chartType.toLowerCase();
    const mappedType = mapping[lowerChartType];
    
    // Se for explicitamente mencionado pizza/pie, SEMPRE usar gráfico de pizza
    if (lowerChartType === 'pizza' || lowerChartType === 'pie') {
      console.log('ChartConfig: Tipo de gráfico explicitamente definido como pizza/pie');
      return 'pie';
    }
    
    // Caso contrário, usar o mapeamento ou o padrão 'bar'
    return mappedType || 'bar';
  }

  /**
   * Extrai dados do processedData para o formato do Chart.js
   */
  private extractChartData(data: ProcessedData, chartType: string): { labels: string[], datasets: any[] } {
    // Cores padrão para os datasets
    const defaultColors = [
      'rgba(75, 192, 192, 0.6)',  // Verde água
      'rgba(255, 159, 64, 0.6)',  // Laranja
      'rgba(255, 99, 132, 0.6)',  // Rosa/Vermelho
      'rgba(54, 162, 235, 0.6)',  // Azul
      'rgba(153, 102, 255, 0.6)', // Roxo
      'rgba(255, 205, 86, 0.6)',  // Amarelo
      'rgba(201, 203, 207, 0.6)'  // Cinza
    ];
    
    // Cores para gráficos de prioridade
    const priorityColors: Record<string, string> = {
      'baixa': 'rgba(75, 192, 192, 0.8)', // Verde
      'média': 'rgba(255, 159, 64, 0.8)', // Laranja
      'alta': 'rgba(255, 99, 132, 0.8)'   // Vermelho
    };
    
    if (!data || !data.data || !Array.isArray(data.data)) {
      console.error('ChartConfig: Dados inválidos:', data);
      return { labels: [], datasets: [] };
    }
    
    console.log('ChartConfig: Tipo de gráfico:', chartType);
    console.log('ChartConfig: Processando dados:', JSON.stringify(data, null, 2));
    
    // Extrair labels dos dados (normalmente a propriedade de categoria)
    const labels = data.data.map(item => {
      const label = item.category || item.name || item.label || item.time || 'Desconhecido';
      console.log('ChartConfig: Label item:', label, 'Item original:', item);
      return label;
    });
    
    console.log('ChartConfig: Labels extraídos:', labels);
    
    // Para gráficos de pizza/rosca, precisamos cores específicas por item
    if (chartType === 'pie' || chartType === 'doughnut') {
      // Verificar se são dados de prioridade
      const isPriorityData = data.metadata?.source === 'tasks' || 
        labels.some(label => ['alta', 'média', 'baixa', 'high', 'medium', 'low'].includes(label.toLowerCase()));
      
      console.log('ChartConfig: É dados de prioridade?', isPriorityData);
      
      // Se forem dados de prioridade, usar cores específicas
      let backgroundColor;
      
      if (isPriorityData) {
        backgroundColor = data.data.map(item => {
          const label = (item.category || '').toLowerCase();
          console.log('ChartConfig: Label prioridade:', label, 'Cor:', priorityColors[label] || defaultColors[0]);
          return priorityColors[label] || defaultColors[0];
        });
      } else {
        backgroundColor = data.data.map((_, index) => 
          defaultColors[index % defaultColors.length]);
      }
      
      // Extrair valores numéricos
      const values = data.data.map(item => {
        const value = Number(item.value || 0);
        console.log('ChartConfig: Valor extraído:', value, 'de item:', item);
        return value;
      });
      
      console.log('ChartConfig: Gerando gráfico de pizza com dados:', {
        labels,
        values,
        backgroundColor
      });
      
      return {
        labels,
        datasets: [{
          label: data.title || 'Dados',
          data: values,
          backgroundColor
        }]
      };
    }
    
    // Para gráficos de prioridade com barras
    if (chartType === 'bar' && (data.metadata?.source === 'tasks' || labels.some(label => 
      ['alta', 'média', 'baixa', 'high', 'medium', 'low'].includes(label.toLowerCase())))) {
      
      // Cores especiais para prioridades
      const backgroundColors = data.data.map(item => {
        const label = (item.category || '').toLowerCase();
        return priorityColors[label] || defaultColors[0];
      });
      
      return {
        labels,
        datasets: [{
          label: data.title || 'Tarefas por Prioridade',
          data: data.data.map(item => item.value || 0),
          backgroundColor: backgroundColors
        }]
      };
    }
    
    // Para gráficos de área
    if (chartType === 'line' && (data.chartType === 'area' || data.chartType === 'área')) {
      return {
        labels,
        datasets: [{
          label: data.title || 'Dados',
          data: data.data.map(item => item.value || 0),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          fill: true,
          tension: 0.4
        }]
      };
    }
    
    // Para gráficos padrão de linha
    if (chartType === 'line') {
      return {
        labels,
        datasets: [{
          label: data.title || 'Dados',
          data: data.data.map(item => item.value || 0),
          borderColor: defaultColors[0],
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.4
        }]
      };
    }
    
    // Para gráficos de radar
    if (chartType === 'radar') {
      return {
        labels,
        datasets: [{
          label: data.title || 'Dados',
          data: data.data.map(item => item.value || 0),
          backgroundColor: defaultColors[0].replace('0.6', '0.2'),
          borderColor: defaultColors[0],
          borderWidth: 2
        }]
      };
    }
    
    // Para outros tipos de gráficos (linha, barra, etc)
    return {
      labels,
      datasets: [{
        label: data.title || 'Dados',
        data: data.data.map(item => item.value || 0),
        backgroundColor: defaultColors[0],
        borderColor: chartType === 'line' ? defaultColors[0] : undefined,
        borderWidth: 1
      }]
    };
  }

  /**
   * Gera um título para o gráfico com base no resultado NLU
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
} 