# Configurando a API do Google Gemini

Para que a aplicação funcione corretamente com respostas geradas pela IA do Google Gemini, é necessário configurar a API key.

## Passos para configurar

1. Acesse o console do Google AI Studio: https://aistudio.google.com/
2. Faça login ou crie uma conta Google
3. No painel de controle, clique em "Get API key" (ou "Obter chave de API")
4. Crie um novo projeto ou selecione um existente
5. Concorde com os termos de serviço
6. Copie a API key gerada

## Configurando no projeto

1. Na raiz do projeto, crie um arquivo chamado `.env.local`
2. Adicione sua API key neste formato:
   ```
   GOOGLE_API_KEY=SuaChaveDeAPIAqui
   ```
3. Reinicie o servidor de desenvolvimento usando `npm run dev`

## Verificando se está funcionando

1. Abra a aplicação
2. Selecione uma tarefa ou crie uma nova
3. Faça uma pergunta como "o que é yoga?"
4. Se a API estiver funcionando corretamente, você verá uma resposta detalhada em vez de uma mensagem genérica

## Solução de problemas

Se receber erros como "400 Bad Request", verifique:

- Se a API key está correta
- Se sua conta tem créditos suficientes
- Se o modelo "gemini-2.0-flash" está disponível para sua conta/região

Para mais ajuda, consulte a [documentação oficial da API Gemini](https://ai.google.dev/docs/gemini_api_overview). 