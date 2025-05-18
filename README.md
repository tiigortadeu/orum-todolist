# ORUM AI: Seu Assistente de Produtividade Inteligente Impulsionado por IA

Este é um projeto pessoal de gerenciamento de tarefas, criado durante a Imersão de AI da Alura, e representa um experimento completo de cocriação com Inteligência Artificial. Todo o desenvolvimento foi realizado **100% com o auxílio de IA**: desde a concepção da arquitetura, estruturação dos fluxos, até a geração do código-fonte, nenhum trecho foi escrito manualmente — todo o processo se baseou em prompts, revisão e direcionamento estratégico. O protótipo funcional foi concebido em apenas **2 dias**.

O grande diferencial deste projeto está na arquitetura de **agentes inteligentes especializados**. Cada agente possui um “superpoder” próprio: um entende o que você diz, outro consulta seu histórico, outro busca informações externas e outro gera respostas personalizadas. Com isso, a interface de chat se transforma em um verdadeiro assistente contextual — não é apenas uma caixa de texto, mas um especialista adaptado exatamente à tarefa ou contexto em que você está focado. Ao interagir, os agentes já têm todo o contexto da tarefa e do seu histórico, oferecendo assistência e insights hiper-relevantes no momento certo, no lugar certo.

Esta jornada demonstra o potencial de acelerar do zero ao protótipo funcional em tempo recorde, utilizando a IA não apenas como ferramenta, mas como verdadeiro coautor do desenvolvimento.

---

<details>
  <summary><strong>🛠️ Ferramentas Poderosas a Serviço da Inteligência</strong></summary>

- **Cursor:** A ferramenta essencial para a criação de 100% do código da ORUM AI, interpretando minhas instruções detalhadas e transformando ideias em realidade funcional.
- **BUILDER.IO:** Fundamental na concepção de um layout intuitivo e responsivo para a aplicação, permitindo a prototipagem visual e os ajustes precisos da experiência do usuário.
- **GEMINI:** Um aliado poderoso na geração de ideias inovadoras para o projeto e na criação de uma documentação clara e abrangente, garantindo a compreensão e a evolução contínua da ORUM AI.

</details>

---

<details>
  <summary><strong>🤖 O Poder dos Agentes Inteligentes</strong></summary>

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

</details>

---

<details>
  <summary><strong>🧠 Aprendizado por Contexto: Uma Experiência Cada Vez Mais Personalizada</strong></summary>

O que torna a ORUM AI verdadeiramente única é sua capacidade de aprender e se adaptar às suas necessidades ao longo do tempo:

- **Armazenamento Inteligente do Histórico de Conversas:** Cada interação cria uma memória personalizada do seu uso.
- **Janela de Contexto Dinâmica:** Ajuste automático das informações mais relevantes para o contexto da conversa.
- **Criação de Reports Inteligentes:** Um agente interpreta sua solicitação e transforma em uma visão gráfica, criando visuais instantâneos para você.

Com o tempo, a ORUM AI se torna um parceiro de produtividade cada vez mais eficiente, oferecendo respostas mais precisas e personalizadas, otimizando seu tempo e impulsionando sua qualidade de vida.

</details>

---

<details>
  <summary><strong>🚀 Começando sua Jornada com ORUM AI</strong></summary>

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

</details>

---

## Conclusão

A experiência de criar este projeto foi extremamente enriquecedora. Ficou evidente o enorme potencial de validação rápida de ideias que esse workflow com agentes de IA oferece: em apenas dois dias, foi possível sair do conceito até um protótipo funcional, explorando todas as etapas fundamentais de um produto inovador.

Para o futuro, existem várias melhorias planejadas:
- **Aprendizado com contexto de chats antigos:** A ideia é evoluir o modelo para que ele aprenda com interações passadas, elevando a personalização e a inteligência do assistente. Isso depende da implementação de um banco de dados robusto para armazenar e analisar os históricos.
- **Reestruturação e refatoração:** Haverá um trabalho contínuo de refino da arquitetura e do código, tornando a solução mais escalável, organizada e eficiente.

O desenvolvimento desta ferramenta demonstrou um potencial extraordinário para validação ágil de ideias. Isso abre portas para imaginar uma futura “fábrica de software” movida por agentes inteligentes, acelerando a criação de produtos inovadores com velocidade e qualidade jamais vistas.

---

Um projeto de Igor Almeida
