/**
 * Gerenciamento de chaves de API
 * Obtém chaves apenas de variáveis de ambiente (.env.local)
 */

// Obtém a chave de API do Google
export const getGoogleApiKey = (): string => {
  const apiKey = process.env.GOOGLE_API_KEY || '';
  
  if (!apiKey) {
    console.warn('AVISO: Chave da API Google não encontrada nas variáveis de ambiente.');
    console.warn('Crie um arquivo .env.local na raiz do projeto com GOOGLE_API_KEY=SuaChaveAqui');
  }
  
  return apiKey;
};

// Verifica se a chave é válida
export const isValidApiKey = (key: string): boolean => {
  // Uma chave Google válida geralmente tem aproximadamente 39 caracteres
  return Boolean(key && key.length > 20);
}; 