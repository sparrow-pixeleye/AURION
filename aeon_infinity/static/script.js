/**
 * AEON Infinity - Gemini-Style AI Interface
 * Complete JavaScript implementation with all Gemini features
 * Created by Apratim Mrinal
 */

class AEONGeminiInterface {
    constructor() {
        this.conversationId = this.generateConversationId();
        this.currentChatId = this.generateChatId();
        this.isProcessing = false;
        this.settings = {
            memory: true,
            autoScroll: true,
            darkTheme: false,
            animations: true,
            temperature: 0.7,
            maxTokens: 1000
        };

        this.chatHistory = [];
        this.currentMessages = [];

        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.loadSettings();
        this.loadChatHistory();
        this.applyTheme();
        this.setupKeyboardShortcuts();
        this.initializeInterface();
    }

    setupElements() {
        // Main elements
        this.sidebar = document.getElementById('sidebar');
        this.chatArea = document.getElementById('chatArea');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');

        // Header elements
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.settingsBtn = document.getElementById('settingsBtn');

        // Sidebar elements
        this.sidebarNewChatBtn = document.getElementById('sidebarNewChatBtn');
        this.chatHistory = document.getElementById('chatHistory');
        this.modelSelect = document.getElementById('modelSelect');
        this.clearMemoryBtn = document.getElementById('clearMemoryBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.helpBtn = document.getElementById('helpBtn');

        // Input elements
        this.attachBtn = document.getElementById('attachBtn');
        this.microphoneBtn = document.getElementById('microphoneBtn');

        // Modal elements
        this.settingsModal = document.getElementById('settingsModal');
        this.shareModal = document.getElementById('shareModal');
        this.settingsClose = document.getElementById('settingsClose');
        this.shareClose = document.getElementById('shareClose');

        // Settings elements
        this.memoryToggle = document.getElementById('memoryToggle');
        this.autoScrollToggle = document.getElementById('autoScrollToggle');
        this.darkThemeToggle = document.getElementById('darkThemeToggle');
        this.animationsToggle = document.getElementById('animationsToggle');
        this.temperatureSlider = document.getElementById('temperatureSlider');
        this.temperatureValue = document.getElementById('temperatureValue');
        this.maxTokensInput = document.getElementById('maxTokensInput');

        // Other elements
        this.toast = document.getElementById('toast');
        this.toastMessage = document.getElementById('toastMessage');
        this.suggestionCards = document.querySelectorAll('.suggestion-card');
    }

    setupEventListeners() {
        // Header buttons
        this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        this.newChatBtn.addEventListener('click', () => this.createNewChat());
        this.shareBtn.addEventListener('click', () => this.openShareModal());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.settingsBtn.addEventListener('click', () => this.openSettingsModal());

        // Sidebar buttons
        this.sidebarNewChatBtn.addEventListener('click', () => this.createNewChat());
        this.clearMemoryBtn.addEventListener('click', () => this.clearAllConversations());
        this.exportBtn.addEventListener('click', () => this.exportConversations());
        this.helpBtn.addEventListener('click', () => this.showHelp());

        // Model selector
        this.modelSelect.addEventListener('change', (e) => this.handleModelChange(e.target.value));

        // Input area
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => this.handleInputKeydown(e));
        this.messageInput.addEventListener('input', () => this.handleInputChange());
        this.attachBtn.addEventListener('click', () => this.handleFileAttach());
        this.microphoneBtn.addEventListener('click', () => this.handleVoiceInput());

        // Suggestion cards
        this.suggestionCards.forEach(card => {
            card.addEventListener('click', () => {
                const suggestion = card.dataset.suggestion;
                this.messageInput.value = suggestion;
                this.sendMessage();
            });
        });

        // Modal close buttons
        this.settingsClose.addEventListener('click', () => this.closeSettingsModal());
        this.shareClose.addEventListener('click', () => this.closeShareModal());

        // Modal overlays
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Settings
        this.memoryToggle.addEventListener('change', (e) => this.updateSetting('memory', e.target.checked));
        this.autoScrollToggle.addEventListener('change', (e) => this.updateSetting('autoScroll', e.target.checked));
        this.darkThemeToggle.addEventListener('change', (e) => this.updateSetting('darkTheme', e.target.checked));
        this.animationsToggle.addEventListener('change', (e) => this.updateSetting('animations', e.target.checked));
        this.temperatureSlider.addEventListener('input', (e) => {
            this.updateSetting('temperature', parseFloat(e.target.value));
            this.temperatureValue.textContent = e.target.value;
        });
        this.maxTokensInput.addEventListener('change', (e) => this.updateSetting('maxTokens', parseInt(e.target.value)));

        // Window resize
        window.addEventListener('resize', () => this.handleResize());

        // Prevent accidental navigation
        window.addEventListener('beforeunload', (e) => {
            if (this.currentMessages.length > 1) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    initializeInterface() {
        // Set initial states
        this.updateSendButton();
        this.autoResizeTextarea();

        // Focus input on load
        setTimeout(() => this.messageInput.focus(), 100);

        // Welcome screen state
        this.updateWelcomeScreen();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K - New chat
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.createNewChat();
            }

            // Ctrl/Cmd + / - Focus input
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.messageInput.focus();
            }

            // Ctrl/Cmd + S - Settings
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.openSettingsModal();
            }

            // Ctrl/Cmd + D - Toggle dark mode
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.toggleTheme();
            }

