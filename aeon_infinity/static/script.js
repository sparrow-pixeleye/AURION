/**
 * AEON Infinity — Infinity Intelligence
 * Frontend JavaScript Implementation
 * Created by Apratim Mrinal
 */

class AEONInfinity {
    constructor() {
        this.conversationId = this.generateConversationId();
        this.isProcessing = false;
        this.particles = [];
        this.animationId = null;

        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.initParticleBackground();
        this.loadTheme();
        this.updateMemoryStatus();
        this.setupKeyboardShortcuts();
    }

    setupElements() {
        // Core elements
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.aeonLogo = document.getElementById('aeonLogo');

        // Controls
        this.themeToggle = document.getElementById('themeToggle');
        this.memoryToggle = document.getElementById('memoryToggle');
        this.clearMemoryBtn = document.getElementById('clearMemoryBtn');

        // Status
        this.memoryCount = document.getElementById('memoryCount');
        this.chimeAudio = document.getElementById('chimeAudio');

        // Canvas
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Input state
        this.usePersistentMemory = true;
    }

    setupEventListeners() {
        // Send message
        this.sendButton.addEventListener('click', () => this.sendMessage());

        // Input events
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => {
            this.autoResizeTextarea();
            this.updateSendButton();
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Memory controls
        this.memoryToggle.addEventListener('change', (e) => {
            this.usePersistentMemory = e.target.checked;
            this.saveMemoryPreference();
        });

        this.clearMemoryBtn.addEventListener('click', () => this.clearMemory());

        // Window resize
        window.addEventListener('resize', () => this.handleResize());

        // Focus input on page load
        setTimeout(() => this.messageInput.focus(), 100);
    }

    initParticleBackground() {
        this.resizeCanvas();
        this.createParticles();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        const particleCount = Math.min(100, Math.floor((window.innerWidth * window.innerHeight) / 15000));

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.3,
                hue: Math.random() * 60 + 160 // Cyan to violet range
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${particle.hue}, 100%, 60%, ${particle.opacity})`;
            this.ctx.fill();

            // Draw connections
            this.particles.forEach(otherParticle => {
                const distance = Math.sqrt(
                    Math.pow(particle.x - otherParticle.x, 2) +
                    Math.pow(particle.y - otherParticle.y, 2)
                );

                if (distance < 100 && distance > 0) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.strokeStyle = `hsla(${particle.hue}, 100%, 60%, ${0.1 * (1 - distance / 100)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            });
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+L: Clear memory
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                this.clearMemory();
            }

            // Ctrl+T: Toggle theme
            if (e.ctrlKey && e.key === 't') {
                e.preventDefault();
                this.toggleTheme();
            }

