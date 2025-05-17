/**
 * Orumaiv Chat Widget
 * 
 * Um widget de chat simples para integração com o Orumaiv Bot API.
 */

(function() {
    // Configuração padrão
    const DEFAULT_CONFIG = {
        apiUrl: 'http://localhost:8000/api/v1',
        position: 'bottom-right',
        theme: 'light',
        title: 'Orumaiv Assistente',
        placeholder: 'Digite sua mensagem...',
        welcomeMessage: 'Olá! Sou o assistente Orumaiv. Como posso ajudar?',
        userId: 'guest-' + Math.random().toString(36).substring(2, 15)
    };
    
    // Classe do widget
    class OrumaivWidget {
        /**
         * Inicializa o widget de chat.
         * 
         * @param {Object} config - Configuração do widget
         */
        constructor(config) {
            this.config = { ...DEFAULT_CONFIG, ...config };
            this.messages = [];
            this.isOpen = false;
            this.sessionId = 'session-' + Math.random().toString(36).substring(2, 15);
            
            this.createWidgetElement();
            this.registerEventListeners();
            
            // Adiciona mensagem de boas vindas
            this.addBotMessage(this.config.welcomeMessage);
        }
        
        /**
         * Cria os elementos HTML do widget.
         */
        createWidgetElement() {
            // Cria o container principal
            this.container = document.createElement('div');
            this.container.className = `orumaiv-widget ${this.config.position} ${this.config.theme}`;
            
            // Cria o botão de chat
            this.chatButton = document.createElement('div');
            this.chatButton.className = 'orumaiv-chat-button';
            this.chatButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10a9.96 9.96 0 0 1-6.383-2.302l-.244-.209-4.244 1.41a1 1 0 0 1-1.302-1.225l.097-.178 1.403-4.246A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2zm0 2a8 8 0 0 0-8 8c0 1.335.326 2.618.94 3.766l.35.654-1.375 4.126 4.125-1.374.653.35A7.98 7.98 0 0 0 12 20a8 8 0 0 0 0-16zm-1 5h2v2h-2V9zm0 3h2v4h-2v-4z"/></svg>';
            
            // Cria o chat window
            this.chatWindow = document.createElement('div');
            this.chatWindow.className = 'orumaiv-chat-window';
            this.chatWindow.style.display = 'none';
            
            // Cria o cabeçalho do chat
            this.chatHeader = document.createElement('div');
            this.chatHeader.className = 'orumaiv-chat-header';
            this.chatHeader.innerHTML = `
                <div class="orumaiv-chat-title">${this.config.title}</div>
                <div class="orumaiv-chat-close">&times;</div>
            `;
            
            // Cria a área de mensagens
            this.chatMessages = document.createElement('div');
            this.chatMessages.className = 'orumaiv-chat-messages';
            
            // Cria a área de entrada
            this.chatInput = document.createElement('div');
            this.chatInput.className = 'orumaiv-chat-input';
            this.chatInput.innerHTML = `
                <input type="text" placeholder="${this.config.placeholder}">
                <button type="button">Enviar</button>
            `;
            
            // Monta a estrutura
            this.chatWindow.appendChild(this.chatHeader);
            this.chatWindow.appendChild(this.chatMessages);
            this.chatWindow.appendChild(this.chatInput);
            
            this.container.appendChild(this.chatButton);
            this.container.appendChild(this.chatWindow);
            
            // Adiciona ao documento
            document.body.appendChild(this.container);
            
            // Salva referências para elementos importantes
            this.inputElement = this.chatInput.querySelector('input');
            this.sendButton = this.chatInput.querySelector('button');
            this.closeButton = this.chatHeader.querySelector('.orumaiv-chat-close');
        }
        
        /**
         * Registra os event listeners.
         */
        registerEventListeners() {
            // Toggle chat window
            this.chatButton.addEventListener('click', () => this.toggleChat());
            this.closeButton.addEventListener('click', () => this.toggleChat(false));
            
            // Envio de mensagem
            this.sendButton.addEventListener('click', () => this.sendMessage());
            this.inputElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
        
        /**
         * Alterna a visibilidade do chat.
         * 
         * @param {boolean} [force] - Forçar estado
         */
        toggleChat(force) {
            this.isOpen = force !== undefined ? force : !this.isOpen;
            this.chatWindow.style.display = this.isOpen ? 'flex' : 'none';
            
            if (this.isOpen) {
                this.inputElement.focus();
            }
        }
        
        /**
         * Envia uma mensagem para o bot.
         */
        async sendMessage() {
            const text = this.inputElement.value.trim();
            if (!text) return;
            
            // Limpa o input
            this.inputElement.value = '';
            
            // Adiciona a mensagem à UI
            this.addUserMessage(text);
            
            try {
                // Mostra indicador de digitação
                this.addTypingIndicator();
                
                // Envia para a API
                const response = await this.callApi(text);
                
                // Remove indicador de digitação
                this.removeTypingIndicator();
                
                // Adiciona a resposta do bot
                this.addBotMessage(response.content);
                
            } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
                
                // Remove indicador de digitação
                this.removeTypingIndicator();
                
                // Adiciona mensagem de erro
                this.addBotMessage('Desculpe, tive um problema ao processar sua mensagem. Por favor, tente novamente.');
            }
        }
        
        /**
         * Chama a API do Orumaiv.
         * 
         * @param {string} text - Texto da mensagem
         * @returns {Promise<Object>} - Resposta da API
         */
        async callApi(text) {
            const response = await fetch(`${this.config.apiUrl}/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: this.config.userId,
                    content: text,
                    session_id: this.sessionId
                })
            });
            
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }
            
            return await response.json();
        }
        
        /**
         * Adiciona uma mensagem do usuário à UI.
         * 
         * @param {string} text - Texto da mensagem
         */
        addUserMessage(text) {
            const messageElement = document.createElement('div');
            messageElement.className = 'orumaiv-message user-message';
            messageElement.textContent = text;
            
            this.chatMessages.appendChild(messageElement);
            this.scrollToBottom();
            
            // Adiciona à lista de mensagens
            this.messages.push({
                sender: 'user',
                text: text,
                timestamp: new Date().toISOString()
            });
        }
        
        /**
         * Adiciona uma mensagem do bot à UI.
         * 
         * @param {string} text - Texto da mensagem
         */
        addBotMessage(text) {
            const messageElement = document.createElement('div');
            messageElement.className = 'orumaiv-message bot-message';
            messageElement.textContent = text;
            
            this.chatMessages.appendChild(messageElement);
            this.scrollToBottom();
            
            // Adiciona à lista de mensagens
            this.messages.push({
                sender: 'bot',
                text: text,
                timestamp: new Date().toISOString()
            });
        }
        
        /**
         * Adiciona um indicador de digitação.
         */
        addTypingIndicator() {
            // Remove qualquer indicador existente
            this.removeTypingIndicator();
            
            const indicator = document.createElement('div');
            indicator.className = 'orumaiv-typing-indicator';
            indicator.innerHTML = '<span></span><span></span><span></span>';
            
            const container = document.createElement('div');
            container.className = 'orumaiv-message bot-message typing';
            container.appendChild(indicator);
            
            this.chatMessages.appendChild(container);
            this.scrollToBottom();
        }
        
        /**
         * Remove o indicador de digitação.
         */
        removeTypingIndicator() {
            const typingIndicator = this.chatMessages.querySelector('.typing');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }
        
        /**
         * Rola a área de mensagens para o final.
         */
        scrollToBottom() {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }
    
    // Adiciona estilos CSS
    function addStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .orumaiv-widget {
                position: fixed;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .orumaiv-widget.bottom-right {
                right: 20px;
                bottom: 20px;
            }
            
            .orumaiv-widget.bottom-left {
                left: 20px;
                bottom: 20px;
            }
            
            .orumaiv-chat-button {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background-color: #5D5FEF;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                transition: transform 0.3s;
            }
            
            .orumaiv-chat-button:hover {
                transform: scale(1.1);
            }
            
            .orumaiv-chat-window {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 350px;
                height: 500px;
                border-radius: 10px;
                background-color: white;
                box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .orumaiv-widget.bottom-left .orumaiv-chat-window {
                right: auto;
                left: 0;
            }
            
            .orumaiv-chat-header {
                padding: 15px;
                background-color: #5D5FEF;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .orumaiv-chat-title {
                font-weight: bold;
            }
            
            .orumaiv-chat-close {
                cursor: pointer;
                font-size: 24px;
            }
            
            .orumaiv-chat-messages {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                background-color: #f5f8fb;
            }
            
            .orumaiv-message {
                max-width: 80%;
                padding: 10px 15px;
                border-radius: 20px;
                margin-bottom: 10px;
                word-wrap: break-word;
            }
            
            .user-message {
                background-color: #5D5FEF;
                color: white;
                margin-left: auto;
                border-bottom-right-radius: 5px;
            }
            
            .bot-message {
                background-color: #E4E6EB;
                color: #1c1e21;
                margin-right: auto;
                border-bottom-left-radius: 5px;
            }
            
            .orumaiv-typing-indicator {
                display: flex;
                align-items: center;
            }
            
            .orumaiv-typing-indicator span {
                height: 8px;
                width: 8px;
                background-color: #888;
                border-radius: 50%;
                display: inline-block;
                margin-right: 5px;
                animation: wave 1.3s linear infinite;
            }
            
            .orumaiv-typing-indicator span:nth-child(2) {
                animation-delay: -1.1s;
            }
            
            .orumaiv-typing-indicator span:nth-child(3) {
                animation-delay: -0.9s;
                margin-right: 0;
            }
            
            @keyframes wave {
                0%, 60%, 100% {
                    transform: initial;
                }
                30% {
                    transform: translateY(-5px);
                }
            }
            
            .orumaiv-chat-input {
                display: flex;
                padding: 10px;
                border-top: 1px solid #E4E6EB;
            }
            
            .orumaiv-chat-input input {
                flex: 1;
                padding: 10px 15px;
                border: 1px solid #ccc;
                border-radius: 20px;
                outline: none;
            }
            
            .orumaiv-chat-input button {
                background-color: #5D5FEF;
                color: white;
                border: none;
                border-radius: 20px;
                padding: 10px 15px;
                margin-left: 10px;
                cursor: pointer;
            }
            
            .orumaiv-widget.dark .orumaiv-chat-window {
                background-color: #222;
                color: #eee;
            }
            
            .orumaiv-widget.dark .orumaiv-chat-messages {
                background-color: #333;
            }
            
            .orumaiv-widget.dark .user-message {
                background-color: #5D5FEF;
            }
            
            .orumaiv-widget.dark .bot-message {
                background-color: #444;
                color: #eee;
            }
            
            .orumaiv-widget.dark .orumaiv-chat-input {
                border-top: 1px solid #444;
            }
            
            .orumaiv-widget.dark .orumaiv-chat-input input {
                background-color: #222;
                border: 1px solid #444;
                color: #eee;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    // Adiciona o objeto OrumaivChat ao escopo global
    window.OrumaivChat = {
        init: function(config) {
            addStyles();
            return new OrumaivWidget(config);
        }
    };
})(); 