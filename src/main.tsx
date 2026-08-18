import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global guard against cross-origin iframe or audio autoplay unhandled rejections
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Caught unhandled rejection:', event.reason);
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  if (
    event.message?.includes('Script error') ||
    event.message?.includes('postMessage') ||
    event.filename?.includes('youtube')
  ) {
    console.warn('Caught cross-origin or video frame notice:', event.message);
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

