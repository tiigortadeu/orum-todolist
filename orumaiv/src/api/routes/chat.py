"""
Controlador para endpoints de chat.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
import logging
import uuid
from datetime import datetime

from src.agents.nlu_agent import NLUAgent
from src.infrastructure.observability.tracing import traced
from src.infrastructure.observability.metrics import record_metrics

# Configuração de logging
logger = logging.getLogger(__name__)

# Definição do router
router = APIRouter(
    prefix="/chat",
    tags=["chat"]
)

# Modelos de dados para API
class MessageRequest(BaseModel):
    """Modelo para recebimento de mensagens do usuário."""
    
    user_id: str = Field(..., description="ID do usuário")
    content: str = Field(..., description="Conteúdo da mensagem")
    task_id: Optional[str] = Field(None, description="ID da tarefa ativa (se houver)")
    session_id: Optional[str] = Field(None, description="ID da sessão de chat")
    
    class Config:
        schema_extra = {
            "example": {
                "user_id": "user123",
                "content": "Quero criar uma nova tarefa para amanhã",
                "task_id": None,
                "session_id": "session456"
            }
        }
        
class MessageResponse(BaseModel):
    """Modelo para resposta a mensagens do usuário."""
    
    id: str = Field(..., description="ID da mensagem de resposta")
    content: str = Field(..., description="Conteúdo da resposta")
    timestamp: datetime = Field(..., description="Timestamp da resposta")
    intent: str = Field(..., description="Intenção identificada")
    entities: List[Dict[str, str]] = Field(default_factory=list, description="Entidades identificadas")
    
    class Config:
        schema_extra = {
            "example": {
                "id": "msg789",
                "content": "Claro! Vou criar uma tarefa para amanhã. Qual seria o título da tarefa?",
                "timestamp": "2023-04-28T14:30:00Z",
                "intent": "criar_tarefa",
                "entities": [
                    {"name": "data", "value": "amanhã"}
                ]
            }
        }

@router.post("/message", response_model=MessageResponse)
@traced("api.chat.message")
async def process_message(
    request: MessageRequest, 
    nlu_agent: NLUAgent = Depends()
) -> Dict[str, Any]:
    """
    Processa uma mensagem do usuário e retorna uma resposta.
    
    Args:
        request: Mensagem do usuário a ser processada
        nlu_agent: Agente NLU obtido através de injeção de dependência
        
    Returns:
        MessageResponse: Resposta da mensagem
    """
    # Registra métricas
    start_time = record_metrics(
        "chat_request", 
        "start", 
        {"user_id": request.user_id}
    )
    
    try:
        # Log da requisição
        logger.info(f"Processando mensagem para usuário {request.user_id}: {request.content}")
        
        # Aqui apenas chamamos o NLU Agent, mas em uma implementação completa,
        # chamaríamos o Orquestrador que coordenaria múltiplos agentes
        context = {}
        if request.task_id:
            context["task"] = {"id": request.task_id}
            
        # Processa a mensagem com o NLU Agent
        agent_response = await nlu_agent.process(request.content, context)
        nlu_result = agent_response.content
        
        # Em uma implementação completa, daqui chamaríamos outros agentes
        # como o NLG Agent para gerar uma resposta natural
        
        # Por enquanto, simulamos uma resposta simples
        response_content = f"Entendi que você quer: {nlu_result.get('intent', 'algo')}"
        if nlu_result.get('entities'):
            entities_text = ", ".join([f"{e['name']}: {e['value']}" for e in nlu_result.get('entities', [])])
            response_content += f"\nEntidades identificadas: {entities_text}"
        
        # Cria a resposta
        response = MessageResponse(
            id=f"msg-{uuid.uuid4().hex[:8]}",
            content=response_content,
            timestamp=datetime.utcnow(),
            intent=nlu_result.get("intent", "unknown"),
            entities=nlu_result.get("entities", [])
        )
        
        # Registra métricas de sucesso
        record_metrics(
            "chat_request", 
            "success", 
            {"user_id": request.user_id, "intent": response.intent}
        )
        record_metrics(
            "chat_request", 
            "end", 
            {"user_id": request.user_id}, 
            start_time
        )
        
        return response
        
    except Exception as e:
        # Registra métricas de erro
        record_metrics(
            "chat_request", 
            "error", 
            {"user_id": request.user_id, "error": str(e)}
        )
        
        # Log do erro
        logger.error(f"Erro ao processar mensagem: {str(e)}", exc_info=True)
        
        # Re-lança a exceção para ser tratada pelo manipulador global
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar mensagem: {str(e)}"
        ) 