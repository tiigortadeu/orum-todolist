import { GoogleGenerativeAI } from '@google/generative-ai'
import { getGoogleApiKey, isValidApiKey } from '../config/api-keys'

// Interface para o resultado do processamento NLU
interface NluResult {
  intent: string
  entities: Array<{name: string, value: string}>
  confidence: number
  requiresTaskAction: boolean
  requiresExternalInfo: boolean
  conversationalMode?: boolean
  raw?: any
}

/**
 * Agente de compreensão de linguagem natural (NLU)
 * Este agente é responsável por entender a intenção e extrair
 * entidades das mensagens do usuário
 */
export class NluAgent {
  private apiKey: string
  private model: any
  private useMock: boolean = false
  private initError: string = ''

  constructor() {
    // Obtém a API key do gerenciador de configuração
    this.apiKey = getGoogleApiKey();
    this.initModel()
  }

  private initModel() {
    try {
      console.log('NLU: Inicializando modelo com API key');
      
      // Verifica se a chave é válida
      if (isValidApiKey(this.apiKey)) {
        const genAI = new GoogleGenerativeAI(this.apiKey)
        this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
        this.useMock = false
        console.log('NLU: Modelo inicializado com sucesso');
      } else {
        this.initError = 'API key inválida ou não fornecida'
        console.warn('NLU: ' + this.initError + ', usando modo de simulação')
        this.useMock = true
      }
    } catch (error: any) {
      this.initError = error.message || 'Erro desconhecido'
      console.error('NLU: Erro ao inicializar modelo Gemini:', error)
      this.useMock = true
    }
  }

  /**
   * Processa uma mensagem e extrai intenção e entidades
   */
  async process(message: string, context: any = {}): Promise<NluResult> {
    try {
      // Verifica se a API key está configurada ou se estamos no modo de simulação
      if (this.useMock) {
        console.warn(`NLU: Usando análise simulada. Motivo: ${this.initError || 'Modo de simulação ativado'}`)
        return this.getMockResponse(message, context)
      }

      // Preparamos o prompt para o modelo
      const prompt = this.preparePrompt(message, context)
      
      try {
        console.log('NLU: Enviando prompt para API Gemini');
        // Chamamos o modelo
        const result = await this.model.generateContent(prompt)
        const responseText = result.response.text()
        console.log('NLU: Resposta recebida da API Gemini');
        
        // Processamos a resposta JSON
        const parsedResponse = this.parseResponse(responseText)
        
        // Verifica se deve usar o modo conversacional
        const conversationalMode = this.shouldUseConversationalMode(message, parsedResponse, context);
        
        return {
          intent: parsedResponse.intent || 'unknown',
          entities: parsedResponse.entities || [],
          confidence: parsedResponse.confidence || 0.7,
          requiresTaskAction: parsedResponse.requires_task_action || false,
          requiresExternalInfo: parsedResponse.requires_external_info || false,
          conversationalMode,
          raw: responseText
        }
      } catch (apiError: any) {
        // Se a API falhar, usamos o modo de simulação como fallback
        this.initError = apiError.message || 'Erro na API'
        console.warn('NLU: Erro na API do Google, usando modo de simulação:', apiError)
        this.useMock = true
        return this.getMockResponse(message, context)
      }
    } catch (error: any) {
      console.error('NLU: Erro no processamento:', error)
      return {
        intent: 'error',
        entities: [],
        confidence: 0,
        requiresTaskAction: false,
        requiresExternalInfo: false,
        conversationalMode: false,
        raw: null
      }
    }
  }

