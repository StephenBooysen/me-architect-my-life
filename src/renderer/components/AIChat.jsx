import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDatabase } from '../contexts/UnifiedDatabaseContext';
import { MessageCircle, Send, Bot, User, Settings, ChevronRight, ChevronLeft, Loader } from 'lucide-react';
import { format } from 'date-fns';

function AIChat({ currentPage, pageData }) {
  const db = useDatabase();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);
  const pageTimerRef = useRef(null);
  const lastPageRef = useRef('');

  // Initialize session ID
  useEffect(() => {
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
  }, []);

  // Load API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('claude_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Load chat history
  useEffect(() => {
    if (sessionId) {
      loadChatHistory();
    }
  }, [sessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Page change detection and auto-analysis
  useEffect(() => {
    // Clear existing timer
    if (pageTimerRef.current) {
      clearTimeout(pageTimerRef.current);
    }

    // Only start timer if page has changed and we have an API key
    if (currentPage && currentPage !== lastPageRef.current && apiKey) {
      lastPageRef.current = currentPage;
      
      // Set 1-minute timer for auto-analysis
      pageTimerRef.current = setTimeout(() => {
        performPageAnalysis();
      }, 60000); // 60 seconds
    }

    return () => {
      if (pageTimerRef.current) {
        clearTimeout(pageTimerRef.current);
      }
    };
  }, [currentPage, pageData, apiKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      // Load recent chat history
      const chatHistory = await db.getAIChats(null, 50);
      
      if (chatHistory) {
        setMessages(chatHistory.map(chat => ({
          id: chat.id,
          role: chat.role,
          content: chat.message,
          timestamp: chat.created_at,
          context: chat.context
        })));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatMessage = async (role, content, context = null) => {
    try {
      await db.saveAIChat(
        sessionId, 
        role, 
        content, 
        context || JSON.stringify({ page: currentPage })
      );
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };

  const callClaudeAPI = async (messages, systemPrompt = null) => {
    if (!apiKey) {
      throw new Error('Claude API key not configured. Please add your API key in settings.');
    }

    // Use the proxy endpoint to avoid CORS issues
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: apiKey,
        system: systemPrompt || "You are a helpful AI assistant specializing in personal development, goal setting, and productivity. You help users analyze their progress and provide actionable insights.",
        messages: messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  };

  const performPageAnalysis = async () => {
    if (!apiKey || !pageData || isAnalyzing) return;

    setIsAnalyzing(true);
    
    try {
      const analysisPrompt = generatePageAnalysisPrompt(currentPage, pageData);
      const contextMessage = `📊 Analyzing your ${currentPage} data...`;
      
      // Add analysis indicator message
      const newMessage = {
        id: Date.now(),
        role: 'assistant',
        content: contextMessage,
        timestamp: new Date().toISOString(),
        isAnalysis: true
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Call Claude API with page-specific analysis
      const response = await callClaudeAPI([
        { role: 'user', content: analysisPrompt }
      ], getSystemPromptForPage(currentPage));

      // Replace analysis indicator with actual response
      const analysisMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        isAnalysis: true
      };

      setMessages(prev => [...prev.slice(0, -1), analysisMessage]);
      
      // Save to database
      await saveChatMessage('assistant', response, JSON.stringify({
        page: currentPage,
        analysis: true,
        dataSnapshot: pageData
      }));

    } catch (error) {
      console.error('Error performing page analysis:', error);
      const errorMessage = {
        id: Date.now(),
        role: 'assistant',
        content: `I couldn't analyze your ${currentPage} data right now. ${error.message}`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generatePageAnalysisPrompt = (page, data) => {
    switch (page) {
      case 'goals':
        return `Please analyze my goal progress data and provide insights:

${JSON.stringify(data, null, 2)}

Focus on:
- Progress towards goals
- Patterns in completion rates
- Suggestions for improvement
- Motivational insights
- Next steps recommendations`;

      case 'habits':
        return `Please analyze my habit tracking data and provide insights:

${JSON.stringify(data, null, 2)}

Focus on:
- Habit consistency patterns
- Success rates and trends
- Suggestions for building better habits
- Identifying potential obstacles
- Optimization recommendations`;

      case 'reflection':
        return `Please analyze my reflection data and provide insights:

${JSON.stringify(data, null, 2)}

Focus on:
- Emotional and mental patterns
- Growth insights from reflections
- Recurring themes or challenges
- Suggestions for deeper self-reflection
- Personal development opportunities`;

      case 'wisdom':
        return `Please analyze my wisdom library and provide insights:

${JSON.stringify(data, null, 2)}

Focus on:
- Themes in collected wisdom
- How insights apply to current goals
- Connections between different pieces of wisdom
- Suggestions for applying these insights
- Recommendations for personal growth`;

      case 'focus-areas':
        return `Please analyze my focus area allocation and provide insights:

${JSON.stringify(data, null, 2)}

Focus on:
- Balance across life areas
- Progress in each focus area
- Suggestions for better focus allocation
- Identifying neglected areas
- Strategic recommendations for life balance`;

      default:
        return `Please provide general guidance and motivation based on my current context: ${JSON.stringify(data, null, 2)}`;
    }
  };

  const getSystemPromptForPage = (page) => {
    const basePrompt = "You are an AI life coach and personal development expert. ";
    
    switch (page) {
      case 'goals':
        return basePrompt + "You specialize in goal setting, progress tracking, and achievement strategies. Provide actionable insights to help users reach their objectives.";
      case 'habits':
        return basePrompt + "You specialize in habit formation, behavior change, and routine optimization. Help users build sustainable positive habits.";
      case 'reflection':
        return basePrompt + "You specialize in self-reflection, emotional intelligence, and personal growth. Help users gain deeper insights from their experiences.";
      case 'wisdom':
        return basePrompt + "You specialize in connecting wisdom and insights to practical life applications. Help users apply knowledge to their personal growth journey.";
      case 'focus-areas':
        return basePrompt + "You specialize in life balance, priority management, and strategic life planning. Help users optimize their focus across different life areas.";
      default:
        return basePrompt + "Provide personalized guidance for overall life improvement and personal development.";
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Save user message
    await saveChatMessage('user', userMessage.content);

    try {
      // Prepare context for Claude
      const conversationHistory = [...messages, userMessage].slice(-10); // Last 10 messages for context
      
      const response = await callClaudeAPI(conversationHistory, getSystemPromptForPage(currentPage));

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      await saveChatMessage('assistant', response);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `I apologize, but I couldn't process your message. ${error.message}`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai-chat-sidebar h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="ai-chat-header bg-primary text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5" />
          <h3 className="font-semibold">AI Life Coach</h3>
          {isAnalyzing && <Loader className="w-4 h-4 animate-spin" />}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs opacity-75">Claude</span>
        </div>
      </div>

      {/* API Key Warning */}
      {!apiKey && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-3">
          <div className="flex items-center space-x-2 text-yellow-800 text-sm">
            <Settings className="w-4 h-4" />
            <span>Add your Claude API key in Settings to enable AI assistance</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="mb-2">Welcome to your AI Life Coach!</p>
            <p className="text-sm">I'll analyze your progress and provide personalized guidance.</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`w-full p-3 ${
              message.role === 'user'
                ? 'bg-gray-100'
                : message.isError
                ? 'bg-red-100'
                : message.isAnalysis
                ? 'bg-amber-50'
                : 'bg-amber-50'
            }`}
          >
              <div className="flex items-start space-x-2">
                {message.role === 'assistant' && (
                  <Bot className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    message.isAnalysis ? 'text-primary' : 'text-gray-600'
                  }`} />
                )}
                {message.role === 'user' && (
                  <User className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-600" />
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-900">
                    {message.content}
                  </p>
                  <p className="text-xs mt-2 opacity-70 text-gray-500">
                    {format(new Date(message.timestamp), 'HH:mm')}
                  </p>
                </div>
              </div>
            </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
placeholder=""
            disabled={!apiKey || isLoading}
            className="flex-1 resize-none p-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            rows="2"
          />
          <button
            onClick={sendMessage}
            disabled={!apiKey || !inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIChat;