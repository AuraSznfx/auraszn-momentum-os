import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Storage adapter using localStorage for standalone deployment
if (!window.storage) {
  window.storage = {
    async get(key) {
      var val = localStorage.getItem(key);
      return val !== null ? { key: key, value: val, shared: false } : null;
    },
    async set(key, value) {
      localStorage.setItem(key, value);
      return { key: key, value: value, shared: false };
    },
    async delete(key) {
      localStorage.removeItem(key);
      return { key: key, deleted: true, shared: false };
    },
    async list(prefix) {
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!prefix || k.startsWith(prefix)) keys.push(k);
      }
      return { keys: keys, shared: false };
    }
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(React.StrictMode, null, React.createElement(App))
)
