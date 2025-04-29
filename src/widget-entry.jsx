import React from 'react';
import ReactDOM from 'react-dom/client';
import TestBot from './components/TestBot';
import './index.css';


function init({ elementId = 'chat-widget-container' } = {}) {
  let container = document.getElementById(elementId);
  if (!container) {
    container = document.createElement('div');
    container.id = elementId;
    document.body.appendChild(container); 
  }
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <TestBot />
    </React.StrictMode>
  );
}

if (typeof window !== 'undefined') {
  window.initChatWidget = init;
}

export default init;
