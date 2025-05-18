import { NluAgent } from './nlu'
import { TaskAgent } from './task'
import { ResponseAgent } from './response'
import { getTaskContext } from '../db/tasks'
import { OrumaivAgent } from './adk-agent'
import { getGoogleApiKey } from '../config/api-keys'
import { DashboardOrchestrator } from './dashboard/dashboard-orchestrator'
import { adkAgent } from './adk-agent-instance'

/**
 * Interface para o contexto da mensagem
 */
interface MessageContext {
  taskId?: string
  userId?: string
  previousMessages?: any[]
  isAutoWelcome?: boolean
}

/**
 * Interface para a resposta processada pelos agentes
 */
interface AgentResponse {
  content: string
  intent: string
  entities: Array<{name: string, value: string}>
  confidence: number
  taskUpdated?: boolean
  taskData?: any
  dashboardResult?: any // Adicionado para suportar resultados de dashboard
}

// Inicialização do orquestrador de dashboard
const dashboardOrchestrator = new DashboardOrchestrator(adkAgent);

/**
 * Processa uma mensagem através do orquestrador de agentes
 * 
 * @param message A mensagem a ser processada
 * @param context O contexto da mensagem (tarefa, usuário, etc.)
 * @returns A resposta processada pelos agentes
 */
export async function processMessageWithAgents(
  message: string,
  context: MessageContext
): Promise<AgentResponse> {
  try {
    console.log(`Orquestrador: Processando mensagem: "${message}" com contexto:`, context)
    
    // 1. Obtém contexto da tarefa se houver um ID de tarefa
    let taskContext = null
    if (context.taskId) {
      taskContext = await getTaskContext(context.taskId)
      console.log('Orquestrador: Contexto da tarefa:', taskContext)
    }
    
    // Se é uma mensagem automática de boas-vindas, tratamos diferente
    if (context.isAutoWelcome) {
      console.log('Orquestrador: Gerando mensagem automática de boas-vindas')
      
      // Tenta usar o ADK Agent para mensagem de boas-vindas
      if (adkAgent && adkAgent.isInitialized()) {
        try {
          const welcomeMessage = await adkAgent.generateWelcomeMessage(
            taskContext, 
            message.replace('welcome_auto_message:', '')
          );
          
          return {
            content: welcomeMessage,
            intent: 'welcome_message',
            entities: [],
            confidence: 1,
            taskUpdated: false
          }
        } catch (error) {
          console.error('Orquestrador: Erro ao gerar boas-vindas com ADK:', error);
          // Fallback para o ResponseAgent
        }
      } else {
        console.log('Orquestrador: ADK Agent não disponível, usando fallback para boas-vindas');
      }
      
      // Fallback para o ResponseAgent
      const responseAgent = new ResponseAgent()
      const welcomeResponse = await responseAgent.generateWelcomeMessage(
        taskContext, 
        message.replace('welcome_auto_message:', '')
      )
      return {
        content: welcomeResponse.text,
        intent: 'welcome_message',
        entities: [],
        confidence: 1,
        taskUpdated: false
      }
    }
    
    // 2. Processa a mensagem com o agente NLU para entender a intenção
    console.log('Orquestrador: Iniciando processamento NLU')
    const nluAgent = new NluAgent()
    try {
      const nluResult = await nluAgent.process(message, {
        task: taskContext,
        userId: context.userId
      })
      
      console.log('Orquestrador: Resultado do NLU:', nluResult)
      
      // 3. Verifica se é uma solicitação de dashboard
      if (nluResult.intent === 'dashboard_request' || 
          message.toLowerCase().includes('gráfico') || 
          message.toLowerCase().includes('dashboard') ||
          message.toLowerCase().includes('grafico') ||
          message.toLowerCase().includes('visualizar') ||
          message.toLowerCase().includes('mostrar dados') ||
          message.toLowerCase().includes('gerar chart')) {
        
        console.log('Orquestrador: Detectada solicitação de dashboard, redirecionando para DashboardOrchestrator');
        
        try {
          // Processar com o orquestrador de dashboard
          const dashboardResult = await dashboardOrchestrator.processDashboardRequest(message, {
            task: taskContext,
            userId: context.userId
          });
          
          // Gerar explicação para o dashboard
          const explanation = await dashboardOrchestrator.generateDashboardExplanation(dashboardResult);
          
          return {
            content: explanation,
            intent: 'dashboard_generation',
            entities: nluResult.entities,
            confidence: nluResult.confidence,
            taskUpdated: false,
            dashboardResult: dashboardResult
          };
        } catch (error: any) {
          console.error('Orquestrador: Erro ao processar dashboard:', error);
          return {
            content: `Desculpe, não consegui gerar o dashboard solicitado. Erro: ${error.message || 'Erro desconhecido'}`,
            intent: 'dashboard_generation_error',
            entities: nluResult.entities,
            confidence: nluResult.confidence,
            taskUpdated: false
          };
        }
      }
      
      // 4. Se estamos no modo conversacional, vai direto para o ADK
      if (nluResult.conversationalMode && adkAgent && adkAgent.isInitialized()) {
        console.log('Orquestrador: Modo conversacional detectado, usando ADK diretamente');
        try {
          const adkResponse = await adkAgent.sendMessage(message, { task: taskContext });
          
          return {
            content: adkResponse,
            intent: nluResult.intent,
            entities: nluResult.entities,
            confidence: nluResult.confidence,
            taskUpdated: false
          }
        } catch (error) {
          console.error('Orquestrador: Erro no modo conversacional:', error);
          // Continua com o fluxo padrão como fallback
        }
      }
      
      // 5. Executa operações relacionadas a tarefas, se necessário
      let taskResult = null
      let taskUpdated = false
      
      if (
        nluResult.intent.startsWith('task_') || 
        nluResult.requiresTaskAction
      ) {
        console.log('Orquestrador: Iniciando processamento de tarefa')
        const taskAgent = new TaskAgent()
        taskResult = await taskAgent.process({
          intent: nluResult.intent,
          entities: nluResult.entities,
          taskId: context.taskId,
          message
        })
        
        taskUpdated = taskResult.updated
        console.log('Orquestrador: Resultado do TaskAgent:', taskResult)
        
        // Após processamento da tarefa, verifica se deve gerar resposta conversacional
        if (taskResult.success && nluResult.conversationalMode && adkAgent && adkAgent.isInitialized()) {
          console.log('Orquestrador: Gerando explicação conversacional após ação de tarefa');
          try {
            // Adiciona contexto do resultado da operação
            const taskActionContext = { 
              task: taskContext,
              taskResult: taskResult,
              actionPerformed: true 
            };
            
            // Formata a pergunta para o ADK
            const actionSummary = `Você acabou de ${getActionDescription(nluResult.intent)} "${taskResult.taskData?.text || 'uma tarefa'}". Forneça uma resposta conversacional amigável.`;
            
            const adkResponse = await adkAgent.sendMessage(actionSummary, taskActionContext);
            
            return {
              content: adkResponse,
              intent: nluResult.intent,
              entities: nluResult.entities,
              confidence: nluResult.confidence,
              taskUpdated,
              taskData: taskResult?.taskData
            }
          } catch (error) {
            console.error('Orquestrador: Erro ao gerar explicação conversacional após ação:', error);
            // Continua com o fluxo normal
          }
        }
      }
      
      // 6. Para perguntas gerais, tenta usar diretamente o ADK agent
      if (nluResult.intent === 'general_question' && nluResult.requiresExternalInfo && adkAgent && adkAgent.isInitialized()) {
        try {
          console.log('Orquestrador: Usando ADK Agent diretamente para pergunta geral');
          const adkResponse = await adkAgent.sendMessage(message, { task: taskContext });
          
          return {
            content: adkResponse,
            intent: nluResult.intent,
            entities: nluResult.entities,
            confidence: nluResult.confidence,
            taskUpdated,
            taskData: taskResult?.taskData
          }
        } catch (error) {
          console.error('Orquestrador: Erro ao usar ADK diretamente:', error);
          // Continua com o fluxo normal usando ResponseAgent
        }
      } else if (nluResult.intent === 'general_question' && nluResult.requiresExternalInfo) {
        console.log('Orquestrador: ADK Agent não disponível para pergunta geral, usando fallback');
      }
      
      // 7. Gera uma resposta natural com o agente de resposta
      console.log('Orquestrador: Gerando resposta natural')
      const responseAgent = new ResponseAgent()
      const response = await responseAgent.generateResponse({
        nluResult,
        taskResult,
        message,
        taskContext
      })
      
      console.log('Orquestrador: Resposta gerada:', response)
      
      // 8. Retorna a resposta processada
      return {
        content: response.text,
        intent: nluResult.intent,
        entities: nluResult.entities,
        confidence: nluResult.confidence,
        taskUpdated,
        taskData: taskResult?.taskData
      }
    } catch (error: any) {
      console.error('Erro no processamento do agente NLU:', error)
      return {
        content: `Erro ao processar a mensagem: ${error.message || 'Erro desconhecido'}`,
        intent: 'error',
        entities: [],
        confidence: 0,
        taskUpdated: false
      }
    }
  } catch (error: any) {
    console.error('Erro no processamento da mensagem:', error)
    return {
      content: `Desculpe, ocorreu um erro ao processar sua mensagem: ${error.message || 'Erro desconhecido'}`,
      intent: 'error',
      entities: [],
      confidence: 0,
      taskUpdated: false
    }
  }
}

/**
 * Obtém uma descrição da ação com base na intenção
 */
function getActionDescription(intent: string): string {
  switch (intent) {
    case 'task_create':
      return 'criar a tarefa';
    case 'task_update':
      return 'atualizar a tarefa';
    case 'task_delete':
      return 'excluir a tarefa';
    case 'task_complete':
      return 'completar a tarefa';
    case 'task_reopen':
      return 'reabrir a tarefa';
    default:
      return 'gerenciar';
  }
} 