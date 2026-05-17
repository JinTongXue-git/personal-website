// 导航菜单切换
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// 导航链接点击处理
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        // 移除所有active类
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        // 添加当前链接的active类
        this.classList.add('active');
        
        // 关闭移动端菜单
        document.querySelector('.nav-links').classList.remove('active');
        
        // 平滑滚动到对应区域
        const href = this.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// 聊天功能
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // 添加用户消息
    addMessage(message, 'user');
    chatInput.value = '';

    // 模拟AI回复
    setTimeout(() => {
        const responses = [
            '这是一个很好的问题！让我来详细解答一下...',
            '我理解你的需求，这是我的建议：',
            '好的，我来帮你分析这个问题。首先...',
            '感谢你的提问！关于这个话题，我的看法是：',
            '这个问题很有意思，让我思考一下...'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage(randomResponse + '\n\n这是模拟回复，实际项目中将连接AI服务。', 'bot');
    }, 800);
}

function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const p = document.createElement('p');
    p.textContent = content;
    
    contentDiv.appendChild(p);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 回车键发送消息
chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// 页面加载时添加欢迎消息
document.addEventListener('DOMContentLoaded', function() {
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// 导航栏滚动效果
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(26, 26, 46, 0.95)';
    } else {
        navbar.style.background = 'rgba(26, 26, 46, 0.8)';
    }
});