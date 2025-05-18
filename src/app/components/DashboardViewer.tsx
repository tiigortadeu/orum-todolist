import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

// Registrar os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardViewerProps {
  dashboardResult?: any;
  isLoading?: boolean;
}

/**
 * Componente para visualização de dashboards gerados com Chart.js
 */
const DashboardViewer: React.FC<DashboardViewerProps> = ({ dashboardResult, isLoading = false }) => {
  // Se está carregando, mostra um indicador de carregamento
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-gray-200 rounded-lg bg-gray-50 p-4">
        <div className="w-12 h-12 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Gerando dashboard...</p>
      </div>
    );
  }
  
  // Se não há resultado, mostra uma mensagem
  if (!dashboardResult) {
    return (
      <div className="flex items-center justify-center h-64 border border-gray-200 rounded-lg bg-gray-50 p-4">
        <p className="text-gray-600">Faça uma pergunta para gerar um dashboard.</p>
      </div>
    );
  }

  // Se houve um erro, mostra a mensagem de erro
  if (dashboardResult.error) {
    return (
      <div className="flex items-center justify-center h-64 border border-gray-200 rounded-lg bg-gray-50 p-4">
        <p className="text-red-500">{dashboardResult.error}</p>
      </div>
    );
  }

  // Renderiza o gráfico com base no tipo
  const renderChart = () => {
    if (!dashboardResult.chartConfig) {
      return <p className="text-red-500">Configuração de gráfico inválida</p>;
    }

    const { chartType, data, options } = dashboardResult.chartConfig;
    
    if (!data) {
      return <p className="text-red-500">Dados de gráfico inválidos</p>;
    }

    // Renderiza diferentes tipos de gráficos com base no chartType
    switch (chartType) {
      case 'bar':
        return <Bar data={data} options={options} />;
      case 'line':
        return <Line data={data} options={options} />;
      case 'pie':
        return <Pie data={data} options={options} />;
      case 'doughnut':
        return <Doughnut data={data} options={options} />;
      default:
        return <p className="text-red-500">Tipo de gráfico não suportado: {chartType}</p>;
    }
  };

  return (
    <div className="dashboard-viewer h-80">
      {renderChart()}
    </div>
  );
};

export default DashboardViewer; 