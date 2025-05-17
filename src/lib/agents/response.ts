/**
 * Interface para entrada do agente de resposta
 */
interface ResponseInput {
  nluResult: any
  taskResult?: any
  message: string
  taskContext?: any
}

/**
 * Interface para a resposta gerada pelo agente
 */
interface GeneratedResponse {
  text: string
  followupQuestion?: string
}

import { OrumaivAgent } from './adk-agent';
import { getGoogleApiKey } from '../config/api-keys';

/**
 * Agente responsável por gerar respostas em linguagem natural
 */
export class ResponseAgent {
  private adkAgent: OrumaivAgent | null = null;
  
  constructor() {
    try {
      // Inicializa o agente ADK com a chave do gerenciador de configuração
      const apiKey = getGoogleApiKey();
      this.adkAgent = new OrumaivAgent({
        apiKey,
        model: 'gemini-2.0-flash',
        temperature: 0.7,
      });
      
      if (this.adkAgent.isInitialized()) {
        console.log('ResponseAgent: OrumaivAgent inicializado com sucesso');
      } else {
        console.warn(`ResponseAgent: OrumaivAgent não inicializado. Erro: ${this.adkAgent.getInitError()}`);
        this.adkAgent = null;
      }
    } catch (error: any) {
      console.error('ResponseAgent: Erro ao inicializar OrumaivAgent:', error);
      this.adkAgent = null;
    }
  }

  /**
   * Gera uma mensagem automática de boas-vindas quando o chat é aberto
   */
  async generateWelcomeMessage(taskContext: any, taskTitle: string): Promise<GeneratedResponse> {
    // Usa o agente ADK para gerar a mensagem de boas-vindas se disponível
    if (this.adkAgent && this.adkAgent.isInitialized()) {
      try {
        const welcomeMessage = await this.adkAgent.generateWelcomeMessage(taskContext, taskTitle);
        return {
          text: welcomeMessage
        };
      } catch (error) {
        console.error('ResponseAgent: Erro ao gerar mensagem de boas-vindas com ADK:', error);
        // Fallback para geração local
      }
    }
    
    // Fallback para quando o ADK não está disponível
    if (!taskContext) {
      return {
        text: 'Olá! Estou aqui para ajudar com suas tarefas. No momento, não temos informações detalhadas sobre esta tarefa. Como posso ajudar?'
      }
    }
    
    // Criamos uma mensagem detalhada com base no contexto da tarefa
    let welcomeText = `Olá! Estou vendo que você está trabalhando na tarefa "${taskContext.text}".`
    
    // Adicionamos detalhes da tarefa
    welcomeText += `\n\nAqui está um resumo:`;
    
    if (taskContext.description) {
      welcomeText += `\n• Descrição: ${taskContext.description}`;
    }
    
    if (taskContext.time) {
      welcomeText += `\n• Agendada para: ${taskContext.time}`;
    }
    
    if (taskContext.dueDate) {
      welcomeText += `\n• Data: ${taskContext.dueDate}`;
    }
    
    if (taskContext.priority) {
      const priorities = {
        high: 'Alta',
        medium: 'Média',
        low: 'Baixa'
      };
      welcomeText += `\n• Prioridade: ${priorities[taskContext.priority as keyof typeof priorities] || taskContext.priority}`;
    }
    
    // Adicionamos sugestões baseadas no tipo de tarefa
    const taskLower = taskContext.text.toLowerCase();
    
    if (taskLower.includes('reuni') || taskLower.includes('session') || taskLower.includes('pesquisa') || taskLower.includes('entrevista')) {
      welcomeText += `\n\nPosso ajudar você a preparar o roteiro, definir participantes ou agendar lembretes para esta sessão de pesquisa.`;
    } else if (taskLower.includes('compra') || taskLower.includes('pão') || taskLower.includes('lista')) {
      welcomeText += `\n\nPosso ajudar você a gerenciar sua lista de compras, adicionar itens ou definir um lembrete.`;
    } else if (taskLower.includes('consulta') || taskLower.includes('dentista') || taskLower.includes('médico')) {
      welcomeText += `\n\nPosso ajudar você a preparar-se para esta consulta, adicionar lembretes ou atualizar a descrição.`;
    } else if (taskLower.includes('yoga') || taskLower.includes('exercício') || taskLower.includes('praticar')) {
      welcomeText += `\n\nPosso ajudar você com lembretes para esta atividade ou sugerir como incluí-la em sua rotina regular.`;
    } else {
      welcomeText += `\n\nPosso ajudar você a gerenciar esta tarefa, definir lembretes ou fazer alterações.`;
    }
    
    // Terminamos com uma pergunta
    welcomeText += `\n\nComo posso ajudar com esta tarefa hoje?`;
    
    return {
      text: welcomeText
    };
  }
  
