import { NluAgent } from './nlu'
import { TaskAgent } from './task'
import { ResponseAgent } from './response'
import { getTaskContext } from '../db/tasks'
import { OrumaivAgent } from './adk-agent'
import { getGoogleApiKey } from '../config/api-keys'

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
}

// Inicialização do agente ADK (singleton)
let adkAgent: OrumaivAgent | null = null;
try {
  // Obtém a chave da API do .env
  const apiKey = getGoogleApiKey();
  
  // Cria o agente apenas se a chave estiver configurada
  adkAgent = new OrumaivAgent({
    apiKey,
    model: 'gemini-2.0-flash',
    temperature: 0.7,
  });
  
  if (adkAgent.isInitialized()) {
    console.log('Orquestrador: OrumaivAgent inicializado com sucesso');
  } else {
    console.warn(`Orquestrador: OrumaivAgent não inicializado. Erro: ${adkAgent.getInitError()}`);
    adkAgent = null;
  }
} catch (error: any) {
  console.error('Orquestrador: Erro ao inicializar OrumaivAgent:', error);
  adkAgent = null;
}

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
      
      // 3. Se estamos no modo conversacional, vai direto para o ADK
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
      
      // 4. Executa operações relacionadas a tarefas, se necessário
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
      
      // 5. Para perguntas gerais, tenta usar diretamente o ADK agent
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
      
      // 6. Gera uma resposta natural com o agente de resposta
      console.log('Orquestrador: Gerando resposta natural')
      const responseAgent = new ResponseAgent()
      const response = await responseAgent.generateResponse({
        nluResult,
        taskResult,
        message,
        taskContext
      })
      
      console.log('Orquestrador: Resposta gerada:', response)
      
      // 7. Retorna a resposta processada
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
    console.error('Erro no orquestrador de agentes:', error)
    return {
      content: `Desculpe, encontrei um problema ao processar sua mensagem: ${error.message || 'Erro desconhecido'}`,
      intent: 'error',
      entities: [],
      confidence: 0
    }
  }
}

/**
 * Obtém uma descrição da ação realizada com base na intenção
 */
function getActionDescription(intent: string): string {
  switch (intent) {
    case 'task_create': return 'criar a tarefa';
    case 'task_update': return 'atualizar a tarefa';
    case 'task_delete': return 'excluir a tarefa';
    case 'task_complete': return 'completar a tarefa';
    default: return 'processar a tarefa';
  }
} 