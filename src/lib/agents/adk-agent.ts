import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { getGoogleApiKey, isValidApiKey } from '../config/api-keys';

// Configuração inicial
interface AgentConfig {
  apiKey?: string;
  model: string;
  temperature?: number;
  topK?: number;
  topP?: number;
}

// Interface para mapear tipos de chat especializados
interface SpecialistChat {
  role: string;
  systemPrompt: string;
  expertise: string[];
}

/**
 * Classe OrumaivAgent - Implementação usando conceitos do Google ADK
 */
export class OrumaivAgent {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private defaultSystemPrompt: string;
  private chatHistory: Array<{ role: string, parts: Array<{ text: string }> }> = [];
  private initialized: boolean = false;
  private initError: string = '';
  private specialistChats: Record<string, SpecialistChat>;
  
  constructor(config: AgentConfig) {
    // Obtém a chave da API do gerenciador de configuração
    const apiKey = config.apiKey || getGoogleApiKey();
    
    // Salva o prompt do sistema para uso posterior
    this.defaultSystemPrompt = `
      Você é Orumaiv, um assistente de IA avançado especializado em ajudar com o gerenciamento 
      de tarefas. Você pode responder perguntas sobre qualquer tópico com conhecimento detalhado,
      incluindo definições, explicações e fatos.
      
      Além disso, você pode:
      - Criar, atualizar e gerenciar tarefas
      - Fornecer sugestões e orientações sobre produtividade e organização
      - Responder perguntas gerais sobre qualquer assunto
      
      Mantenha suas respostas concisas, informativas e úteis. Quando uma pergunta está fora do 
      seu conhecimento específico, ainda assim tente fornecer informações úteis em vez de 
      dizer que não sabe.
    `;
    
    // Configuração de chats especializados
    this.specialistChats = {
      'user_story': {
        role: 'Product Owner / UX Designer',
        systemPrompt: `
          Você é um especialista em Product Ownership e UX Design com vasta experiência na criação de user stories.
          
          Ao ser solicitado para criar uma user story, forneça uma resposta completa e profissional seguindo o formato:
          
          1. **Título**: Um título conciso e descritivo para a user story
          2. **Como um**: O papel/persona do usuário
          3. **Eu quero**: A ação ou função que o usuário deseja realizar
          4. **Para que**: O benefício ou resultado esperado
          5. **Critérios de Aceitação**: Lista de verificações que determinam quando a story está completa
          6. **Notas de Design**: Recomendações de UX/UI relevantes
          7. **Prioridade**: Sugestão de prioridade (Alta/Média/Baixa) com justificativa
          
          Mantenha suas respostas profissionais, detalhadas e prontas para implementação.
        `,
        expertise: ['user story', 'história de usuário', 'caso de uso', 'requisito', 'página']
      },
      'development': {
        role: 'Desenvolvedor Full-Stack',
        systemPrompt: `
          Você é um desenvolvedor full-stack experiente com conhecimento profundo em várias linguagens de programação,
          frameworks e melhores práticas de desenvolvimento.
          
          Ao responder perguntas sobre desenvolvimento, forneça:
          
          1. **Explicações claras e técnicas**: Use terminologia precisa
          2. **Exemplos práticos de código**: Quando relevante
          3. **Considerações de arquitetura**: Padrões de design e estrutura
          4. **Prós e contras**: De diferentes abordagens quando aplicável
          5. **Referências a documentações**: Quando útil
          
          Mantenha suas respostas técnicas, práticas e orientadas à solução.
        `,
        expertise: ['código', 'programação', 'desenvolvimento', 'bug', 'framework', 'api', 'backend', 'frontend', 'fullstack', 'React', 'JavaScript', 'TypeScript']
      },
      'productivity': {
        role: 'Especialista em Produtividade',
        systemPrompt: `
          Você é um especialista em produtividade e gerenciamento de tempo com ampla experiência em métodos como GTD, 
          Pomodoro, PARA e outros sistemas de organização pessoal.
          
          Ao responder sobre produtividade e organização, forneça:
          
          1. **Métodos eficazes**: Técnicas comprovadas para o problema específico
          2. **Passos práticos**: Ações concretas que podem ser implementadas
          3. **Ferramentas recomendadas**: Quando relevante
          4. **Práticas de priorização**: Como identificar o que é mais importante
          5. **Hábitos sustentáveis**: Como manter a produtividade a longo prazo
          
          Mantenha suas respostas práticas, acionáveis e baseadas em evidências.
        `,
        expertise: ['produtividade', 'organização', 'tempo', 'calendário', 'agenda', 'prioridade', 'método', 'sistema', 'eficiência']
      },
      'health': {
        role: 'Consultor de Saúde e Bem-estar',
        systemPrompt: `
          Você é um consultor em saúde e bem-estar com conhecimento em nutrição, exercícios físicos, 
          meditação, sono e equilíbrio vida-trabalho.
          
          Ao responder sobre temas de saúde e bem-estar, forneça:
          
          1. **Informações baseadas em ciência**: Fundamentadas em pesquisas atuais
          2. **Abordagens holísticas**: Considerando diferentes aspectos do bem-estar
          3. **Recomendações personalizáveis**: Que podem ser adaptadas a diferentes condições
          4. **Pequenos passos práticos**: Para facilitar a adoção de novos hábitos
          5. **Considerações de segurança**: Quando aplicável
          
          Mantenha suas respostas informativas, equilibradas e encorajadoras.
          
          IMPORTANTE: Esclareça que você não é um profissional médico quando necessário.
        `,
        expertise: ['saúde', 'exercício', 'fitness', 'nutrição', 'alimentação', 'dieta', 'peso', 'yoga', 'meditação', 'sono', 'estresse']
      }
    };
    
    // Tenta inicializar a API e o modelo
    try {
      // Verifica se a chave da API é válida
      if (!isValidApiKey(apiKey)) {
        this.initError = 'Chave de API inválida ou não fornecida';
        console.error('ADK Agent: ' + this.initError);
        return;
      }
      
      // Inicialização da API e modelo
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: config.model,
        generationConfig: {
          temperature: config.temperature || 0.7,
          topK: config.topK || 40,
          topP: config.topP || 0.95,
        },
      });
      
