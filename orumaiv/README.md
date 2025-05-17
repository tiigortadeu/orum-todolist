# Orumaiv Bot

Um sistema de chatbot avançado baseado em arquitetura de microserviços/agentes com o Google Gemini AI.

## Visão Geral

O Orumaiv Bot é um sistema de chat inteligente que utiliza múltiplos agentes especializados para fornecer respostas contextuais e assistência em tarefas. O sistema é construído com base no Google Gemini AI e implementa uma arquitetura robusta de microsserviços.

### Principais Características

- **Arquitetura Multi-Agente**: Sistema composto por agentes especializados coordenados
- **Contextualização Inteligente**: Mantém contexto entre conversas e entende o contexto específico de tarefas
- **Integração com Google Gemini**: Utiliza modelos avançados de IA para NLU/NLG
- **Orquestração Robusta**: Coordenação sofisticada entre agentes para evitar respostas conflitantes

## Configuração do Ambiente

### Pré-requisitos

- Python 3.10+
- MongoDB
- Redis
- Kafka (opcional, para eventos assíncronos)

### Instalação

1. Clone o repositório:
   ```
   git clone https://github.com/seu-usuario/orumaiv.git
   cd orumaiv
   ```

2. Crie e ative um ambiente virtual:
   ```
   python -m venv venv
   source venv/bin/activate  # No Windows: venv\Scripts\activate
   ```

3. Instale as dependências:
   ```
   pip install -r requirements.txt
   ```

4. Configure o arquivo `.env`:
   ```
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

5. Execute o servidor de desenvolvimento:
   ```
   uvicorn src.api.main:app --reload
   ```

## Estrutura do Projeto

```
orumaiv/
├── src/
│   ├── api/            # API Gateway e endpoints
│   ├── agents/         # Agentes especializados (NLU, NLG, etc.)
│   ├── core/           # Core: Orquestrador, Coordenador, Barramento
│   ├── infrastructure/ # Infraestrutura: Banco, Cache, Messaging
│   ├── config/         # Configurações
│   ├── domain/         # Modelos de domínio e lógica de negócio
│   └── utils/          # Utilidades
├── tests/              # Testes automatizados
├── .env.example        # Exemplo de configuração de ambiente
└── requirements.txt    # Dependências do projeto
```

## Licença

Este projeto está licenciado sob [MIT License](LICENSE). 