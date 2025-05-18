import { ProcessedData } from './data-processor';

/**
 * Interface para opções de renderização
 */
export interface RenderOptions {
  container: HTMLElement;
  width?: number;
  height?: number;
  theme?: 'light' | 'dark';
  animation?: boolean;
}

/**
 * Classe responsável por renderizar visualizações de dados
 */
export class DashboardRenderer {
  private options: RenderOptions;
  
  constructor(options: RenderOptions) {
    this.options = {
      width: 600,
      height: 400,
      theme: 'light',
      animation: true,
      ...options
    };
  }
  
  /**
   * Renderiza os dados processados no container especificado
   */
  async render(data: ProcessedData): Promise<void> {
    console.log('DashboardRenderer: Renderizando dados processados:', data);
    
    // Aplicar validações e correções nos dados antes de renderizar
    this.validateData(data);
    
    // Limpar o container antes de renderizar
    this.options.container.innerHTML = '';
    
    // Renderiza o gráfico apropriado com base no tipo
    switch (data.chartType) {
      case 'bar':
        await this.renderBarChart(data);
        break;
      case 'line':
        await this.renderLineChart(data);
        break;
      case 'pie':
        await this.renderPieChart(data);
        break;
      case 'column':
        await this.renderColumnChart(data);
        break;
      case 'area':
        await this.renderAreaChart(data);
        break;
      default:
        console.warn(`DashboardRenderer: Tipo de gráfico não suportado: ${data.chartType}`);
        this.renderUnsupportedChart(data);
    }
  }
  
  /**
   * Valida e corrige possíveis problemas nos dados antes da renderização
   */
  private validateData(data: ProcessedData): void {
    // Verifica se existem dados
    if (!data.data || data.data.length === 0) {
      console.warn('DashboardRenderer: Dados vazios para renderização');
      data.data = [{ category: 'Sem dados', value: 0 }];
    }
    
    // Verifica valores nulos ou undefined em propriedades essenciais
    data.data = data.data.map(item => {
      // Garante que value seja um número
      if (typeof item.value !== 'number' || isNaN(item.value)) {
        console.warn(`DashboardRenderer: Valor inválido para ${item.category}: ${item.value}`);
        item.value = 0;
      }
      
      // Garante que category tenha um valor
      if (!item.category) {
        console.warn('DashboardRenderer: Categoria indefinida');
        item.category = 'Desconhecido';
      }
      
      return item;
    });
    
    // Garante que o título esteja definido
    if (!data.title) {
      data.title = 'Visualização de Dados';
    }
  }
  
  /**
   * Renderiza um gráfico de barras
   */
  private async renderBarChart(data: ProcessedData): Promise<void> {
    console.log('DashboardRenderer: Renderizando gráfico de barras');
    // Implementação específica para gráfico de barras
    this.createChartContainer(data.title);
  }
  
  /**
   * Renderiza um gráfico de linha
   */
  private async renderLineChart(data: ProcessedData): Promise<void> {
    console.log('DashboardRenderer: Renderizando gráfico de linhas');
    // Implementação específica para gráfico de linha
    this.createChartContainer(data.title);
  }
  
  /**
   * Renderiza um gráfico de pizza
   */
  private async renderPieChart(data: ProcessedData): Promise<void> {
    console.log('DashboardRenderer: Renderizando gráfico de pizza');
    // Implementação específica para gráfico de pizza
    this.createChartContainer(data.title);
  }
  
  /**
   * Renderiza um gráfico de colunas
   */
  private async renderColumnChart(data: ProcessedData): Promise<void> {
    console.log('DashboardRenderer: Renderizando gráfico de colunas');
    // Implementação específica para gráfico de colunas
    this.createChartContainer(data.title);
  }
  
  /**
   * Renderiza um gráfico de área
   */
  private async renderAreaChart(data: ProcessedData): Promise<void> {
    console.log('DashboardRenderer: Renderizando gráfico de área');
    // Implementação específica para gráfico de área
    this.createChartContainer(data.title);
  }
  
  /**
   * Renderiza uma mensagem para tipo de gráfico não suportado
   */
  private renderUnsupportedChart(data: ProcessedData): void {
    console.log('DashboardRenderer: Renderizando mensagem para tipo não suportado');
    
    const container = document.createElement('div');
    container.className = 'unsupported-chart';
    container.style.width = `${this.options.width}px`;
    container.style.height = `${this.options.height}px`;
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.border = '1px dashed #ccc';
    container.style.borderRadius = '4px';
    
    const title = document.createElement('h3');
    title.textContent = data.title || 'Visualização de Dados';
    
    const message = document.createElement('p');
    message.textContent = `Tipo de gráfico não suportado: ${data.chartType}`;
    
    container.appendChild(title);
    container.appendChild(message);
    
    this.options.container.appendChild(container);
  }
  
  /**
   * Cria o container para o gráfico com título
   */
  private createChartContainer(title: string): HTMLElement {
    const container = document.createElement('div');
    container.className = 'chart-container';
    container.style.width = `${this.options.width}px`;
    container.style.height = `${this.options.height}px`;
    
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.style.textAlign = 'center';
    titleElement.style.margin = '0 0 16px 0';
    
    const chartElement = document.createElement('div');
    chartElement.className = 'chart';
    chartElement.style.width = '100%';
    chartElement.style.height = `${(this.options.height || 400) - 40}px`;
    
    container.appendChild(titleElement);
    container.appendChild(chartElement);
    
    this.options.container.appendChild(container);
    
    return chartElement;
  }
} 