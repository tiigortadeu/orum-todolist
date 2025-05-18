# ORUM AI: Seu Assistente de Produtividade Inteligente Impulsionado por IA

Este projeto pessoal é uma ferramenta e gerenciamento de tarefas desenvolvida para a imersão de AI da Alura. O sistema integra funcionalidades baseadas em inteligência artificial para auxiliar na organização e interação do usuário. Seu desenvolvimento utilizou ferramentas de IA como construtoras primárias,  sem escrita manual de código-fonte em nenhum momento, apenas direcionamento de arquitetura. A fase de implementação principal foi concluída em um período de aproximadamente 2 dias.

O diferencal deste projeto são seus agentes de Inteligência Artificial especializados. Cada agente tem um "superpoder" particular (entender o que você diz, consultar seu histórico, encontrar informações, ou criar a resposta perfeita). Juntos, eles transformam a interface de chat em um assistente que respira o seu contexto. Este chat não é apenas uma caixa de texto; ele é projetado para se tornar um especialista focado exatamente na tarefa que você está visualizando ou na pergunta específica que você faz sobre seu histórico. Ao interagir com ele enquanto foca em algo, os agentes por trás de cena já sabem tudo sobre aquela tarefa e usam seu histórico para te dar a assistência e os insights mais relevantes, bem ali onde você precisa deles.
---



## 🛠️ Ferramentas Poderosas a Serviço da Inteligência

- **Cursor:** A ferramenta essencial para a criação de 100% do código da ORUM AI, interpretando minhas instruções detalhadas e transformando ideias em realidade funcional.
- **BUILDER.IO:** Fundamental na concepção de um layout intuitivo e responsivo para a aplicação, permitindo a prototipagem visual e os ajustes precisos da experiência do usuário.
- **GEMINI:** Um aliado poderoso na geração de ideias inovadoras para o projeto e na criação de uma documentação clara e abrangente, garantindo a compreensão e a evolução contínua da ORUM AI.

---

## 🤖 O Poder dos Agentes Inteligentes

A ORUM AI é alimentada por um sistema sofisticado de agentes inteligentes, cada um especializado em uma área crucial para otimizar sua produtividade:

- **🧠 Orquestrador Principal:** O Maestro da Produtividade. Coordena todos os outros agentes, recebendo solicitações, decidindo qual agente é o mais adequado para responder e garantindo que todas as interações mantenham um contexto rico e relevante.
- **📊 Agentes de Criação de Dashboard:** A funcionalidade de dashboard da ORUM AI emprega um pipeline de agentes inteligentes para a visualização de dados. Inicialmente, o Agente de Linguagem Natural (NLU) realiza o parsing da entrada do usuário para identificar a intenção de visualização. Em seguida, o Agente de Busca de Dados efetua a recuperação das informações relevantes. O Agente de Processamento de Dados estrutura esses dados para a renderização gráfica. O Agente de Dashboard (Visualização) então gera a representação visual propriamente dita. Por fim, o Agente de Explicação produz uma sumarização textual concisa dos insights apresentados no dashboard.
<details>
  <summary><strong>🗂️ Como funciona a criação de Chat por Tarefa</strong></summary>

No projeto, a criação de um chat por tarefa é um processo inteligente e automatizado, orquestrado por três agentes principais, cada um com uma responsabilidade clara:

1. **Agente de Entendimento (NLU)**  
   Assim que o usuário escolhe ou cria uma tarefa (ex: "Preparar apresentação comercial"), o agente de entendimento entra em ação. Ele analisa o título, descrição e contexto da tarefa para compreender exatamente sobre o que se trata, identificando intenções, entidades e possíveis necessidades do usuário em relação àquela atividade.

2. **Agente de Caracterização (Consultor)**  
   Este agente consulta o histórico, exemplos anteriores e padrões do sistema para identificar as melhores características da tarefa. Ele sugere formas de dividir a tarefa em etapas, boas práticas, subtarefas, prazos e recursos úteis, tudo levando em conta o perfil do usuário e o contexto da tarefa selecionada.

3. **Agente de Criação de Chat (NLG)**  
   Com todas as informações do entendimento e caracterização, este agente cria o chat já contextualizado: toda troca de mensagens futura dentro desse chat terá como base o contexto da tarefa, facilitando sugestões, acompanhamento, lembretes e geração de respostas personalizadas. O usuário pode interagir normalmente, mas todas as respostas e assistências são sempre ligadas à tarefa ativa.

**Exemplo do fluxo:**
- Usuário seleciona a tarefa “Preparar apresentação comercial”.
- O agente de entendimento detecta que é uma tarefa de organização e apresentação.
- O agente de caracterização sugere etapas como “Definir tópicos”, “Coletar dados”, “Criar slides” e “Ensaiar”.
- O agente de criação de chat monta o ambiente de chat já com essas etapas sugeridas e pronto para acompanhar o progresso, tirar dúvidas e sugerir próximos passos, sempre considerando o contexto da tarefa.

Assim, o chat por tarefa é dinâmico, contextualizado e oferece suporte inteligente do início ao fim da atividade do usuário.

</details>


---

## 🧠 Aprendizado por Contexto: Uma Experiência Cada Vez Mais Personalizada

O que torna a ORUM AI verdadeiramente única é sua capacidade de aprender e se adaptar às suas necessidades ao longo do tempo:

- **Armazenamento Inteligente do Histórico de Conversas:** Cada interação cria uma memória personalizada do seu uso.
- **Janela de Contexto Dinâmica:** Ajuste automático das informações mais relevantes para o contexto da conversa.
- **Criação de Reports Inteligentes:** Um agente interpreta sua solicitação e transforma em uma visão gráfica, criando visuais instantâneos para você.

Com o tempo, a ORUM AI se torna um parceiro de produtividade cada vez mais eficiente, oferecendo respostas mais precisas e personalizadas, otimizando seu tempo e impulsionando sua qualidade de vida.



## 🚀 Começando sua Jornada com ORUM AI

É fácil começar a transformar sua produtividade com a ORUM AI:

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/ORUMAIV2-APP.git
   ```

2. **Instale as dependências:**
   ```bash
   cd ORUMAIV2-APP
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse a aplicação em seu navegador:**  
   [http://localhost:3000](http://localhost:3000)

---


---


Um projeto de Igor Almeida
