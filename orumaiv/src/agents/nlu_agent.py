"""
Agente de Compreensão de Linguagem Natural (NLU).

Este agente é responsável por processar o texto do usuário para identificar
intenções, entidades e informações relevantes usando o Google Gemini API.
"""

import json
import asyncio
from typing import Dict, Any, Optional, List
import logging

from google import genai
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from src.agents.base_agent import BaseAgent, AgentResponse
from src.config.settings import settings
from src.infrastructure.observability.tracing import traced
from src.infrastructure.observability.metrics import timed

# Configuração do logger
logger = logging.getLogger(__name__)

class NLUAgent(BaseAgent):
    """
    Agente que utiliza Google Gemini API para compreensão de linguagem natural.
    
    Este agente processa o texto do usuário para identificar intenções,
    entidades e determinar quais informações adicionais são necessárias.
    """
    
    def __init__(self, name: str = "nlu_agent"):
        """
        Inicializa o agente NLU.
        
        Args:
            name: Nome opcional para o agente
        """
        super().__init__(name)
        self.client = None
        self.model = None
        
    async def prepare(self) -> None:
        """
        Inicializa o cliente do Google Gemini.
        """
        try:
            # Configura o cliente do Google Gemini
            self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
            self.model = self.client.models.get(settings.GEMINI_MODEL_ID)
            logger.info(f"Agente NLU inicializado com modelo {settings.GEMINI_MODEL_ID}")
        except Exception as e:
            logger.error(f"Erro ao inicializar agente NLU: {str(e)}")
            raise
    
    @traced("nlu_agent.process")
    @timed("agent_processing", agent="nlu")
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((genai.errors.ServiceUnavailable, genai.errors.DeadlineExceeded))
    )
    async def process(self, text: str, context: Dict[str, Any] = None) -> AgentResponse:
        """
        Processa o texto do usuário para identificar a intenção e entidades.
        
        Args:
            text: Texto do usuário para processar
            context: Contexto adicional para melhorar a compreensão
            
        Returns:
            AgentResponse: Resposta contendo as intenções e entidades identificadas
        """
        if not self.client:
            await self.prepare()
            
        try:
            # Prepara o prompt para o Gemini
            prompt = self._prepare_prompt(text, context)
            
            # Gera conteúdo com o Gemini
            response = await asyncio.to_thread(
                self.model.generate_content,
                contents=prompt,
                config={
                    "tools": [{"google_search": {}}],
                    "temperature": 0.1
                }
            )
            
            # Processa a resposta
            result = self._parse_response(response)
            
            # Calcula nível de confiança
            confidence = self._calculate_confidence(result)
            
            return AgentResponse(
                agent_id=self.agent_id,
                content=result,
                confidence=confidence,
                metadata={
                    "original_text": text,
                    "has_context": context is not None
                }
            )
            
        except Exception as e:
            logger.error(f"Erro ao processar texto com agente NLU: {str(e)}")
            
            # Retorna uma resposta de fallback em caso de erro
            return AgentResponse(
                agent_id=self.agent_id,
                content={
                    "intent": "error",
                    "entities": [],
                    "requires_task_info": False,
                    "requires_user_history": False,
                    "requires_external_info": False,
                    "error": str(e)
                },
                confidence=0.0,
                metadata={
                    "error": True,
                    "original_text": text
                }
            )
    
    def _prepare_prompt(self, text: str, context: Optional[Dict[str, Any]] = None) -> str:
        """
        Prepara o prompt para enviar ao modelo, incluindo contexto se disponível.
        
        Args:
            text: Texto do usuário
            context: Contexto adicional
            
        Returns:
            str: Prompt formatado para o modelo
        """
        system_prompt = """
        Você é um analisador de linguagem natural especializado em chatbots de tarefas e produtividade.
        
        Analise o texto do usuário e retorne:
        1. Intenção principal (uma única string, ex: 'buscar_tarefa', 'criar_lembrete', 'obter_ajuda')
        2. Entidades mencionadas (lista de objetos com nome e valor)
        3. Quais informações você precisa consultar (histórico do usuário, detalhes de tarefa, busca externa)
        
        Formato de resposta:
        {
          "intent": "string",
          "entities": [{"name": "string", "value": "string"}],
          "requires_task_info": boolean,
          "requires_user_history": boolean,
          "requires_external_info": boolean,
          "search_query": "string" (opcional)
        }
        
        RESPONDA APENAS NO FORMATO JSON ACIMA.
        """
        
        # Adiciona o contexto ao prompt se disponível
        context_text = ""
        if context:
            context_text += "\n=== CONTEXTO ===\n"
            
            if "task" in context:
                task = context["task"]
                context_text += f"Tarefa Ativa: {task.get('title', 'Sem título')}\n"
                context_text += f"Descrição: {task.get('description', 'Sem descrição')}\n"
                if "status" in task:
                    context_text += f"Status: {task['status']}\n"
                if "due_date" in task:
                    context_text += f"Data de Vencimento: {task['due_date']}\n"
            
            if "recent_history" in context:
                context_text += "\nHistórico Recente da Conversa:\n"
                for i, item in enumerate(context['recent_history'][-3:]):
                    context_text += f"Usuário: {item.get('user', '')}\n"
                    context_text += f"Bot: {item.get('bot', '')}\n"
                    
            context_text += "=== FIM DO CONTEXTO ===\n"
        
        # Monta o prompt final
        return f"{system_prompt}\n{context_text}\nTEXTO DO USUÁRIO: {text}"
        
    def _parse_response(self, response) -> Dict[str, Any]:
        """
        Processa a resposta do modelo para extrair as informações relevantes.
        
        Args:
            response: Resposta do Gemini API
            
        Returns:
            Dict[str, Any]: Estrutura com informações extraídas
        """
        try:
            # Extrai o texto da resposta
            response_text = response.text
            
            # Tenta fazer o parse como JSON
            try:
                result = json.loads(response_text)
                return result
            except json.JSONDecodeError as e:
                logger.warning(f"Erro ao fazer parse da resposta como JSON: {str(e)}. Texto: {response_text}")
                
                # Tenta extrair apenas a parte JSON da resposta
                import re
                json_pattern = r'({[\s\S]*})'
                match = re.search(json_pattern, response_text)
                
                if match:
                    try:
                        result = json.loads(match.group(1))
                        return result
                    except json.JSONDecodeError:
                        pass
                
                # Fallback case para quando o modelo não retorna JSON válido
                return {
                    "intent": "unknown",
                    "entities": [],
                    "requires_task_info": False,
                    "requires_user_history": False,
                    "requires_external_info": False,
                    "raw_response": response_text
                }
                
        except Exception as e:
            logger.error(f"Erro ao processar resposta do NLU: {str(e)}")
            return {
                "intent": "error",
                "entities": [],
                "requires_task_info": False,
                "requires_user_history": False,
                "requires_external_info": False,
                "error": str(e)
            }
    
    def _calculate_confidence(self, result: Dict[str, Any]) -> float:
        """
        Calcula um nível de confiança para o resultado.
        
        Args:
            result: Resultado do processamento
            
        Returns:
            float: Nível de confiança entre 0 e 1
        """
        # Se houve erro, confiança é zero
        if result.get("intent") == "error":
            return 0.0
            
        # Se intent desconhecida, confiança baixa
        if result.get("intent") == "unknown":
            return 0.3
            
        # Para outras intenções, calcula baseado na completude
        confidence = 0.7  # Base
        
        # Se tiver entidades, aumenta a confiança
        if result.get("entities") and len(result.get("entities", [])) > 0:
            confidence += 0.2
            
        # Se alguma flag requer algo, aumenta a confiança
        if any([
            result.get("requires_task_info", False),
            result.get("requires_user_history", False),
            result.get("requires_external_info", False)
        ]):
            confidence += 0.1
            
        # Limita a 1.0
        return min(confidence, 1.0) 