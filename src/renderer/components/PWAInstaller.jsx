import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Show update available notification
                console.log('New version available');
              }
            });
          });
        } catch (registrationError) {
          console.log('SW registration failed: ', registrationError);
        }
      });
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Check if already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    checkIfInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed or recently dismissed
  if (isInstalled || !showInstallPrompt) return null;

  const recentlyDismissed = localStorage.getItem('pwa-install-dismissed');
  if (recentlyDismissed && Date.now() - parseInt(recentlyDismissed) < 7 * 24 * 60 * 60 * 1000) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Install Architect My Life
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add to your home screen for quick access
              </p>
            </div>
          </div>
          <button
            onClick={dismissPrompt}
            className="flex-shrink-0 ml-2 p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleInstall}
            className="btn-primary text-sm px-4 py-2"
          >
            Install
          </button>
          <button
            onClick={dismissPrompt}
            className="btn-outline text-sm px-4 py-2"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default PWAInstaller;