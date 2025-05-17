"""
Módulo de métricas para observabilidade da aplicação.

Este módulo fornece funções para registro e exportação de métricas
da aplicação.
"""

import time
import asyncio
from typing import Dict, Any, Optional
import logging
from functools import wraps

# Logger para este módulo
logger = logging.getLogger(__name__)

# Placeholder para integração futura com Prometheus
# Quando estiver pronto para integrar Prometheus, descomente e implemente este código

# from prometheus_client import Counter, Histogram, Gauge, Summary, start_http_server

# # Métricas globais da aplicação
# HTTP_REQUESTS_TOTAL = Counter(
#     'http_requests_total', 
#     'Total de requisições HTTP',
#     ['method', 'endpoint', 'status']
# )

# HTTP_REQUEST_DURATION = Histogram(
#     'http_request_duration_seconds',
#     'Duração das requisições HTTP em segundos',
#     ['method', 'endpoint'],
#     buckets=(0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0, 30.0, 60.0)
# )

# AGENT_CALLS_TOTAL = Counter(
#     'agent_calls_total',
#     'Total de chamadas para agentes',
#     ['agent', 'status']
# )

# AGENT_PROCESSING_TIME = Histogram(
#     'agent_processing_time_seconds',
#     'Tempo de processamento dos agentes em segundos',
#     ['agent'],
#     buckets=(0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0, 30.0, 60.0)
# )

# # Inicializa o servidor HTTP para Prometheus quando o módulo é carregado
# def start_metrics_server(port=8000):
#     try:
#         start_http_server(port)
#         logger.info(f"Servidor de métricas Prometheus iniciado na porta {port}")
#     except Exception as e:
#         logger.error(f"Erro ao iniciar servidor de métricas Prometheus: {str(e)}")

# Cache simples para métricas em memória (solução temporária até Prometheus)
_metrics_cache = {
    "http_requests": {},
    "agent_calls": {},
    "processing_times": {}
}

def record_metrics(metric_type: str, action: str, labels: Dict[str, str], 
                  start_time: Optional[float] = None) -> float:
    """
    Registra métricas para várias ações na aplicação.
    
    Esta implementação inicial armazena as métricas em memória para análise simples.
    Quando a integração com Prometheus estiver pronta, ela substituirá esta implementação.
    
    Args:
        metric_type: Tipo de métrica (ex: http_request, agent_call)
        action: Ação sendo medida (ex: start, end, error)
        labels: Rótulos para categorizar a métrica
        start_time: Tempo de início para métricas de duração
        
    Returns:
        float: O timestamp atual, útil para calcular durações posteriormente
    """
    current_time = time.time()
    
    # Cria uma chave baseada nos rótulos
    labels_key = "_".join([f"{k}:{v}" for k, v in sorted(labels.items())])
    
    if action == "start":
        # Registra início de uma operação
        logger.debug(f"[METRIC] {metric_type}.{action} - {labels_key}")
        return current_time
        
    elif action == "end" and start_time:
        # Calcula e registra a duração de uma operação
        duration = current_time - start_time
        
        if metric_type not in _metrics_cache["processing_times"]:
            _metrics_cache["processing_times"][metric_type] = {}
            
        if labels_key not in _metrics_cache["processing_times"][metric_type]:
            _metrics_cache["processing_times"][metric_type][labels_key] = []
            
        _metrics_cache["processing_times"][metric_type][labels_key].append(duration)
        
        logger.debug(f"[METRIC] {metric_type}.{action} - {labels_key} - duration: {duration:.3f}s")
        
    elif action == "error":
        # Registra erro
        if metric_type not in _metrics_cache:
            _metrics_cache[metric_type] = {}
            
        if "errors" not in _metrics_cache[metric_type]:
            _metrics_cache[metric_type]["errors"] = {}
            
        if labels_key not in _metrics_cache[metric_type]["errors"]:
            _metrics_cache[metric_type]["errors"][labels_key] = 0
            
        _metrics_cache[metric_type]["errors"][labels_key] += 1
        
        logger.debug(f"[METRIC] {metric_type}.{action} - {labels_key}")
        
    else:
        # Incrementa contadores simples
        if metric_type not in _metrics_cache:
            _metrics_cache[metric_type] = {}
            
        if action not in _metrics_cache[metric_type]:
            _metrics_cache[metric_type][action] = {}
            
        if labels_key not in _metrics_cache[metric_type][action]:
            _metrics_cache[metric_type][action][labels_key] = 0
            
        _metrics_cache[metric_type][action][labels_key] += 1
        
        logger.debug(f"[METRIC] {metric_type}.{action} - {labels_key}")
    
    return current_time
    
def get_metrics_summary() -> Dict[str, Any]:
    """
    Retorna um resumo das métricas coletadas.
    
    Returns:
        Dict[str, Any]: Um dicionário com o resumo das métricas
    """
    return _metrics_cache
    
def timed(metric_name: str, **default_labels):
    """
    Decorator para medir o tempo de execução de uma função.
    
    Args:
        metric_name: Nome da métrica a ser registrada
        **default_labels: Rótulos padrão para a métrica
    """
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            labels = {**default_labels}
            
            # Adiciona o nome da função como rótulo se não especificado
            if "function" not in labels:
                labels["function"] = func.__name__
                
            start = record_metrics(metric_name, "start", labels)
            
            try:
                result = await func(*args, **kwargs)
                record_metrics(metric_name, "end", labels, start)
                return result
            except Exception as e:
                labels["error"] = str(e)
                record_metrics(metric_name, "error", labels)
                raise
                
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            labels = {**default_labels}
            
            # Adiciona o nome da função como rótulo se não especificado
            if "function" not in labels:
                labels["function"] = func.__name__
                
            start = record_metrics(metric_name, "start", labels)
            
            try:
                result = func(*args, **kwargs)
                record_metrics(metric_name, "end", labels, start)
                return result
            except Exception as e:
                labels["error"] = str(e)
                record_metrics(metric_name, "error", labels)
                raise
        
        # Verifica se a função é assíncrona
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
            
    return decorator 