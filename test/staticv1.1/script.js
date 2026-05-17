const App = {
    init() {
        this.bindEvents();
        this.initAnimations();
    },

    bindEvents() {
        this.setupNavLinks();
        this.setupChat();
        this.setupScrollEffects();
        this.setupKeyboardNavigation();
    },

    setupNavLinks() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                document.querySelector('.nav-links').classList.remove('active');
                document.querySelector('.hamburger').classList.remove('active');

                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    },

    setupChat() {
        const chatInput = document.getElementById('chatInput');
        const chatMessages = document.getElementById('chatMessages');

        const sendMessage = () => {
            const message = chatInput.value.trim();
            if (!message) return;

            this.addMessage(message, 'user');
            chatInput.value = '';

            const typingIndicator = this.createTypingIndicator();
            chatMessages.appendChild(typingIndicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            setTimeout(() => {
                chatMessages.removeChild(typingIndicator);
                const responses = [
                    '这是一个很好的问题！让我来详细解答一下。在现代Web开发中，我们通常会采用模块化和组件化的方式来构建应用...',
                    '我理解你的需求，这是我的建议：首先分析需求，然后设计架构，最后逐步实现各个功能模块。',
                    '好的，我来帮你分析这个问题。首先需要了解背景，然后分析可能的解决方案，最后选择最优方案。',
                    '感谢你的提问！关于这个话题，我的看法是：技术选型需要考虑多方面因素，包括团队经验、项目需求和长期维护。',
                    '这个问题很有意思，让我思考一下...通常我们会从用户体验、性能优化和代码质量三个维度来考量。'
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                this.addMessage(randomResponse, 'bot');
            }, 1500);
        };

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        window.sendMessage = sendMessage;
    },

    addMessage(content, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        const p = document.createElement('p');
        p.textContent = content;

        contentDiv.appendChild(p);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    },

    createTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            indicator.appendChild(dot);
        }
        
        return indicator;
    },

    setupScrollEffects() {
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    },

    initAnimations() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('.reveal').forEach(el => {
            observer.observe(el);
        });
    },

    setupKeyboardNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');

        hamburger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleMenu();
            }
        });

        navLinks.querySelectorAll('a, button').forEach((el, index) => {
            el.setAttribute('tabindex', '-1');
            el.setAttribute('role', 'menuitem');
        });
    }
};

function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');
    
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
    
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', !isExpanded);
    
    navLinks.querySelectorAll('a, button').forEach((el) => {
        const tabindex = navLinks.classList.contains('active') ? '0' : '-1';
        el.setAttribute('tabindex', tabindex);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});