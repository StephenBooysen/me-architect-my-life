import React, { useState, useEffect } from "react";
import { Key, Bot, Save, Eye, EyeOff, ExternalLink, CheckCircle, AlertCircle, Settings as SettingsIcon, Shield, Zap } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

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
      {/* Header */}
      <Card className="welcome-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="welcome-title">Settings ⚙️</h1>
              <p className="welcome-subtitle">Configure your application preferences</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md mr-3">
                <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">AI Assistant</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {apiKey ? '✓' : '✖'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-md mr-3">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Security</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  Local
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-md mr-3">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Status</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {connectionStatus?.type === 'success' ? 'Ready' : 'Setup'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant Settings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bot className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">AI Assistant Settings</h2>
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
                <Button onClick={saveApiKey}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Your API key is stored locally and never shared. 
                <a 
                  href="https://console.anthropic.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 inline-flex items-center ml-1"
                >
                  Get your API key here
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </p>
            </div>
            
            {/* Save Status */}
            {saveStatus && (
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                saveStatus.type === 'success' 
                  ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200' 
                  : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
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
              <Button
                variant="outline"
                onClick={testConnection}
                disabled={isTestingConnection || !apiKey.trim()}
              >
                {isTestingConnection ? (
                  <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Bot className="w-4 h-4 mr-2" />
                )}
                {isTestingConnection ? 'Testing...' : 'Test Connection'}
              </Button>
              
              {apiKey && (
                <Button
                  variant="outline"
                  onClick={clearApiKey}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  Clear API Key
                </Button>
              )}
            </div>
            
            {/* Connection Status */}
            {connectionStatus && (
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                connectionStatus.type === 'success' 
                  ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200' 
                  : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
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
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">AI Assistant Features</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Automatic page analysis after 1 minute of inactivity</li>
              <li>• Personalized insights based on your goals, habits, and reflections</li>
              <li>• Interactive chat for questions and guidance</li>
              <li>• Context-aware recommendations for each section</li>
              <li>• Persistent conversation history across sessions</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Application Settings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <SettingsIcon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Application Settings</h2>
          </div>
          <div className="text-center text-muted-foreground py-8">
            <SettingsIcon className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium mb-2">Additional settings coming soon...</p>
            <p className="text-sm">Theme preferences, data management, and more features will be added here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Settings;
