import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

document.cookie = "cookieName=unicornCookieValue; path=/react-journaling";

// Service Worker Registration Script
// This script registers the service worker to enable offline capabilities and improve performance.
if ('serviceWorker' in navigator) {
  // We register the service worker after the page has loaded to avoid any potential
  // contention for resources during the initial page load.
  window.addEventListener('load', () => {
    // Construct an absolute URL for the service worker script to fix same-origin policy errors
    // that can occur in certain hosting environments (like sandboxed iframes) where relative
    // paths might resolve to an incorrect origin.
    const swUrl = new URL('sw.js', window.location.href);

    navigator.serviceWorker.register(swUrl.href)
      .then(registration => {
        console.log('Service Worker registered successfully with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
