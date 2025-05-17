"""
Script para executar a aplicação FastAPI com Uvicorn.
"""

import uvicorn
import os
import logging
from dotenv import load_dotenv

# Carrega as variáveis de ambiente
load_dotenv()

# Configuração básica de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def main():
    """
    Função principal para executar a aplicação.
    """
    # Configurações do Uvicorn
    uvicorn_config = {
        "app": "src.api.main:app",
        "host": os.getenv("HOST", "0.0.0.0"),
        "port": int(os.getenv("PORT", "8000")),
        "reload": os.getenv("DEBUG", "False").lower() == "true",
        "log_level": "info"
    }
    
    # Inicia o servidor
    uvicorn.run(**uvicorn_config)

if __name__ == "__main__":
    main() 