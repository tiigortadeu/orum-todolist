"""
Módulo que define a classe base para todos os agentes do sistema.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import asyncio
import time
import uuid

from src.infrastructure.observability.tracing import traced

class BaseAgent(ABC):
    """
    Classe base abstrata para todos os agentes do sistema.
    
    Todos os agentes específicos devem herdar desta classe e implementar
    pelo menos o método process().
    """
    
    def __init__(self, name: str = None):
        """
        Inicializa um agente com um nome único.
        
        Args:
            name: Nome único do agente. Se não for fornecido, será gerado um UUID.
        """
        self.agent_id = name or f"{self.__class__.__name__}-{uuid.uuid4().hex[:8]}"
        self.start_time = time.time()
        self._metrics = {
            "total_calls": 0,
            "successful_calls": 0,
            "failed_calls": 0,
            "total_processing_time": 0
        }
    
    @traced("base_agent.process")
    @abstractmethod
    async def process(self, *args, **kwargs) -> Dict[str, Any]:
        """
        Método principal que executa a lógica do agente.
        
        Deve ser implementado por todas as subclasses.
        
        Returns:
            Dict[str, Any]: O resultado do processamento do agente
        """
        pass
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Verifica e retorna o estado de saúde do agente.
        
        Returns:
            Dict[str, Any]: Um dicionário com informações de saúde do agente
        """
        uptime = time.time() - self.start_time
        
        return {
            "agent_id": self.agent_id,
            "status": "healthy",
            "uptime_seconds": uptime,
            "metrics": self._metrics
        }
    
    def _update_metrics(self, success: bool, processing_time: float) -> None:
        """
        Atualiza as métricas internas do agente.
        
        Args:
            success: Se o processamento foi bem-sucedido
            processing_time: Tempo de processamento em segundos
        """
        self._metrics["total_calls"] += 1
        
        if success:
            self._metrics["successful_calls"] += 1
        else:
            self._metrics["failed_calls"] += 1
            
        self._metrics["total_processing_time"] += processing_time
    
    async def prepare(self) -> None:
        """
        Prepara o agente para uso, inicializando recursos necessários.
        
        Este método pode ser sobrescrito por agentes que precisam
        de inicialização específica.
        """
        pass
    
    async def cleanup(self) -> None:
        """
        Libera recursos utilizados pelo agente.
        
        Este método pode ser sobrescrito por agentes que precisam
        de limpeza específica.
        """
        pass

class AgentResponse:
    """
    Classe que representa uma resposta padronizada de um agente.
    """
    
    def __init__(self, agent_id: str, content: Any, confidence: float = 1.0, 
                 metadata: Dict[str, Any] = None):
        """
        Inicializa uma resposta de agente.
        
        Args:
            agent_id: Identificador do agente que gerou a resposta
            content: Conteúdo da resposta
            confidence: Nível de confiança na resposta (entre 0 e 1)
            metadata: Metadados adicionais para a resposta
        """
        self.agent_id = agent_id
        self.content = content
        self.confidence = confidence
        self.metadata = metadata or {}
        self.timestamp = time.time()
        self.response_id = f"response-{uuid.uuid4().hex}" 