            // Escape - Close modals, focus input
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.active');
                if (openModal) {
                    this.closeModal(openModal);
                } else {
                    this.messageInput.focus();
                }
            }
        });
    }

    // ===== Chat Management =====
    createNewChat() {
        // Save current chat if it has messages
        if (this.currentMessages.length > 0) {
            this.saveCurrentChat();
        }

        // Reset current state
        this.currentChatId = this.generateChatId();
        this.currentMessages = [];

        // Clear UI
        this.messagesContainer.innerHTML = '';
        this.messageInput.value = '';
        this.autoResizeTextarea();

        // Update UI state
        this.updateWelcomeScreen();
        this.updateChatHistoryUI();
        this.messageInput.focus();

        this.showToast('New chat started');
    }

    saveCurrentChat() {
        if (this.currentMessages.length === 0) return;

        const chat = {
            id: this.currentChatId,
            title: this.generateChatTitle(this.currentMessages[0]?.content || 'New Chat'),
            messages: this.currentMessages,
            timestamp: new Date().toISOString(),
            model: this.modelSelect.value
        };

        this.chatHistory.unshift(chat);

        // Keep only last 50 chats
        if (this.chatHistory.length > 50) {
            this.chatHistory = this.chatHistory.slice(0, 50);
        }

        this.saveChatHistory();
        this.updateChatHistoryUI();
    }

    loadChat(chatId) {
        const chat = this.chatHistory.find(c => c.id === chatId);
        if (!chat) return;

        // Save current chat if it has messages
        if (this.currentMessages.length > 0) {
            this.saveCurrentChat();
        }

        // Load selected chat
        this.currentChatId = chatId;
        this.currentMessages = [...chat.messages];
        this.modelSelect.value = chat.model;

        // Update UI
        this.renderMessages();
        this.updateWelcomeScreen();
        this.updateChatHistoryUI();
        this.scrollToBottom();
        this.messageInput.focus();
    }

    deleteChat(chatId) {
        const index = this.chatHistory.findIndex(c => c.id === chatId);
        if (index === -1) return;

        this.chatHistory.splice(index, 1);
        this.saveChatHistory();
        this.updateChatHistoryUI();

        // If deleted chat was current, create new chat
        if (this.currentChatId === chatId) {
            this.createNewChat();
        }

        this.showToast('Chat deleted');
    }

    // ===== Message Handling =====
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isProcessing) return;

        // Hide welcome screen
        if (this.welcomeScreen) {
            this.welcomeScreen.style.display = 'none';
        }

        // Add user message
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.autoResizeTextarea();

        // Set processing state
        this.setProcessingState(true);

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversation_id: this.conversationId,
                    model: this.modelSelect.value,
                    temperature: this.settings.temperature,
                    max_tokens: this.settings.maxTokens
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.addMessage(data.response, 'assistant', data.type);

        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessage(
                'I apologize, but I\'m experiencing connection issues. Please check your internet connection and try again.',
                'assistant',
                'error'
            );
        } finally {
            this.setProcessingState(false);
            this.messageInput.focus();
        }
    }

    addMessage(content, role, type = 'normal') {
        const message = {
            id: this.generateMessageId(),
            content: content,
            role: role,
            type: type,
            timestamp: new Date().toISOString()
        };

        this.currentMessages.push(message);
        this.renderMessage(message);
        this.updateWelcomeScreen();

        if (this.settings.autoScroll) {
            this.scrollToBottom();
        }
    }

    renderMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role}-message`;
        messageDiv.dataset.messageId = message.id;

        const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        const avatarText = message.role === 'user' ? 'U' : 'A';

        messageDiv.innerHTML = `
            <div class="message-avatar">${avatarText}</div>
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(message.content)}</div>
                <div class="message-actions">
                    <button class="message-action-btn" onclick="aeon.copyMessage('${message.id}')" title="Copy">
                        <span class="material-icons">content_copy</span>
                    </button>
                    <button class="message-action-btn" onclick="aeon.regenerateMessage('${message.id}')" title="Regenerate" ${message.role === 'user' ? 'style="display:none;"' : ''}>
                        <span class="material-icons">refresh</span>
                    </button>
                    <button class="message-action-btn" onclick="aeon.editMessage('${message.id}')" title="Edit" ${message.role === 'user' ? '' : 'style="display:none;"'}>
                        <span class="material-icons">edit</span>
                    </button>
                    <button class="message-action-btn" onclick="aeon.deleteMessage('${message.id}')" title="Delete">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </div>
        `;

        this.messagesContainer.appendChild(messageDiv);

        if (this.settings.animations) {
            // Trigger animation
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateY(10px)';
            setTimeout(() => {
                messageDiv.style.opacity = '1';
                messageDiv.style.transform = 'translateY(0)';
            }, 10);
        }
    }

    renderMessages() {
        this.messagesContainer.innerHTML = '';
        this.currentMessages.forEach(message => {
            this.renderMessage(message);
        });
    }

    // ===== UI Management =====
    updateWelcomeScreen() {
        if (!this.welcomeScreen) return;

        if (this.currentMessages.length === 0) {
            this.welcomeScreen.style.display = 'flex';
        } else {
            this.welcomeScreen.style.display = 'none';
        }
    }

    updateChatHistoryUI() {
        this.chatHistory.innerHTML = '';

        this.chatHistory.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-history-item ${chat.id === this.currentChatId ? 'active' : ''}`;
            chatItem.innerHTML = `
                <div class="chat-title">${this.escapeHtml(chat.title)}</div>
                <div class="chat-time">${this.formatChatTime(chat.timestamp)}</div>
            `;

            chatItem.addEventListener('click', () => this.loadChat(chat.id));

            // Add right-click context menu
            chatItem.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showChatContextMenu(e, chat.id);
            });

            this.chatHistory.appendChild(chatItem);
        });
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('hidden');
    }

    setProcessingState(processing) {
        this.isProcessing = processing;
        this.sendButton.disabled = processing;
        this.messageInput.disabled = processing;
        this.updateSendButton();

        if (processing) {
            this.addTypingIndicator();
        } else {
            this.removeTypingIndicator();
        }
    }

    addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">A</div>
            <div class="message-content">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingIndicator = this.messagesContainer.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    updateSendButton() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendButton.disabled = !hasText || this.isProcessing;
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(
            this.messageInput.scrollHeight,
            200
        ) + 'px';
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    // ===== Theme Management =====
    toggleTheme() {
        this.settings.darkTheme = !this.settings.darkTheme;
        this.applyTheme();
        this.saveSettings();
        this.updateThemeIcon();
    }

    applyTheme() {
        if (this.settings.darkTheme) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        this.darkThemeToggle.checked = this.settings.darkTheme;
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const icon = this.themeToggle.querySelector('.material-icons');
        icon.textContent = this.settings.darkTheme ? 'light_mode' : 'dark_mode';
    }

    // ===== Settings Management =====
    loadSettings() {
        const saved = localStorage.getItem('aeon-settings');
        if (saved) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Error loading settings:', e);
            }
        }

        // Apply settings to UI
        this.memoryToggle.checked = this.settings.memory;
        this.autoScrollToggle.checked = this.settings.autoScroll;
        this.animationsToggle.checked = this.settings.animations;
        this.temperatureSlider.value = this.settings.temperature;
        this.temperatureValue.textContent = this.settings.temperature;
        this.maxTokensInput.value = this.settings.maxTokens;
    }

    saveSettings() {
        localStorage.setItem('aeon-settings', JSON.stringify(this.settings));
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }

    // ===== Modal Management =====
    openSettingsModal() {
        this.settingsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeSettingsModal() {
        this.settingsModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    openShareModal() {
        if (this.currentMessages.length === 0) {
            this.showToast('No messages to share');
            return;
        }
        this.shareModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeShareModal() {
        this.shareModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ===== Chat History Management =====
    loadChatHistory() {
        const saved = localStorage.getItem('aeon-chat-history');
        if (saved) {
            try {
                this.chatHistory = JSON.parse(saved);
                this.updateChatHistoryUI();
            } catch (e) {
                console.error('Error loading chat history:', e);
                this.chatHistory = [];
            }
        }
    }

    saveChatHistory() {
        localStorage.setItem('aeon-chat-history', JSON.stringify(this.chatHistory));
    }

    clearAllConversations() {
        if (!confirm('Are you sure you want to clear all conversations? This action cannot be undone.')) {
            return;
        }

        this.chatHistory = [];
        this.currentMessages = [];
        this.saveChatHistory();
        this.updateChatHistoryUI();
        this.messagesContainer.innerHTML = '';
        this.updateWelcomeScreen();
        this.showToast('All conversations cleared');
    }

    exportConversations() {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            conversations: this.chatHistory,
            currentConversation: {
                id: this.currentChatId,
                messages: this.currentMessages
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aeon-conversations-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('Conversations exported successfully');
    }

    // ===== Message Actions =====
    copyMessage(messageId) {
        const message = this.currentMessages.find(m => m.id === messageId);
        if (!message) return;

        navigator.clipboard.writeText(message.content).then(() => {
            this.showToast('Message copied');
        }).catch(() => {
            this.showToast('Failed to copy message');
        });
    }

    regenerateMessage(messageId) {
        const messageIndex = this.currentMessages.findIndex(m => m.id === messageId);
        if (messageIndex === -1 || messageIndex === 0) return;

        // Remove the message to regenerate
        this.currentMessages.splice(messageIndex, 1);

        // Find the previous user message and resend
        for (let i = messageIndex - 1; i >= 0; i--) {
            if (this.currentMessages[i].role === 'user') {
                this.renderMessages();
                this.messageInput.value = this.currentMessages[i].content;
                this.sendMessage();
                break;
            }
        }
    }

    editMessage(messageId) {
        const message = this.currentMessages.find(m => m.id === messageId);
        if (!message || message.role !== 'user') return;

        const newContent = prompt('Edit message:', message.content);
        if (newContent && newContent.trim() !== message.content) {
            message.content = newContent.trim();
            this.renderMessages();
            this.showToast('Message updated');
        }
    }

    deleteMessage(messageId) {
        const messageIndex = this.currentMessages.findIndex(m => m.id === messageId);
        if (messageIndex === -1) return;

        this.currentMessages.splice(messageIndex, 1);
        this.renderMessages();
        this.updateWelcomeScreen();
        this.showToast('Message deleted');
    }

    // ===== Utility Functions =====
    handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    handleInputChange() {
        this.autoResizeTextarea();
        this.updateSendButton();
    }

    handleFileAttach() {
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.pdf,.txt,.doc,.docx';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileUpload(file);
            }
        };
        input.click();
    }

    handleFileUpload(file) {
        this.showToast(`File "${file.name}" uploaded (feature coming soon)`);
    }

    handleVoiceInput() {
        if (!('webkitSpeechRecognition' in window)) {
            this.showToast('Voice input is not supported in your browser');
            return;
        }

        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            this.microphoneBtn.style.color = 'var(--accent-primary)';
            this.showToast('Listening...');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.messageInput.value = transcript;
            this.autoResizeTextarea();
            this.updateSendButton();
            this.showToast('Voice input captured');
        };

        recognition.onerror = (event) => {
            this.showToast('Voice input error: ' + event.error);
        };

        recognition.onend = () => {
            this.microphoneBtn.style.color = '';
        };

        recognition.start();
    }

    handleModelChange(model) {
        this.showToast(`Model changed to ${model}`);
    }

    handleResize() {
        // Handle responsive sidebar
        if (window.innerWidth <= 768) {
            this.sidebar.classList.add('hidden');
        }
    }

    showChatContextMenu(event, chatId) {
        // Simple context menu implementation
        if (confirm('Delete this chat?')) {
            this.deleteChat(chatId);
        }
    }

    showHelp() {
        alert(`Keyboard Shortcuts:

Ctrl/Cmd + K - New chat
Ctrl/Cmd + / - Focus input
Ctrl/Cmd + S - Settings
Ctrl/Cmd + D - Toggle dark mode
Escape - Close modal / Focus input

Features:
• Click on suggestion cards for quick prompts
• Right-click chat history for options
• Hover over messages for action buttons
• Use voice input with the microphone button
• Export conversations for backup`);
    }

    showToast(message) {
        this.toastMessage.textContent = message;
        this.toast.classList.add('show');

        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    // ===== Helper Functions =====
    generateConversationId() {
        return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateChatId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateChatTitle(firstMessage) {
        const words = firstMessage.split(' ').slice(0, 5);
        return words.join(' ') + (words.length === 5 ? '...' : '');
    }

    formatChatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize AEON when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aeon = new AEONGeminiInterface();

    console.log('🌌 AEON Infinity - Gemini Interface Initialized');
    console.log('Created by Apratim Mrinal');
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.aeon) {
        window.aeon.saveCurrentChat();
    }
});