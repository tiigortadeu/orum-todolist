"""
Configurações do Orumaiv Bot.

Este módulo carrega as configurações a partir de variáveis de ambiente
ou um arquivo .env na raiz do projeto.
"""

import os
from pathlib import Path
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env, se existir
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / '.env'

if os.path.exists(ENV_FILE):
    load_dotenv(ENV_FILE)

class Settings:
    """
    Classe de configurações que carrega valores de variáveis de ambiente
    ou define valores padrão quando não disponíveis.
    """
    
    # Configurações da API
    API_TITLE: str = "Orumaiv Bot API"
    API_VERSION: str = "v1"
    API_PREFIX: str = "/api"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Configurações do Google AI
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    GEMINI_MODEL_ID: str = os.getenv("GEMINI_MODEL_ID", "gemini-2.0-flash")
    
    # Configurações do banco de dados
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/orumaiv")
    
    # Configurações de cache
    REDIS_URI: str = os.getenv("REDIS_URI", "redis://localhost:6379/0")
    
    # Configurações do Kafka
    KAFKA_BOOTSTRAP_SERVERS: str = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
    KAFKA_EVENTS_TOPIC: str = os.getenv("KAFKA_EVENTS_TOPIC", "orumaiv-events")
    
    # Configurações de observabilidade
    JAEGER_HOST: str = os.getenv("JAEGER_HOST", "localhost")
    JAEGER_PORT: int = int(os.getenv("JAEGER_PORT", "6831"))
    
    # Configurações de segurança
    SECRET_KEY: str = os.getenv("SECRET_KEY", "insecure-dev-key-change-this-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    # Lista de origens permitidas para CORS
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "*").split(",")
    
    def dict(self) -> Dict[str, Any]:
        """Retorna as configurações como um dicionário."""
        return {k: v for k, v in self.__dict__.items() 
                if not k.startswith('_') and k.isupper()}
                
    def validate(self) -> Optional[str]:
        """
        Valida as configurações críticas.
        
        Returns:
            Mensagem de erro se alguma configuração crítica estiver faltando, 
            None caso contrário.
        """
        if not self.GOOGLE_API_KEY:
            return "GOOGLE_API_KEY não está configurada. Configure no arquivo .env ou variável de ambiente."
        
        return None

# Instância de configurações para uso em toda a aplicação
settings = Settings()

# Validação básica das configurações
validation_error = settings.validate()
if validation_error:
    print(f"ERRO DE CONFIGURAÇÃO: {validation_error}") 