            // Escape: Focus input
            if (e.key === 'Escape') {
                this.messageInput.focus();
            }
        });
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();

        if (!message || this.isProcessing) return;

        // Add user message to UI
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.autoResizeTextarea();
        this.updateSendButton();

        // Set processing state
        this.setProcessingState(true);
        this.animateAeonLogo();

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversation_id: this.conversationId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Add AI response to UI
            this.addMessage(data.response, 'assistant', data.type);
            this.updateMemoryStatus();

            // Play chime sound
            this.playChime();

        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessage(
                'I apologize, but I\'m experiencing connection issues. Please check your internet connection and try again.',
                'assistant',
                'error'
            );
        } finally {
            this.setProcessingState(false);
            this.stopAeonLogoAnimation();
            this.messageInput.focus();
        }
    }

    addMessage(content, role, type = 'normal') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message fade-in`;

        const timestamp = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <div class="avatar-orb"></div>
            </div>
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(content)}</div>
                <div class="message-timestamp">${timestamp}</div>
            </div>
        `;

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();

        // Remove animation class after animation completes
        setTimeout(() => {
            messageDiv.classList.remove('fade-in');
        }, 600);
    }

    setProcessingState(processing) {
        this.isProcessing = processing;
        this.sendButton.disabled = processing;
        this.messageInput.disabled = processing;

        if (processing) {
            this.loadingIndicator.classList.add('active');
        } else {
            this.loadingIndicator.classList.remove('active');
        }

        this.updateSendButton();
    }

    animateAeonLogo() {
        const orb = this.aeonLogo.querySelector('.orb-inner');
        if (orb) {
            orb.style.animation = 'orbBreathing 1s ease-in-out infinite';
        }
    }

    stopAeonLogoAnimation() {
        const orb = this.aeonLogo.querySelector('.orb-inner');
        if (orb) {
            orb.style.animation = 'orbBreathing 3s ease-in-out infinite';
        }
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(
            this.messageInput.scrollHeight,
            120
        ) + 'px';
    }

    updateSendButton() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendButton.disabled = !hasText || this.isProcessing;
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('aeon-theme', newTheme);

        // Update particle colors
        this.particles.forEach(particle => {
            particle.hue = newTheme === 'light' ?
                Math.random() * 60 + 200 : // Blue range for light
                Math.random() * 60 + 160;  // Cyan-violet for dark
        });
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('aeon-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);

        if (savedTheme === 'light') {
            this.particles.forEach(particle => {
                particle.hue = Math.random() * 60 + 200;
            });
        }
    }

    async clearMemory() {
        if (this.isProcessing) return;

        try {
            const response = await fetch('/clear_memory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                // Clear UI messages except welcome
                const messages = this.messagesContainer.querySelectorAll('.message');
                messages.forEach((message, index) => {
                    if (index > 0) { // Keep the welcome message
                        message.style.opacity = '0';
                        message.style.transform = 'translateX(20px)';
                        setTimeout(() => message.remove(), 300);
                    }
                });

                this.updateMemoryStatus();

                // Add confirmation message
                this.addMessage('Conversation memory cleared. How can I help you today?', 'assistant');
            }
        } catch (error) {
            console.error('Error clearing memory:', error);
        }
    }

    async updateMemoryStatus() {
        try {
            const response = await fetch('/memory_status');
            if (response.ok) {
                const data = await response.json();
                this.memoryCount.textContent = data.message_count;
            }
        } catch (error) {
            console.error('Error updating memory status:', error);
        }
    }

    saveMemoryPreference() {
        localStorage.setItem('aeon-memory-pref', this.usePersistentMemory);
    }

    loadMemoryPreference() {
        const saved = localStorage.getItem('aeon-memory-pref');
        if (saved !== null) {
            this.usePersistentMemory = saved === 'true';
            this.memoryToggle.checked = this.usePersistentMemory;
        }
    }

    playChime() {
        if (this.chimeAudio) {
            this.chimeAudio.currentTime = 0;
            this.chimeAudio.play().catch(() => {
                // Ignore audio play errors (user may not have interacted with page)
            });
        }
    }

    handleResize() {
        this.resizeCanvas();

        // Adjust particle count based on screen size
        const targetCount = Math.min(100, Math.floor((window.innerWidth * window.innerHeight) / 15000));
        const currentCount = this.particles.length;

        if (targetCount > currentCount) {
            for (let i = currentCount; i < targetCount; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    size: Math.random() * 3 + 1,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.5,
                    opacity: Math.random() * 0.5 + 0.3,
                    hue: Math.random() * 60 + 160
                });
            }
        } else if (targetCount < currentCount) {
            this.particles = this.particles.slice(0, targetCount);
        }
    }

    generateConversationId() {
        return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize AEON when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.AEON = new AEONInfinity();

    // Add some interactivity to the logo
    const aeonLogo = document.getElementById('aeonLogo');
    let clickCount = 0;

    aeonLogo.addEventListener('click', () => {
        clickCount++;
        if (clickCount >= 3) {
            clickCount = 0;

            // Easter egg: Special animation
            const orb = aeonLogo.querySelector('.orb-container');
            orb.style.animation = 'none';
            setTimeout(() => {
                orb.style.animation = 'orbRotation 2s linear infinite';
            }, 10);

            // Add special message
            if (window.AEON) {
                window.AEON.addMessage(
                    'Infinity! You\'ve discovered the infinity sequence! AEON acknowledges your curiosity.',
                    'assistant'
                );
            }
        }
    });

    // Performance optimization: Reduce particles on low-end devices
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (window.AEON && window.AEON.particles) {
            window.AEON.particles = window.AEON.particles.slice(0, 20);
        }
    }

    console.log('🌌 AEON ∞ (Infinity Intelligence) initialized');
    console.log('Created by Apratim Mrinal');
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.AEON && window.AEON.animationId) {
        cancelAnimationFrame(window.AEON.animationId);
    }
});

// Service Worker for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker registration can be added here for PWA functionality
    });
}