  /**
   * Determina se devemos usar o modo conversacional baseado no conteúdo da mensagem
   */
  private shouldUseConversationalMode(message: string, parsedResponse: any, context: any): boolean {
    const lowercaseMsg = message.toLowerCase();
    
    // Lista de indicadores que a requisição é conversacional
    const conversationalIndicators = [
      'crie uma', 'faça uma', 'me ajude com', 'explique', 'como fazer', 
      'como criar', 'user story', 'história', 'requisito', 'desenhe', 'modelo',
      'sugira', 'recomende', 'dê dicas', 'melhores práticas', 'exemplos'
    ];
    
    // Verifica se algum indicador está presente
    for (const indicator of conversationalIndicators) {
      if (lowercaseMsg.includes(indicator)) {
        console.log(`NLU: Modo conversacional ativado por "${indicator}"`);
        return true;
      }
    }
    
    // Verifica se a intenção é uma pergunta geral ou ajuda
    if (parsedResponse.intent === 'general_question' || parsedResponse.intent === 'general_help') {
      console.log('NLU: Modo conversacional ativado por intenção', parsedResponse.intent);
      return true;
    }
    
    // Verifica se requer informação externa
    if (parsedResponse.requires_external_info) {
      console.log('NLU: Modo conversacional ativado por necessidade de informação externa');
      return true;
    }
    
    return false;
  }

  /**
   * Prepara o prompt para o modelo
   */
  private preparePrompt(message: string, context: any): string {
    let contextDesc = ''
    
    // Adiciona informações sobre a tarefa atual, se existir
    if (context.task) {
      contextDesc += `
TAREFA ATUAL:
- Título: ${context.task.text}
- Descrição: ${context.task.description || 'Não fornecida'}
- Data: ${context.task.dueDate || 'Não definida'}
- Horário: ${context.task.time || 'Não definido'}
- Prioridade: ${context.task.priority || 'Não definida'}
- Categoria: ${context.task.tag || 'Não definida'}
`
    }

    // Prompt base para o modelo
    return `
Você é um assistente especializado em compreensão de linguagem natural para um aplicativo de gerenciamento de tarefas.
Analise a mensagem do usuário e extraia:

1. A intenção principal (intent)
2. Entidades mencionadas (entities)
3. Se requer ação em tarefas (requires_task_action)
4. Se requer informação externa (requires_external_info)

POSSÍVEIS INTENÇÕES:
- task_create: Criar uma nova tarefa
- task_update: Atualizar uma tarefa existente
- task_delete: Excluir uma tarefa
- task_complete: Marcar uma tarefa como concluída
- task_list: Listar tarefas
- task_query: Perguntar sobre tarefas
- general_greeting: Saudação geral
- general_help: Pedido de ajuda
- general_question: Pergunta geral
- conversation_request: Solicitação de conversa natural (ex: explicar algo, criar algo, dar dicas)
- unknown: Não foi possível determinar

${contextDesc}

MENSAGEM DO USUÁRIO: "${message}"

Responda APENAS no formato JSON abaixo:

{
  "intent": "string",
  "entities": [{"name": "string", "value": "string"}],
  "confidence": float,
  "requires_task_action": boolean,
  "requires_external_info": boolean
}
`
  }

  /**
   * Processa a resposta do modelo
   */
  private parseResponse(responseText: string): any {
    try {
      // Tenta extrair JSON da resposta
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      // Fallback para quando não consegue extrair JSON
      console.warn('Não foi possível extrair JSON da resposta:', responseText)
      return {
        intent: 'unknown',
        entities: [],
        confidence: 0.3
      }
    } catch (error) {
      console.error('Erro ao processar resposta:', error)
      return {
        intent: 'error',
        entities: [],
        confidence: 0
      }
    }
  }

