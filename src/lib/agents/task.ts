import { createTask, updateTask, deleteTask, completeTask } from '../db/tasks'

/**
 * Interface para os parâmetros de entrada do TaskAgent
 */
interface TaskAgentInput {
  intent: string
  entities: Array<{name: string, value: string}>
  taskId?: string
  message: string
}

/**
 * Interface para o resultado da operação do TaskAgent
 */
interface TaskResult {
  success: boolean
  updated: boolean
  action: string
  taskData?: any
  error?: string
}

/**
 * Agente para operações relacionadas a tarefas
 */
export class TaskAgent {
  /**
   * Processa uma operação de tarefa com base na intenção detectada
   */
  async process(input: TaskAgentInput): Promise<TaskResult> {
    try {
      const { intent, entities, taskId, message } = input
      
      console.log(`Processando operação de tarefa com intent: ${intent}`)
      
      // Para ambiente de desenvolvimento/teste sem banco de dados, 
      // use simulação de operações
      if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
        return this.getMockTaskResult(intent, entities, taskId)
      }
      
      // Executa a operação baseada na intenção detectada
      switch (intent) {
        case 'task_create':
          return await this.createNewTask(entities, message)
        
        case 'task_update':
          if (!taskId) {
            return {
              success: false,
              updated: false,
              action: 'update',
              error: 'Nenhuma tarefa selecionada para atualizar'
            }
          }
          return await this.updateExistingTask(taskId, entities)
          
        case 'task_delete':
          if (!taskId) {
            return {
              success: false,
              updated: false,
              action: 'delete',
              error: 'Nenhuma tarefa selecionada para excluir'
            }
          }
          return await this.deleteExistingTask(taskId)
          
        case 'task_complete':
          if (!taskId) {
            return {
              success: false,
              updated: false,
              action: 'complete',
              error: 'Nenhuma tarefa selecionada para concluir'
            }
          }
          return await this.completeExistingTask(taskId)
          
        case 'task_list':
          // Operação de listagem é tratada no frontend, sem alteração no banco
          return {
            success: true,
            updated: false,
            action: 'list'
          }
          
        case 'task_query':
          // Consulta de informações sobre tarefas não altera o banco
          return {
            success: true,
            updated: false,
            action: 'query'
          }
        
        default:
          // Para outras intenções, não realiza operações em tarefas
          return {
            success: true,
            updated: false,
            action: 'none'
          }
      }
    } catch (error) {
      console.error('Erro ao processar operação de tarefa:', error)
      return {
        success: false,
        updated: false,
        action: 'error',
        error: error.message || 'Erro desconhecido ao processar operação'
      }
    }
  }
  
  /**
   * Cria uma nova tarefa a partir das entidades extraídas
   */
  private async createNewTask(
    entities: Array<{name: string, value: string}>, 
    message: string
  ): Promise<TaskResult> {
    try {
      // Extrai dados das entidades para criar a tarefa
      const taskData = this.extractTaskDataFromEntities(entities, message)
      
      // Em produção, chama a função do banco de dados para criar a tarefa
      const newTask = await createTask(taskData)
      
      return {
        success: true,
        updated: true,
        action: 'create',
        taskData: newTask
      }
    } catch (error) {
      console.error('Erro ao criar tarefa:', error)
      return {
        success: false,
        updated: false,
        action: 'create',
        error: error.message || 'Erro ao criar tarefa'
      }
    }
  }
  
  /**
   * Atualiza uma tarefa existente com base nas entidades extraídas
   */
  private async updateExistingTask(
    taskId: string,
    entities: Array<{name: string, value: string}>
  ): Promise<TaskResult> {
    try {
      // Extrai campos a serem atualizados das entidades
      const updateData = this.extractTaskDataFromEntities(entities)
      
      // Atualiza a tarefa no banco de dados
      const updatedTask = await updateTask(taskId, updateData)
      
      return {
        success: true,
        updated: true,
        action: 'update',
        taskData: updatedTask
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
      return {
        success: false,
        updated: false,
        action: 'update',
        error: error.message || 'Erro ao atualizar tarefa'
      }
    }
  }
  
  /**
   * Exclui uma tarefa existente
   */
  private async deleteExistingTask(taskId: string): Promise<TaskResult> {
    try {
      await deleteTask(taskId)
      
      return {
        success: true,
        updated: true,
        action: 'delete'
      }
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error)
      return {
        success: false,
        updated: false,
        action: 'delete',
        error: error.message || 'Erro ao excluir tarefa'
      }
    }
  }
  
  /**
   * Marca uma tarefa como concluída
   */
  private async completeExistingTask(taskId: string): Promise<TaskResult> {
    try {
      const completedTask = await completeTask(taskId)
      
      return {
        success: true,
        updated: true,
        action: 'complete',
        taskData: completedTask
      }
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error)
      return {
        success: false,
        updated: false,
        action: 'complete',
        error: error.message || 'Erro ao concluir tarefa'
      }
    }
  }
  
  /**
   * Extrai dados de tarefa das entidades detectadas
   */
  private extractTaskDataFromEntities(
    entities: Array<{name: string, value: string}>,
    message?: string
  ): any {
    const taskData: any = {}
    
    // Texto da tarefa - usa o texto da mensagem ou um valor específico
    const titleEntity = entities.find(e => e.name === 'title' || e.name === 'task_name')
    if (titleEntity) {
      taskData.text = titleEntity.value
    } else if (message && !taskData.text) {
      // Extrai um título razoável da mensagem, limitando a 100 caracteres
      taskData.text = message.split(/[.!?]/)
        .filter(s => s.trim().length > 0)[0]
        ?.trim()
        .substring(0, 100) || 'Nova tarefa'
    }
    
    // Descrição
    const descEntity = entities.find(e => e.name === 'description')
    if (descEntity) {
      taskData.description = descEntity.value
    }
    
    // Data
    const dateEntity = entities.find(e => ['date', 'due_date', 'deadline'].includes(e.name))
    if (dateEntity) {
      // Converte texto de data em formato ISO para armazenamento
      taskData.dueDate = this.parseDate(dateEntity.value)
    }
    
    // Hora
    const timeEntity = entities.find(e => e.name === 'time')
    if (timeEntity) {
      taskData.time = timeEntity.value
    }
    
    // Prioridade
    const priorityEntity = entities.find(e => e.name === 'priority')
    if (priorityEntity) {
      // Converte texto em nível de prioridade
      const value = priorityEntity.value.toLowerCase()
      if (value.includes('alta') || value.includes('urgente')) {
        taskData.priority = 'high'
      } else if (value.includes('média')) {
        taskData.priority = 'medium'
      } else if (value.includes('baixa')) {
        taskData.priority = 'low'
      }
    }
    
    // Categoria/Tag
    const categoryEntity = entities.find(e => ['category', 'tag', 'type'].includes(e.name))
    if (categoryEntity) {
      taskData.tag = categoryEntity.value
    }
    
    return taskData
  }
  
  /**
   * Converte texto de data em ISO date string
   */
  private parseDate(dateText: string): string {
    try {
      if (dateText.toLowerCase() === 'hoje') {
        return new Date().toISOString().split('T')[0]
      } else if (dateText.toLowerCase() === 'amanhã') {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString().split('T')[0]
      } else {
        // Tenta converter a string em um objeto Date
        const date = new Date(dateText)
        return date.toISOString().split('T')[0]
      }
    } catch (error) {
      console.warn('Erro ao converter data:', error)
      return new Date().toISOString().split('T')[0]
    }
  }
  
  /**
   * Gera um resultado simulado para teste sem banco de dados
   */
  private getMockTaskResult(
    intent: string, 
    entities: Array<{name: string, value: string}>,
    taskId?: string
  ): TaskResult {
    // Para intenções que requerem um ID de tarefa, verifica se existe
    if (
      ['task_update', 'task_delete', 'task_complete'].includes(intent) &&
      !taskId
    ) {
      return {
        success: false,
        updated: false,
        action: intent.replace('task_', ''),
        error: 'Nenhuma tarefa selecionada'
      }
    }
    
    // Simula o resultado de acordo com a intenção
    switch (intent) {
      case 'task_create':
        return {
          success: true,
          updated: true,
          action: 'create',
          taskData: {
            id: Date.now().toString(),
            text: this.extractTaskDataFromEntities(entities).text || 'Nova tarefa',
            checked: false,
            priority: 'medium',
            dueDate: new Date().toISOString().split('T')[0]
          }
        }
        
      case 'task_update':
        return {
          success: true,
          updated: true,
          action: 'update',
          taskData: {
            id: taskId,
            ...this.extractTaskDataFromEntities(entities)
          }
        }
        
      case 'task_delete':
        return {
          success: true,
          updated: true,
          action: 'delete'
        }
        
      case 'task_complete':
        return {
          success: true,
          updated: true,
          action: 'complete',
          taskData: {
            id: taskId,
            checked: true
          }
        }
        
      default:
        return {
          success: true,
          updated: false,
          action: 'none'
        }
    }
  }
} 