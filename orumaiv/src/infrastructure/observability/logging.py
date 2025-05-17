"""
Módulo de logging para configuração e padronização de logs na aplicação.
"""

import logging
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional
import traceback

from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from src.config.settings import settings
from src.infrastructure.observability.tracing import get_current_correlation_id

# Formatar dicionário como JSON
class JsonFormatter(logging.Formatter):
    """
    Formatador de logs em formato JSON.
    """
    
    def __init__(self):
        super().__init__()
    
    def format(self, record):
        """
        Formata o registro de log como JSON.
        """
        log_object = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
            "correlation_id": getattr(record, "correlation_id", get_current_correlation_id())
        }
        
        # Adiciona informações sobre exceção, se presente
        if record.exc_info:
            exception_type, exception_value, _ = record.exc_info
            log_object["exception"] = {
                "type": exception_type.__name__,
                "message": str(exception_value),
                "traceback": traceback.format_exception_only(exception_type, exception_value)[0].strip()
            }
            
        # Adiciona atributos extras, se houver
        if hasattr(record, "extras") and record.extras:
            log_object.update(record.extras)
            
        return json.dumps(log_object)

def setup_logging(app: Optional[FastAPI] = None) -> None:
    """
    Configura o logging para a aplicação.
    
    Args:
        app: Instância do FastAPI, se disponível, para adicionar middleware de logging
    """
    # Configura o logger raiz
    root_logger = logging.getLogger()
    
    # Define o nível de log baseado no modo de debug
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    root_logger.setLevel(log_level)
    
    # Remove handlers existentes para evitar duplicação
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Handler para stdout com formato JSON
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(JsonFormatter())
    root_logger.addHandler(console_handler)
    
    # Configuração específica para bibliotecas de terceiros
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.WARNING)
    
    # Adiciona middleware de logging se a aplicação FastAPI for fornecida
    if app:
        app.add_middleware(LoggingMiddleware)
        
    # Log inicial
    logging.info("Logging configurado", extras={"app_version": "0.1.0"})

class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware para logging de requisições HTTP.
    """
    
    async def dispatch(self, request: Request, call_next):
        """
        Intercepta requisições HTTP para logging.
        """
        # Obtém ou cria ID de correlação
        correlation_id = get_current_correlation_id()
        
        # Marca o tempo de início
        start_time = datetime.utcnow()
        
        # Log da requisição
        logging.info(
            f"Requisição iniciada: {request.method} {request.url.path}",
            extras={
                "correlation_id": correlation_id,
                "method": request.method,
                "path": request.url.path,
                "query_params": str(request.query_params),
                "client_host": request.client.host if request.client else None
            }
        )
        
        # Processa a requisição
        try:
            response = await call_next(request)
            
            # Calcula duração
            duration = (datetime.utcnow() - start_time).total_seconds()
            
            # Log da resposta
            logging.info(
                f"Requisição completada: {request.method} {request.url.path} - {response.status_code}",
                extras={
                    "correlation_id": correlation_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "duration_seconds": duration
                }
            )
            
            return response
            
        except Exception as e:
            # Calcula duração em caso de erro
            duration = (datetime.utcnow() - start_time).total_seconds()
            
            # Log de erro
            logging.error(
                f"Erro ao processar requisição: {request.method} {request.url.path}",
                extras={
                    "correlation_id": correlation_id,
                    "method": request.method,
                    "path": request.url.path,
                    "error": str(e),
                    "duration_seconds": duration
                },
                exc_info=True
            )
            
            # Re-lança a exceção para ser tratada pelo manipulador global
            raise

def get_logger(name: str) -> logging.Logger:
    """
    Obtém um logger configurado para o módulo especificado.
    
    Args:
        name: Nome do módulo
        
    Returns:
        logging.Logger: Logger configurado
    """
    return logging.getLogger(name) 