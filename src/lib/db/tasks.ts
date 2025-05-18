/**
 * Este módulo contém as funções para manipulação de tarefas no banco de dados.
 * Para esta versão inicial, usamos armazenamento em memória para simplificar,
 * mas pode ser facilmente adaptado para um banco de dados real.
 */

// Simulação de banco de dados em memória
let tasksStore: Record<string, any> = {};

// Tarefas padrão para inicialização
const defaultTasks = [
  { 
    id: '1',
    text: "Praticar 30 minutos de yoga",
    description: "Seguir a rotina de yoga matinal para melhorar flexibilidade e foco",
    tag: "Saúde",
    emoji: "🧘‍♀️",
    time: "07h30",
    dueDate: new Date().toISOString(),
    priority: "medium",
    section: "hoje",
    checked: false 
  },
  { 
    id: '2',
    text: "Consulta no dentista",
    description: "Checkup semestral e limpeza",
    tag: "Compromissos",
    emoji: "🦷",
    time: "10h00",
    dueDate: new Date().toISOString(),
    priority: "high",
    section: "hoje",
    checked: false 
  },
  { 
    id: '3',
    text: "Comprar pão",
    description: "Passar na padaria do bairro",
    tag: "Lista de compras",
    emoji: "🥖",
    time: "",
    dueDate: new Date().toISOString(),
    priority: "low",
    section: "hoje",
    checked: false 
  },
  { 
    id: '4',
    text: "Planejar sessões de pesquisas do usuário",
    description: "Preparar roteiro e selecionar participantes para as entrevistas",
    tag: "Reuniões do dia",
    emoji: "👥",
    time: "15h00",
    dueDate: new Date().toISOString(),
    priority: "high",
    section: "equipe",
    checked: false 
  }
];

// Inicialização imediata com tarefas padrão se o armazenamento estiver vazio
(function initializeTasksStore() {
  if (Object.keys(tasksStore).length === 0) {
    console.log('Tasks DB: Inicializando armazenamento com tarefas padrão');
    defaultTasks.forEach(task => {
      tasksStore[task.id] = task;
    });
  }
})();

/**
 * Obtém o contexto de uma tarefa pelo ID
 */
export async function getTaskContext(taskId: string): Promise<any> {
  // Em produção, buscar do banco de dados
  try {
    console.log(`Buscando tarefa com ID ${taskId}. Tarefas disponíveis:`, Object.keys(tasksStore));
    
    const task = tasksStore[taskId];
    if (!task) {
      console.warn(`Tarefa com ID ${taskId} não encontrada`);
      return null;
    }
    console.log(`Tarefa encontrada:`, task);
    return task;
  } catch (error) {
    console.error('Erro ao buscar contexto da tarefa:', error);
    return null;
  }
}

/**
 * Cria uma nova tarefa
 */
export async function createTask(taskData: any): Promise<any> {
  try {
    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTask = {
      id,
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checked: false
    };
    
    // Em produção, salvar no banco de dados
    tasksStore[id] = newTask;
    
    return newTask;
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    throw new Error('Falha ao criar tarefa');
  }
}

/**
 * Atualiza uma tarefa existente
 */
export async function updateTask(taskId: string, updateData: any): Promise<any> {
  try {
    const task = tasksStore[taskId];
    if (!task) {
      throw new Error(`Tarefa com ID ${taskId} não encontrada`);
    }
    
    const updatedTask = {
      ...task,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    // Em produção, atualizar no banco de dados
    tasksStore[taskId] = updatedTask;
    
    return updatedTask;
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    throw new Error('Falha ao atualizar tarefa');
  }
}

/**
 * Exclui uma tarefa
 */
export async function deleteTask(taskId: string): Promise<void> {
  try {
    if (!tasksStore[taskId]) {
      throw new Error(`Tarefa com ID ${taskId} não encontrada`);
    }
    
    // Em produção, excluir do banco de dados
    delete tasksStore[taskId];
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    throw new Error('Falha ao excluir tarefa');
  }
}

/**
 * Marca uma tarefa como concluída
 */
export async function completeTask(taskId: string): Promise<any> {
  try {
    const task = tasksStore[taskId];
    if (!task) {
      throw new Error(`Tarefa com ID ${taskId} não encontrada`);
    }
    
    const completedTask = {
      ...task,
      checked: true,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Em produção, atualizar no banco de dados
    tasksStore[taskId] = completedTask;
    
    return completedTask;
  } catch (error) {
    console.error('Erro ao concluir tarefa:', error);
    throw new Error('Falha ao concluir tarefa');
  }
}

/**
 * Lista todas as tarefas
 */
export async function listTasks(): Promise<any[]> {
  try {
    // Em produção, buscar do banco de dados
    console.log('Tasks DB: tasksStore contém', Object.keys(tasksStore).length, 'tarefas');
    console.log('Tasks DB: Conteúdo do tasksStore:', JSON.stringify(tasksStore));
    return Object.values(tasksStore);
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    throw new Error('Falha ao listar tarefas');
  }
}

/**
 * Obtém uma tarefa pelo ID
 */
export async function getTaskById(taskId: string): Promise<any> {
  try {
    const task = tasksStore[taskId];
    if (!task) {
      throw new Error(`Tarefa com ID ${taskId} não encontrada`);
    }
    return task;
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error);
    throw new Error('Falha ao buscar tarefa');
  }
}

/**
 * Sintetiza os dados de tarefas do frontend para o banco de dados local
 * Esta função é necessária para sincronizar as tarefas da UI com o
 * armazenamento local usado pelos agentes.
 */
export function syncTasksFromFrontend(tasks: any[]): void {
  try {
    // Convertendo array para um objeto indexado por ID
    const tasksById: Record<string, any> = {};
    
    console.log("Sincronizando tarefas do frontend:", tasks.length, "tarefas");
    console.log("Detalhes das tarefas:", tasks.map(t => ({ id: t.id, text: t.text, priority: t.priority })));
    
    // Processa as tarefas recebidas do frontend
    tasks.forEach(task => {
      if (!task.id) {
        console.warn("Tarefa sem ID ignorada:", task);
        return;
      }
      tasksById[task.id] = task;
    });
    
    // Substituindo completamente o armazenamento
    tasksStore = tasksById;
    
    console.log("Armazenamento em memória atualizado com sucesso. Tarefas disponíveis:", Object.keys(tasksStore).length);
    console.log("IDs das tarefas no armazenamento:", Object.keys(tasksStore));
  } catch (error) {
    console.error("Erro ao sincronizar tarefas do frontend:", error);
  }
} 