  /**
   * Gera uma resposta com base na análise NLU e resultado de operações de tarefa
   */
  async generateResponse(input: ResponseInput): Promise<GeneratedResponse> {
    const { nluResult, taskResult, message, taskContext } = input
    
    try {
      // Para intent de erro, retorna mensagem genérica
      if (nluResult.intent === 'error') {
        return {
          text: 'Desculpe, encontrei um problema ao processar sua mensagem. Poderia tentar novamente?'
        }
      }
      
      // Para perguntas específicas que não estão relacionadas a tarefas
      if (nluResult.intent === 'general_question') {
        // Usa o agente ADK para respostas a perguntas gerais, se disponível
        if (this.adkAgent && this.adkAgent.isInitialized() && nluResult.requiresExternalInfo) {
          try {
            const adkResponse = await this.adkAgent.sendMessage(message, { task: taskContext });
            return {
              text: adkResponse
            };
          } catch (error) {
            console.error('ResponseAgent: Erro ao gerar resposta com ADK:', error);
            // Fallback para geração local
          }
        }
        return this.generateSpecificAnswerResponse(message, taskContext)
      }
      
      // Para diferentes intenções, gera respostas específicas
      if (nluResult.intent.startsWith('task_')) {
        return this.generateTaskResponse(nluResult.intent, taskResult, message, taskContext)
      } else if (nluResult.intent === 'general_greeting') {
        return this.generateGreetingResponse(taskContext)
      } else if (nluResult.intent === 'general_help') {
        return this.generateHelpResponse(taskContext)
      } else {
        // Para perguntas gerais
        return this.generateGeneralResponse(nluResult, message, taskContext)
      }
    } catch (error) {
      console.error('Erro ao gerar resposta:', error)
      return {
        text: 'Desculpe, não consegui processar uma resposta adequada.'
      }
    }
  }
  
  /**
   * Gera resposta para perguntas específicas, usando conhecimento incorporado
   */
  private generateSpecificAnswerResponse(message: string, taskContext: any): GeneratedResponse {
    const lowerMessage = message.toLowerCase()
    
    // Perguntas sobre IA e conceitos relacionados
    if (lowerMessage.includes('mcp') && lowerMessage.includes('ia')) {
      return {
        text: 'MCP em IA geralmente se refere a "Modelo de Componentes Principais" ou em inglês "Principal Component Model", uma técnica usada para redução de dimensionalidade e análise de dados em inteligência artificial e aprendizado de máquina. Ajuda a identificar padrões importantes em conjuntos de dados complexos.'
      }
    }
    
    // Perguntas sobre o próprio assistente
    if (lowerMessage.includes('o que você') || lowerMessage.includes('quem é você')) {
      return {
        text: 'Sou Orumaiv, um assistente de IA projetado para ajudar com o gerenciamento das suas tarefas. Posso criar, atualizar e organizar suas atividades, além de fornecer informações úteis quando solicitado.'
      }
    }
    
    // Perguntas relacionadas à tarefa em contexto
    if (taskContext) {
      if (lowerMessage.includes('lembrar') || lowerMessage.includes('quando') || lowerMessage.includes('horário')) {
        return {
          text: `Sua tarefa "${taskContext.text}" ${taskContext.time ? `está agendada para ${taskContext.time}` : 'não tem um horário específico definido'}. ${taskContext.description ? `Detalhes: ${taskContext.description}` : ''}`
        }
      }
      
      if (lowerMessage.includes('detalhes') || lowerMessage.includes('sobre')) {
        return {
          text: `Esta tarefa é "${taskContext.text}". ${this.formatTaskInfo(taskContext)}`
        }
      }
    }
    
    // Fallback para quando não consegue responder especificamente
    return {
      text: 'Não tenho informações específicas sobre isso, mas estou aqui para ajudar com suas tarefas. Posso criar novas tarefas, atualizar existentes ou responder perguntas relacionadas ao seu gerenciador de tarefas.'
    }
  }
  
