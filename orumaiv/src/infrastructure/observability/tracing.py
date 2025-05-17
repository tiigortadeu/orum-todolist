"""
Módulo de tracing para observabilidade da aplicação.

Este módulo fornece decoradores e utilitários para adicionar capacidades
de tracing distribuído à aplicação.
"""

from functools import wraps
import time
import asyncio
from uuid import uuid4
import contextvars
import logging

# Contexto para correlação
correlation_id = contextvars.ContextVar('correlation_id', default=None)

# Logger para este módulo
logger = logging.getLogger(__name__)

# Placeholder para integração futura com OpenTelemetry
# Quando estiver pronto para integrar OpenTelemetry, descomente e implemente este código

# from opentelemetry import trace
# from opentelemetry.exporter.jaeger.thrift import JaegerExporter
# from opentelemetry.sdk.resources import SERVICE_NAME, Resource
# from opentelemetry.sdk.trace import TracerProvider
# from opentelemetry.sdk.trace.export import BatchSpanProcessor
# from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
# 
# from src.config.settings import settings
# 
# # Inicialização do tracer
# tracer_provider = TracerProvider(
#     resource=Resource.create({SERVICE_NAME: "orumaiv"})
# )
# 
# jaeger_exporter = JaegerExporter(
#     agent_host_name=settings.JAEGER_HOST,
#     agent_port=settings.JAEGER_PORT,
# )
# 
# tracer_provider.add_span_processor(BatchSpanProcessor(jaeger_exporter))
# trace.set_tracer_provider(tracer_provider)
# tracer = trace.get_tracer(__name__)

def traced(span_name):
    """
    Decorator para adicionar tracing a funções.
    
    Esta implementação inicial apenas registra logs. Quando a integração com
    OpenTelemetry estiver pronta, ela criará spans de tracing adequados.
    
    Args:
        span_name: Nome do span a ser criado
    """
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Obtém ou cria um ID de correlação
            current_correlation_id = correlation_id.get()
            if not current_correlation_id:
                current_correlation_id = str(uuid4())
                correlation_id.set(current_correlation_id)
            
            # Log de início da função
            logger.debug(
                f"[{current_correlation_id}] Starting {span_name} ({func.__name__})"
            )
            
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                duration = time.time() - start_time
                
                # Log de conclusão da função
                logger.debug(
                    f"[{current_correlation_id}] Completed {span_name} in {duration:.3f}s"
                )
                
                return result
            except Exception as e:
                duration = time.time() - start_time
                
                # Log de erro
                logger.error(
                    f"[{current_correlation_id}] Error in {span_name}: {str(e)} after {duration:.3f}s",
                    exc_info=True
                )
                
                # Re-lança a exceção
                raise
                    
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            # Obtém ou cria um ID de correlação
            current_correlation_id = correlation_id.get()
            if not current_correlation_id:
                current_correlation_id = str(uuid4())
                correlation_id.set(current_correlation_id)
            
            # Log de início da função
            logger.debug(
                f"[{current_correlation_id}] Starting {span_name} ({func.__name__})"
            )
            
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                
                # Log de conclusão da função
                logger.debug(
                    f"[{current_correlation_id}] Completed {span_name} in {duration:.3f}s"
                )
                
                return result
            except Exception as e:
                duration = time.time() - start_time
                
                # Log de erro
                logger.error(
                    f"[{current_correlation_id}] Error in {span_name}: {str(e)} after {duration:.3f}s",
                    exc_info=True
                )
                
                # Re-lança a exceção
                raise
        
        # Verifica se a função é assíncrona
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
            
    return decorator

def get_current_correlation_id() -> str:
    """
    Obtém o ID de correlação atual, ou cria um novo se não existir.
    
    Returns:
        str: O ID de correlação atual
    """
    current_id = correlation_id.get()
    if not current_id:
        current_id = str(uuid4())
        correlation_id.set(current_id)
    return current_id 