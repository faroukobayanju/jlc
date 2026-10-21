import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/archivo/wdth.css';
import App from './App';
import './index.css';

// Old links used hash routing (/#/products). Move them to real paths once.
if (window.location.hash.startsWith('#/')) {
  window.history.replaceState(null, '', window.location.hash.slice(1));
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