  /**
   * Gera resposta para ações relacionadas a tarefas
   */
  private generateTaskResponse(
    intent: string,
    taskResult: any,
    message: string,
    taskContext: any
  ): GeneratedResponse {
    // Verifica se houve erro na operação de tarefa
    if (taskResult?.error) {
      return {
        text: `Não foi possível ${this.getActionText(intent)}: ${taskResult.error}`
      }
    }
    
    // Gera resposta específica para cada tipo de operação
    switch (intent) {
      case 'task_create':
        if (taskResult?.success) {
          const taskTitle = taskResult.taskData?.text || 'nova tarefa'
          return {
            text: `Tarefa "${taskTitle}" criada com sucesso!`,
            followupQuestion: 'Gostaria de definir um lembrete para esta tarefa?'
          }
        }
        return {
          text: 'Não consegui criar a tarefa. Poderia tentar novamente com mais detalhes?'
        }
        
      case 'task_update':
        if (taskResult?.success) {
          return {
            text: 'Tarefa atualizada com sucesso!'
          }
        }
        return {
          text: 'Não foi possível atualizar a tarefa. Por favor, verifique se a tarefa existe.'
        }
        
      case 'task_delete':
        if (taskResult?.success) {
          return {
            text: 'Tarefa excluída com sucesso!'
          }
        }
        return {
          text: 'Não foi possível excluir a tarefa. Por favor, verifique se a tarefa existe.'
        }
        
      case 'task_complete':
        if (taskResult?.success) {
          return {
            text: 'Ótimo! Marquei a tarefa como concluída. Parabéns pelo progresso!'
          }
        }
        return {
          text: 'Não foi possível marcar a tarefa como concluída. Por favor, verifique se a tarefa existe.'
        }
        
      case 'task_list':
        return {
          text: 'As tarefas estão listadas na tela principal.',
          followupQuestion: 'Gostaria de filtrar por alguma categoria específica?'
        }
        
      case 'task_query':
        // Se temos contexto de uma tarefa específica
        if (taskContext) {
          return {
            text: `Informações sobre a tarefa "${taskContext.text}": ${this.formatTaskInfo(taskContext)}`
          }
        }
        return {
          text: 'Por favor, selecione uma tarefa específica para ver mais detalhes.'
        }
        
      default:
        return {
          text: 'Não entendi exatamente o que você gostaria de fazer com suas tarefas. Poderia ser mais específico?'
        }
    }
  }
  
  /**
   * Gera resposta para saudações considerando o contexto da tarefa
   */
  private generateGreetingResponse(taskContext: any): GeneratedResponse {
    const greetings = [
      'Olá! Como posso ajudar você hoje?',
      'Oi! O que você gostaria de fazer?',
      'Olá! Estou aqui para ajudar com suas tarefas.',
      'Ei! O que podemos organizar hoje?'
    ]
    
    const randomIndex = Math.floor(Math.random() * greetings.length)
    let greeting = greetings[randomIndex]
    
    // Adiciona contexto da tarefa se disponível
    if (taskContext) {
      greeting += ` Estou vendo que você está trabalhando na tarefa "${taskContext.text}".`
    }
    
    return {
      text: greeting,
      followupQuestion: taskContext 
        ? 'Gostaria de atualizar esta tarefa ou criar uma nova?'
        : 'Gostaria de criar uma nova tarefa ou gerenciar as existentes?'
    }
  }
  
  /**
   * Gera resposta para pedidos de ajuda
   */
  private generateHelpResponse(taskContext: any): GeneratedResponse {
    let helpText = `Posso ajudar você a:
1. Criar novas tarefas
2. Atualizar tarefas existentes
3. Marcar tarefas como concluídas
4. Excluir tarefas
5. Listar suas tarefas

Basta me dizer o que você precisa fazer.`

    if (taskContext) {
      helpText += `\n\nVocê está atualmente visualizando a tarefa "${taskContext.text}". Você pode me pedir para atualizá-la, concluí-la ou excluí-la.`
    }
    
    return {
      text: helpText
    }
  }
  
  /**
   * Gera resposta para perguntas gerais
   */
  private generateGeneralResponse(nluResult: any, message: string, taskContext: any): GeneratedResponse {
    if (message.toLowerCase().includes('o que você') || message.toLowerCase().includes('quem é você')) {
      return {
        text: 'Sou um assistente para ajudar com o gerenciamento das suas tarefas. Posso criar, atualizar e organizar suas atividades diárias.'
      }
    }
    
    let responseText = 'Estou aqui principalmente para ajudar com suas tarefas. Como posso auxiliar?';
    
    if (taskContext) {
      responseText = `Estou aqui para ajudar com suas tarefas. Você está atualmente visualizando "${taskContext.text}". Como posso ajudar com esta tarefa?`
    }
    
    return {
      text: responseText
    }
  }
  
  /**
   * Obtém o texto da ação a partir da intenção
   */
  private getActionText(intent: string): string {
    switch (intent) {
      case 'task_create': return 'criar a tarefa'
      case 'task_update': return 'atualizar a tarefa'
      case 'task_delete': return 'excluir a tarefa'
      case 'task_complete': return 'concluir a tarefa'
      case 'task_list': return 'listar as tarefas'
      default: return 'processar sua solicitação'
    }
  }
  
  /**
   * Formata informações da tarefa para exibição
   */
  private formatTaskInfo(task: any): string {
    const details = []
    
    if (task.description) {
      details.push(`Descrição: ${task.description}`)
    }
    
    if (task.dueDate) {
      details.push(`Data: ${task.dueDate}`)
    }
    
    if (task.time) {
      details.push(`Horário: ${task.time}`)
    }
    
    if (task.priority) {
      const priorities = {
        high: 'Alta',
        medium: 'Média',
        low: 'Baixa'
      }
      details.push(`Prioridade: ${priorities[task.priority as keyof typeof priorities] || task.priority}`)
    }
    
    if (task.tag) {
      details.push(`Categoria: ${task.tag}`)
    }
    
    return details.length > 0 ? details.join(', ') : 'Sem detalhes adicionais.'
  }
} 