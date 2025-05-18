import { OrumaivAgent } from './adk-agent';
import { getGoogleApiKey } from '../config/api-keys';

/**
 * Inicialização do agente ADK como singleton para uso em todo o aplicativo
 * 
 * Esta abordagem garante que apenas uma instância do OrumaivAgent seja criada,
 * evitando múltiplas conexões e uso excessivo de recursos
 */

// Inicialização do agente ADK
let adkAgentInstance: OrumaivAgent | null = null;

try {
  // Obtém a chave da API do .env
  const apiKey = getGoogleApiKey();
  
  // Cria o agente apenas se a chave estiver configurada
  adkAgentInstance = new OrumaivAgent({
    apiKey,
    model: 'gemini-2.0-flash',
    temperature: 0.7,
  });
  
  if (adkAgentInstance.isInitialized()) {
    console.log('ADK Agent Instance: Inicializado com sucesso');
  } else {
    console.warn(`ADK Agent Instance: Não inicializado. Erro: ${adkAgentInstance.getInitError()}`);
    adkAgentInstance = null;
  }
} catch (error: any) {
  console.error('ADK Agent Instance: Erro ao inicializar:', error);
  adkAgentInstance = null;
}

// Exporta a instância única
export const adkAgent = adkAgentInstance; 