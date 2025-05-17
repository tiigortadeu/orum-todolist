import { NextRequest, NextResponse } from 'next/server'
import { processMessageWithAgents } from '@/lib/agents/orchestrator'
import { saveMessage } from '@/lib/db/messages'

export async function POST(req: NextRequest) {
  try {
    console.log("API de chat recebeu uma solicitação")
    
    const body = await req.json()
    const { message, taskId, userId, isAutoWelcome } = body
    
    console.log(`Mensagem recebida: "${message}", taskId: ${taskId}, userId: ${userId}, isAutoWelcome: ${isAutoWelcome}`)
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensagem inválida' },
        { status: 400 }
      )
    }
    
    // Processa a mensagem através do orquestrador de agentes
    try {
      const response = await processMessageWithAgents(message, {
        taskId,
        userId,
        isAutoWelcome: isAutoWelcome || false
      })
      
      console.log("Resposta do processamento:", response)
      
      // Para mensagens automáticas, não salvamos a mensagem do "usuário"
      if (!isAutoWelcome) {
        await saveMessage({
          userId: userId || 'anonymous',
          taskId: taskId || null,
          content: message,
          sender: 'user',
          timestamp: new Date()
        })
      }
      
      await saveMessage({
        userId: userId || 'anonymous',
        taskId: taskId || null,
        content: response.content,
        sender: 'system',
        timestamp: new Date(),
        metadata: {
          intent: response.intent,
          entities: response.entities
        }
      })
      
      return NextResponse.json({
        id: Date.now().toString(),
        text: response.content,
        sender: 'system',
        timestamp: new Date().toISOString(),
        intent: response.intent,
        entities: response.entities,
        taskUpdated: response.taskUpdated,
        taskData: response.taskData
      })
    } catch (error: any) {
      console.error("Erro no processamento da mensagem:", error)
      
      // Fornece uma resposta de erro mais informativa
      return NextResponse.json({
        id: Date.now().toString(),
        text: `Desculpe, encontrei um problema ao processar sua mensagem. Erro: ${error.message || 'Erro desconhecido'}`,
        sender: 'system',
        timestamp: new Date().toISOString(),
        intent: 'error',
        entities: []
      })
    }
  } catch (error: any) {
    console.error('Erro geral ao processar mensagem:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao processar mensagem',
        details: error.message || 'Erro desconhecido',
        id: Date.now().toString(),
        text: 'Desculpe, ocorreu um erro interno. Por favor, tente novamente mais tarde.',
        sender: 'system',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
} 