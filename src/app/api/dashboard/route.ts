import { NextRequest, NextResponse } from 'next/server';
import { DashboardOrchestrator } from '@/lib/agents/dashboard/dashboard-orchestrator';
import { adkAgent } from '@/lib/agents/adk-agent-instance';

/**
 * Endpoint para gerar dashboards
 * 
 * Este endpoint recebe uma solicitação para geração de dashboard em linguagem natural
 * e retorna o dashboard gerado pelos agentes.
 */
export async function POST(req: NextRequest) {
  try {
    // Extrair parâmetros da solicitação
    const requestData = await req.json();
    const { message, userId, taskId, context } = requestData;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem não fornecida' },
        { status: 400 }
      );
    }
    
    console.log(`API Dashboard: Recebida solicitação - "${message}"`);
    
    // Inicializar o orquestrador de dashboard
    const dashboardOrchestrator = new DashboardOrchestrator(adkAgent);
    
    // Processar a solicitação
    const dashboardResult = await dashboardOrchestrator.processDashboardRequest(message, {
      userId,
      taskId,
      ...context
    });
    
    // Gerar explicação para o dashboard
    const explanation = await dashboardOrchestrator.generateDashboardExplanation(dashboardResult);
    
    // Retornar resposta
    return NextResponse.json({
      success: dashboardResult.success,
      explanation,
      dashboardResult
    });
  } catch (error: any) {
    console.error('API Dashboard: Erro ao processar solicitação:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Erro desconhecido ao processar a solicitação de dashboard',
        dashboardResult: null
      },
      { status: 500 }
    );
  }
}

/**
 * Endpoint para explicar dashboards existentes
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const dashboardId = searchParams.get('dashboardId');
    const message = searchParams.get('message') || 'Explique este dashboard';
    
    if (!dashboardId) {
      return NextResponse.json(
        { error: 'ID do dashboard não fornecido' },
        { status: 400 }
      );
    }
    
    console.log(`API Dashboard: Solicitação de explicação para dashboard ${dashboardId}`);
    
    // Inicializar o orquestrador de dashboard
    const dashboardOrchestrator = new DashboardOrchestrator(adkAgent);
    
    // Solicitar explicação
    const explanation = await dashboardOrchestrator.explainExistingDashboard(dashboardId, message);
    
    // Retornar resposta
    return NextResponse.json({
      success: true,
      dashboardId,
      explanation
    });
  } catch (error: any) {
    console.error('API Dashboard: Erro ao explicar dashboard:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Erro desconhecido ao explicar o dashboard'
      },
      { status: 500 }
    );
  }
} 