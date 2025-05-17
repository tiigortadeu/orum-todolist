"""
Controlador para endpoints de verificação de saúde.
"""

from fastapi import APIRouter, Depends
from typing import Dict, Any

from src.agents.nlu_agent import NLUAgent
from src.config.settings import settings
from src.infrastructure.observability.metrics import get_metrics_summary

router = APIRouter(
    prefix="/health",
    tags=["health"]
)

@router.get("/")
async def health_check() -> Dict[str, Any]:
    """
    Verifica a saúde básica da aplicação.
    
    Returns:
        Dict[str, Any]: Status da aplicação
    """
    return {
        "status": "ok",
        "version": settings.API_VERSION,
        "environment": "development" if settings.DEBUG else "production"
    }

@router.get("/agents")
async def agents_health(nlu_agent: NLUAgent = Depends()) -> Dict[str, Any]:
    """
    Verifica a saúde dos agentes da aplicação.
    
    Args:
        nlu_agent: Agente NLU obtido através de injeção de dependência
        
    Returns:
        Dict[str, Any]: Status dos agentes
    """
    return {
        "agents": {
            "nlu": await nlu_agent.health_check()
        }
    }

@router.get("/metrics")
async def metrics() -> Dict[str, Any]:
    """
    Retorna as métricas coletadas pela aplicação.
    
    Returns:
        Dict[str, Any]: Métricas coletadas
    """
    return get_metrics_summary() 