      this.initialized = true;
      console.log('ADK Agent: Inicializado com sucesso');
      
      // Inicializa o histórico de chat com o prompt do sistema
      this.resetChat();
    } catch (error: any) {
      this.initError = error.message || 'Erro desconhecido ao inicializar';
      console.error('ADK Agent: Erro na inicialização:', error);
    }
  }
  
  /**
   * Verifica se o agente foi inicializado corretamente
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Obtém o erro de inicialização, se houver
   */
  public getInitError(): string {
    return this.initError;
  }
  
  /**
   * Identifica o tipo de especialista necessário com base na mensagem e contexto
   */
  private identifySpecialistChat(message: string, context?: any): string {
    const lowercaseMsg = message.toLowerCase();
    
    // Verifica cada tipo de especialista e suas palavras-chave
    for (const [chatType, specialist] of Object.entries(this.specialistChats)) {
      for (const keyword of specialist.expertise) {
        if (lowercaseMsg.includes(keyword.toLowerCase())) {
          console.log(`ADK Agent: Identificado chat especialista de tipo "${chatType}" pela palavra-chave "${keyword}"`);
          return chatType;
        }
      }
    }
    
    // Analisa o contexto da tarefa, se disponível
    if (context && context.task && context.task.text) {
      const taskText = context.task.text.toLowerCase();
      for (const [chatType, specialist] of Object.entries(this.specialistChats)) {
        for (const keyword of specialist.expertise) {
          if (taskText.includes(keyword.toLowerCase())) {
            console.log(`ADK Agent: Identificado chat especialista de tipo "${chatType}" pelo contexto da tarefa "${taskText}"`);
            return chatType;
          }
        }
      }
    }
    
    // Default para chat geral
    return 'general';
  }
  
  /**
   * Obtém o prompt de sistema especializado para o tipo de chat
   */
  private getSpecialistSystemPrompt(chatType: string): string {
    if (chatType !== 'general' && this.specialistChats[chatType]) {
      const specialist = this.specialistChats[chatType];
      return `
        Você é Orumaiv, um assistente de IA atuando como ${specialist.role}.
        
        ${specialist.systemPrompt}
        
        Considere-se um profissional experiente nesse campo e forneça respostas com o nível de 
        expertise que seria esperado de alguém com anos de experiência prática.
      `;
    }
    
    // Retorna o prompt padrão se não for um tipo especializado
    return this.defaultSystemPrompt;
  }
  
  /**
   * Envia uma mensagem para o agente e retorna a resposta
   */
  async sendMessage(message: string, context?: any): Promise<string> {
    // Verifica se o agente foi inicializado corretamente
    if (!this.initialized || !this.model) {
      console.error(`ADK Agent: Não inicializado. ${this.initError}`);
      return `Desculpe, não consigo responder no momento devido a um problema técnico: ${this.initError}`;
    }
    
    try {
      console.log(`ADK Agent: Processando mensagem "${message}"`, context);
      
      // Identifica o tipo de especialista necessário
      const chatType = this.identifySpecialistChat(message, context);
      
      // Se for um novo tipo de especialista, reseta o histórico com o prompt especializado
      const systemPrompt = this.getSpecialistSystemPrompt(chatType);
      if (this.chatHistory.length <= 1 || 
          (this.chatHistory[0].role === 'model' && 
           this.chatHistory[0].parts[0].text !== systemPrompt)) {
        console.log(`ADK Agent: Criando novo chat especializado de tipo "${chatType}"`);
        this.chatHistory = [{
          role: 'model',
          parts: [{ text: systemPrompt }]
        }];
      }
      
      // Adiciona contexto à mensagem, se disponível
      let enhancedMessage = message;
      if (context && context.task) {
        enhancedMessage = `
          [Contexto: Você está visualizando uma tarefa com título "${context.task.text}", 
          descrição: "${context.task.description || 'Não fornecida'}", 
          hora: "${context.task.time || 'Não especificada'}", 
          prioridade: "${context.task.priority || 'Não especificada'}"]
          
          Mensagem do usuário: ${message}
        `;
      }
      
      // Adiciona a mensagem do usuário ao histórico
      this.chatHistory.push({
        role: 'user',
        parts: [{ text: enhancedMessage }]
      });
      
      // Gera a resposta
      const result = await this.model.generateContent({
        contents: this.chatHistory,
        generationConfig: {
          maxOutputTokens: 800,
        },
      });
      
      const response = result.response;
      const responseText = response.text();
      
      // Adiciona a resposta ao histórico
      this.chatHistory.push({
        role: 'model',
        parts: [{ text: responseText }]
      });
      
      console.log(`ADK Agent: Resposta gerada: ${responseText}`);
      return responseText;
    } catch (error: any) {
      console.error('Erro ao processar mensagem com ADK Agent:', error);
      
      // Em caso de erro, retorna uma mensagem amigável
      return "Desculpe, encontrei um problema ao processar sua mensagem. Erro: " + (error.message || 'Desconhecido');
    }
  }
  
  /**
   * Processa uma mensagem de boas-vindas automática
   */
  async generateWelcomeMessage(taskContext: any, taskTitle: string): Promise<string> {
    // Verifica se o agente foi inicializado corretamente
    if (!this.initialized || !this.model) {
      console.error(`ADK Agent: Não inicializado para boas-vindas. ${this.initError}`);
      return `Olá! Estou aqui para ajudar com suas tarefas, mas estou enfrentando algumas limitações técnicas no momento.`;
    }
    
    try {
      // Identifica o tipo de especialista com base no título da tarefa
      const chatType = this.identifySpecialistChat(taskTitle, { task: { text: taskTitle } });
      
      // Cria um prompt de boas-vindas contextualizado
      let welcomePrompt = `Gere uma mensagem de boas-vindas amigável e profissional para um usuário que acabou de abrir o chat para a tarefa "${taskTitle}".`;
      
      if (chatType !== 'general') {
        welcomePrompt += ` A tarefa parece estar relacionada à sua área de especialidade. Apresente-se como um especialista em ${this.specialistChats[chatType].role} e ofereça ajuda específica.`;
      }
      
      if (taskContext) {
        welcomePrompt += ` A tarefa tem as seguintes informações:
          - Título: ${taskContext.text}
          - Descrição: ${taskContext.description || 'Não fornecida'}
          - Hora: ${taskContext.time || 'Não especificada'}
          - Prioridade: ${taskContext.priority || 'Não especificada'}
          
          Inclua detalhes da tarefa na sua mensagem de boas-vindas e ofereça ajuda específica relacionada ao tipo de tarefa.
        `;
      } else {
        welcomePrompt += ` Não temos informações detalhadas sobre esta tarefa.`;
      }
      
      // Configura o chat com o prompt especializado para este tipo
      this.chatHistory = [{
        role: 'model',
        parts: [{ text: this.getSpecialistSystemPrompt(chatType) }]
      }];
      
      // Adiciona o prompt ao histórico
      this.chatHistory.push({
        role: 'user',
        parts: [{ text: welcomePrompt }]
      });
      
      // Gera a resposta
      const result = await this.model.generateContent({
        contents: this.chatHistory,
        generationConfig: {
          maxOutputTokens: 800,
        },
      });
      
      const welcomeMessage = result.response.text();
      
      // Mantém o histórico para continuar a conversa no mesmo contexto especializado
      this.chatHistory.push({
        role: 'model',
        parts: [{ text: welcomeMessage }]
      });
      
      return welcomeMessage;
    } catch (error: any) {
      console.error('Erro ao gerar mensagem de boas-vindas:', error);
      return "Olá! Estou aqui para ajudar com suas tarefas. Como posso auxiliar você hoje?";
    }
  }
  
  /**
   * Reseta o histórico de chat
   */
  resetChat(): void {
    this.chatHistory = [{
      role: 'model',
      parts: [{ text: this.defaultSystemPrompt }]
    }];
  }
} 