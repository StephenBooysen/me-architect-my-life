import React, { useState, useEffect } from "react";
import { Key, Bot, Save, Eye, EyeOff, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";

function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  // Load API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('claude_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const saveApiKey = () => {
    try {
      if (apiKey.trim()) {
        localStorage.setItem('claude_api_key', apiKey.trim());
        setSaveStatus({ type: 'success', message: 'API key saved successfully!' });
      } else {
        localStorage.removeItem('claude_api_key');
        setSaveStatus({ type: 'success', message: 'API key removed successfully!' });
      }
      
      // Clear save status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({ type: 'error', message: 'Failed to save API key.' });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const testConnection = async () => {
    if (!apiKey.trim()) {
      setConnectionStatus({ type: 'error', message: 'Please enter an API key first.' });
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus(null);

    try {
      // Determine the correct endpoint based on environment
      const isElectron = typeof window !== "undefined" && window.electronAPI;
      const baseUrl = isElectron ? 'http://localhost:4001' : '';
      
      // Use the proxy endpoint to test the connection
      const response = await fetch(`${baseUrl}/api/claude/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: apiKey.trim()
        })
      });

      if (response.ok) {
        setConnectionStatus({ type: 'success', message: 'Connection successful! Your API key is working.' });
      } else {
        const errorData = await response.json();
        setConnectionStatus({ 
          type: 'error', 
          message: errorData.error || `Connection failed: ${response.status}` 
        });
      }
    } catch (error) {
      setConnectionStatus({ 
        type: 'error', 
        message: `Connection failed: ${error.message}` 
      });
    } finally {
      setIsTestingConnection(false);
      // Clear connection status after 5 seconds
      setTimeout(() => setConnectionStatus(null), 5000);
    }
  };

  const clearApiKey = () => {
    setApiKey('');
    localStorage.removeItem('claude_api_key');
    setConnectionStatus(null);
    setSaveStatus({ type: 'success', message: 'API key cleared successfully!' });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your application preferences</p>
      </div>

      {/* AI Assistant Settings */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center space-x-3 mb-6">
            <Bot className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">AI Assistant Settings</h2>
          </div>
          
          {/* API Key Section */}
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label flex items-center space-x-2">
                <Key className="w-4 h-4" />
                <span>Claude API Key</span>
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Claude API key (sk-ant-...)" 
                    className="form-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={saveApiKey}
                  className="btn btn-primary flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Your API key is stored locally and never shared. 
                <a 
                  href="https://console.anthropic.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-hover inline-flex items-center ml-1"
                >
                  Get your API key here
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </p>
            </div>
            
            {/* Save Status */}
            {saveStatus && (
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                saveStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {saveStatus.type === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm">{saveStatus.message}</span>
              </div>
            )}
            
            {/* Test Connection */}
            <div className="flex space-x-3">
              <button
                onClick={testConnection}
                disabled={isTestingConnection || !apiKey.trim()}
                className="btn btn-secondary flex items-center"
              >
                {isTestingConnection ? (
                  <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Bot className="w-4 h-4 mr-2" />
                )}
                {isTestingConnection ? 'Testing...' : 'Test Connection'}
              </button>
              
              {apiKey && (
                <button
                  onClick={clearApiKey}
                  className="btn text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Clear API Key
                </button>
              )}
            </div>
            
            {/* Connection Status */}
            {connectionStatus && (
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                connectionStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {connectionStatus.type === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm">{connectionStatus.message}</span>
              </div>
            )}
          </div>
          
          {/* AI Features Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">AI Assistant Features</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Automatic page analysis after 1 minute of inactivity</li>
              <li>• Personalized insights based on your goals, habits, and reflections</li>
              <li>• Interactive chat for questions and guidance</li>
              <li>• Context-aware recommendations for each section</li>
              <li>• Persistent conversation history across sessions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Application Settings */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Settings</h2>
          <div className="text-center text-gray-500 py-8">
            Additional settings coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