  /**
   * Gera uma resposta simulada para testes sem API
   */
  private getMockResponse(message: string, context: any = {}): NluResult {
    const lowercaseMessage = message.toLowerCase()
    
    // Verifica se é uma solicitação de modo conversacional
    const conversationalMode = this.mockShouldUseConversationalMode(message, context);
    if (conversationalMode) {
      return {
        intent: 'general_question',
        entities: [],
        confidence: 0.8,
        requiresTaskAction: false,
        requiresExternalInfo: true,
        conversationalMode: true
      }
    }
    
    // Simulação de análise baseada em palavras-chave simples
    if (lowercaseMessage.includes('criar') || lowercaseMessage.includes('nova')) {
      return {
        intent: 'task_create',
        entities: this.extractMockEntities(lowercaseMessage),
        confidence: 0.8,
        requiresTaskAction: true,
        requiresExternalInfo: false,
        conversationalMode: false
      }
    } else if (lowercaseMessage.includes('atualizar') || lowercaseMessage.includes('mudar')) {
      return {
        intent: 'task_update',
        entities: this.extractMockEntities(lowercaseMessage),
        confidence: 0.7,
        requiresTaskAction: true,
        requiresExternalInfo: false,
        conversationalMode: false
      }
    } else if (lowercaseMessage.includes('completar') || lowercaseMessage.includes('concluir')) {
      return {
        intent: 'task_complete',
        entities: [],
        confidence: 0.9,
        requiresTaskAction: true,
        requiresExternalInfo: false,
        conversationalMode: false
      }
    } else if (lowercaseMessage.includes('excluir') || lowercaseMessage.includes('deletar')) {
      return {
        intent: 'task_delete',
        entities: [],
        confidence: 0.9,
        requiresTaskAction: true,
        requiresExternalInfo: false,
        conversationalMode: false
      }
    } else if (lowercaseMessage.includes('listar') || lowercaseMessage.includes('mostrar')) {
      return {
        intent: 'task_list',
        entities: [],
        confidence: 0.8,
        requiresTaskAction: true,
        requiresExternalInfo: false,
        conversationalMode: false
      }
    } else if (lowercaseMessage.includes('olá') || lowercaseMessage.includes('oi')) {
      return {
        intent: 'general_greeting',
        entities: [],
        confidence: 0.9,
        requiresTaskAction: false,
        requiresExternalInfo: false,
        conversationalMode: false
      }
    } else if (lowercaseMessage.includes('ajuda') || lowercaseMessage.includes('como')) {
      return {
        intent: 'general_help',
        entities: [],
        confidence: 0.7,
        requiresTaskAction: false,
        requiresExternalInfo: false,
        conversationalMode: true
      }
    } else {
      return {
        intent: 'general_question',
        entities: [],
        confidence: 0.5,
        requiresTaskAction: false,
        requiresExternalInfo: true,
        conversationalMode: true
      }
    }
  }
  
  /**
   * Verifica em modo mock se deve usar o modo conversacional
   */
  private mockShouldUseConversationalMode(message: string, context: any): boolean {
    const lowercaseMsg = message.toLowerCase();
    
    // Lista de indicadores para modo conversacional em mock
    const conversationalIndicators = [
      'user story', 'história', 'requisito', 'explique', 'me ajude com',
      'crie uma', 'faça uma', 'como fazer', 'dicas', 'sugestão',
      'recomendação', 'exemplo', 'modelo'
    ];
    
    for (const indicator of conversationalIndicators) {
      if (lowercaseMsg.includes(indicator)) {
        console.log(`NLU: Mock - Modo conversacional ativado por "${indicator}"`);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Extrai entidades simuladas para testes
   */
  private extractMockEntities(message: string): Array<{name: string, value: string}> {
    const entities = []
    
    // Extração de data/hora baseada em palavras-chave
    if (message.includes('amanhã')) {
      entities.push({ name: 'date', value: 'amanhã' })
    } else if (message.includes('hoje')) {
      entities.push({ name: 'date', value: 'hoje' })
    }
    
    // Extração de horário
    const timeMatch = message.match(/(\d{1,2})[h:](\d{2})?/)
    if (timeMatch) {
      const hour = timeMatch[1]
      const minute = timeMatch[2] || '00'
      entities.push({ name: 'time', value: `${hour}h${minute}` })
    }
    
    // Extração de prioridade
    if (message.includes('prioridade alta') || message.includes('urgente')) {
      entities.push({ name: 'priority', value: 'alta' })
    } else if (message.includes('prioridade média')) {
      entities.push({ name: 'priority', value: 'média' })
    } else if (message.includes('prioridade baixa')) {
      entities.push({ name: 'priority', value: 'baixa' })
    }
    
    return entities
  }
} 