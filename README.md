# ORUM AI - Seu Assistente de Produtividade Inteligente

![ORUM AI Logo](https://i.imgur.com/VEqYkz8.png)

## 📝 Sobre o Projeto

ORUM AI é um assistente de produtividade inteligente desenvolvido para ajudar as pessoas a organizarem suas tarefas e ganharem mais tempo de qualidade em suas vidas. A aplicação permite gerenciar tarefas, categorizá-las, visualizar dados por meio de dashboards e interagir com um assistente inteligente contextual.

### 💡 Desenvolvimento Auxiliado por IA

É importante destacar que **todo o processo de desenvolvimento foi realizado por inteligência artificial**, exceto a concepção da ideia original. A IA ajudou a estruturar desde o levantamento de valores fundamentais (como agilizar tarefas para dar mais tempo de qualidade às pessoas) até a execução completa do código.

O projeto foi construído em um total de 6 dias, sendo que a versão atual que você está vendo foi desenvolvida em apenas 2 dias! Como programador experiente, meu papel foi fornecer instruções claras e corrigir algumas rotas que a IA tomava durante as definições do projeto.

### 🛠️ Ferramentas Utilizadas

- **Cursor**: Responsável por 100% da criação do código, seguindo minhas instruções detalhadas
- **BUILDER.IO**: Utilizado para a criação e refinamento do layout da aplicação
- **GEMINI**: Empregado para toda a documentação e concepção das ideias do projeto

## 🤖 Agentes Inteligentes

A ORUM AI utiliza um sistema sofisticado de agentes inteligentes que trabalham em conjunto para oferecer uma experiência completa ao usuário:

### 🧠 Orquestrador Principal

O Orquestrador é o cérebro da operação, coordenando todos os outros agentes. Ele recebe as solicitações do usuário, decide qual agente deve responder e garante que todas as interações mantenham o contexto correto.

### 📊 Agente de Dashboard

Especializado na geração de visualizações de dados e análises. Este agente:
- Compreende solicitações em linguagem natural para criação de gráficos
- Coleta e processa dados de tarefas
- Cria visualizações apropriadas (gráficos de barras, pizza, etc.)
- Fornece insights sobre os dados apresentados

### 📋 Agente de Tarefas

Dedicado ao gerenciamento de tarefas do usuário:
- Cria, modifica e exclui tarefas
- Categoriza tarefas com base em diferentes atributos
- Sugere organizações e prioridades
- Mantém o histórico de tarefas concluídas

### 💬 Agente de Chat

Responsável por manter conversas naturais e contextualmente relevantes:
- Responde a perguntas sobre tarefas específicas
- Oferece sugestões proativas para melhorar a produtividade
- Mantém o contexto das conversas anteriores
- Conecta informações entre diferentes partes do sistema

## 🔌 API do Google e Orquestração

### Integração Técnica

A ORUM AI utiliza a API do Google para criação e orquestração dos agentes inteligentes e chats. Esta implementação técnica inclui:

- **Vertex AI**: Utilizada para alimentar os modelos de linguagem que sustentam os agentes
- **LangChain**: Framework para construção de aplicações com LLMs, permitindo a criação de agentes especializados
- **Orquestração baseada em RAG**: Implementação de Retrieval Augmented Generation para fornecer respostas precisas com base em dados contextuais
- **APIs de Gerenciamento de Conhecimento**: Para armazenamento e recuperação eficiente de informações contextuais

A arquitetura modular permite que os diferentes agentes se comuniquem entre si através de um sistema de mensagens padronizado, garantindo que as informações fluam corretamente pelo sistema.

## 🧠 Aprendizado por Contexto

Um diferencial importante da ORUM AI é sua capacidade de aprendizado contextual. Isso é garantido através de:

1. **Armazenamento de Histórico de Conversas**: Cada interação com os usuários é armazenada de forma estruturada.

2. **Vetorização de Informações**: As conversas e dados são convertidos em vetores semânticos, permitindo busca por similaridade.

3. **Janela de Contexto Dinâmica**: O sistema ajusta automaticamente quais informações são relevantes para o contexto atual da conversa.

4. **Conectores Personalizados**: Integração com fontes de dados específicas do usuário, como seu calendário e tarefas.

5. **Aprendizado Contínuo**: O sistema evolui com o uso, adaptando-se às preferências e necessidades específicas de cada usuário.

Este aprendizado contextual permite que a ORUM AI ofereça respostas mais precisas e personalizadas com o passar do tempo, tornando-se verdadeiramente um assistente pessoal único para cada usuário.

## 🚀 Começando

Para começar a usar a ORUM AI, siga estas etapas simples:

1. Clone o repositório
```
git clone https://github.com/seu-usuario/ORUMAIV2-APP.git
```

2. Instale as dependências
```
cd ORUMAIV2-APP
npm install
```

3. Inicie o servidor de desenvolvimento
```
npm run dev
```

4. Acesse a aplicação em seu navegador
```
http://localhost:3000
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Se você tem ideias para melhorar a ORUM AI, sinta-se à vontade para abrir uma issue ou enviar um pull request.

## 📜 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE.md para mais detalhes.

---

Desenvolvido com ❤️ e IA para tornar seu dia mais produtivo! 