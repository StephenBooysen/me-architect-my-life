// Shared utilities and components used across multiple pages

// Simple Markdown Parser
class MarkdownParser {
  static parse(markdown) {
    if (!markdown) return '';
    
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // Bold and Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      // Lists
      .replace(/^\* (.*$)/gm, '<li>$1</li>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      // Line breaks
      .replace(/\n/g, '<br>');
    
    // Wrap consecutive <li> elements in <ul>
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    html = html.replace(/<\/ul><br><ul>/g, '');
    
    return html;
  }
}

// AI Chat Component (used in multiple pages)
class AIChatComponent {
  static initialized = false;

  static init() {
    // Prevent duplicate initialization
    if (this.initialized) return;
    this.initialized = true;

    const aiChatForm = document.getElementById('ai-chat-form');
    const aiChatInput = document.getElementById('ai-chat-input');
    const clearChatBtn = document.getElementById('clear-chat');

    if (aiChatForm) {
      aiChatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = aiChatInput.value.trim();
        if (message) {
          await this.sendMessage(message);
          aiChatInput.value = '';
        }
      });
    }

    if (clearChatBtn) {
      clearChatBtn.addEventListener('click', () => {
        this.clearChat();
      });
    }

    this.updateChatStatus();
  }

  static async sendMessage(message) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    if (!messagesContainer) return;

    // Add user message
    this.addMessage(message, 'user');

    try {
      // Check if API key is configured
      const apiKey = localStorage.getItem('claude-api-key');
      if (!apiKey) {
        this.addMessage('Please configure your Claude API key in settings to use the AI chat feature.', 'ai');
        return;
      }

      // Send to API
      const response = await API.post('/claude', {
        messages: [{ role: 'user', content: message }],
        system: "You are a helpful AI assistant specializing in personal development, goal setting, and productivity. You're integrated into the 'Architect My Life' application to help users achieve their goals.",
        apiKey: apiKey
      });

      if (response.content && response.content[0] && response.content[0].text) {
        this.addMessage(response.content[0].text, 'ai');
      } else {
        this.addMessage('Sorry, I had trouble processing your request. Please try again.', 'ai');
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      this.addMessage('Sorry, there was an error processing your request. Please check your API key and try again.', 'ai');
    }
  }

  static addMessage(content, type) {
    const messagesContainer = document.getElementById('ai-chat-messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${content}</p>
      </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  static clearChat() {
    const messagesContainer = document.getElementById('ai-chat-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = `
        <div class="ai-message welcome-message">
          <div class="message-content">
            <p>Hello! I'm here to help you with your goals, habits, and personal development journey. What would you like to work on today?</p>
          </div>
        </div>
      `;
    }
  }

  static updateChatStatus() {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    const apiKey = localStorage.getItem('claude-api-key');

    if (statusIndicator && statusText) {
      if (apiKey) {
        statusIndicator.classList.remove('offline');
        statusIndicator.classList.add('online');
        statusText.textContent = 'AI Assistant Ready';
      } else {
        statusIndicator.classList.remove('online');
        statusIndicator.classList.add('offline');
        statusText.textContent = 'Configure API key in settings';
      }
    }
  }
}

// Export classes for use in other files
window.MarkdownParser = MarkdownParser;
window.AIChatComponent = AIChatComponent;