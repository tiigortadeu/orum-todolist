import * as tasksDb from '../db/tasks';

/**
 * Interface para representar uma tarefa
 */
export interface Task {
  id: string;
  text: string;
  description?: string;
  tag?: string;
  emoji?: string;
  time?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  section?: string;
  checked: boolean;
}

/**
 * Busca todas as tarefas do banco de dados
 */
export async function getTasks(): Promise<Task[]> {
  try {
    // Busca tarefas usando o módulo de tarefas existente
    const tasks = await tasksDb.listTasks();
    console.log('Task-Service: Tarefas recuperadas do banco:', JSON.stringify(tasks));
    return tasks;
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    
    // Em caso de erro, retorna uma lista vazia
    return [];
  }
}

/**
 * Salva uma nova tarefa no banco de dados
 */
export async function saveTask(task: Task): Promise<Task> {
  try {
    // Salva a tarefa usando o módulo de tarefas existente
    const savedTask = await tasksDb.createTask(task);
    return savedTask;
  } catch (error) {
    console.error('Erro ao salvar tarefa:', error);
    throw error;
  }
}

/**
 * Atualiza uma tarefa existente
 */
export async function updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
  try {
    // Atualiza a tarefa usando o módulo de tarefas existente
    const updatedTask = await tasksDb.updateTask(id, taskData);
    return updatedTask;
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    throw error;
  }
}

/**
 * Remove uma tarefa do banco de dados
 */
export async function deleteTask(id: string): Promise<void> {
  try {
    // Remove a tarefa usando o módulo de tarefas existente
    await tasksDb.deleteTask(id);
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    throw error;
  }
} 