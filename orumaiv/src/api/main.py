"""
Arquivo principal da aplicação FastAPI.

Este módulo define a aplicação FastAPI, configura rotas, middleware e manipuladores
de eventos.
"""

import logging
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from src.config.settings import settings
from src.infrastructure.observability.logging import setup_logging, get_logger
from src.api.routes import health, chat
from src.agents.nlu_agent import NLUAgent

# Configuração de logging
logger = get_logger(__name__)

# Variáveis globais para armazenar instâncias de agentes
app_state = {
    "nlu_agent": None
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gerencia o ciclo de vida da aplicação.
    
    Inicializa recursos necessários na inicialização e
    limpa recursos na finalização.
    """
    # Inicializa agentes
    logger.info("Inicializando agentes...")
    
    app_state["nlu_agent"] = NLUAgent()
    await app_state["nlu_agent"].prepare()
    
    logger.info("Aplicação inicializada com sucesso")
    
    yield
    
    # Limpa recursos
    logger.info("Finalizando aplicação...")
    
    if app_state["nlu_agent"]:
        await app_state["nlu_agent"].cleanup()
        
    logger.info("Aplicação finalizada")

# Criação da aplicação FastAPI
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    lifespan=lifespan
)

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuração de logging
setup_logging(app)

# Registro de rotas
app.include_router(health.router)
app.include_router(chat.router, prefix=f"{settings.API_PREFIX}/v{settings.API_VERSION}")

# Manipulador global de exceções
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Manipulador global de exceções não tratadas.
    """
    logger.error(f"Exceção não tratada: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Erro interno do servidor"}
    )

# Obtenção de instância do agente NLU
def get_nlu_agent() -> NLUAgent:
    """
    Obtém a instância do agente NLU.
    
    Returns:
        NLUAgent: Instância do agente NLU
    
    Raises:
        HTTPException: Se o agente não estiver inicializado
    """
    if app_state["nlu_agent"] is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço NLU não disponível"
        )
    return app_state["nlu_agent"]

# Exporta a função get_nlu_agent como dependência para uso nos controladores
app.dependency_overrides[NLUAgent] = get_nlu_agent 