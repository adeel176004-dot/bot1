import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
// In development, the CSS is injected via JS. In production, we need to inject the CSS into the shadow root manually.
import './index.css';

let rootElement = document.getElementById('root');
let shadowContainer: ShadowRoot | null = null;

// If embedded on a third-party site, use the dedicated container with Shadow DOM created by embed.js
if (window.VOICEGPT_CONFIG) {
  const hostElement = document.getElementById('voicegpt-host');
  if (hostElement && hostElement.shadowRoot) {
    shadowContainer = hostElement.shadowRoot;
    rootElement = shadowContainer.getElementById('voicegpt-root');
    
    // Inject Tailwind styles into Shadow DOM in dev mode
    // Vite will inject styles to <head>. We need to move/copy them.
    const observer = new MutationObserver((mutations) => {
       mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
             if (node.nodeName === 'STYLE') {
                // If it's a vite style, clone it to shadow dom and remove from head
                const clone = node.cloneNode(true);
                shadowContainer!.appendChild(clone);
                // We remove it from head to prevent polluting host styles in dev
                if (node.parentNode === document.head) {
                   document.head.removeChild(node);
                }
             }
          });
       });
    });
    observer.observe(document.head, { childList: true });
    
    // Also copy any existing styles that might have already been added
    document.querySelectorAll('head > style').forEach(node => {
      shadowContainer!.appendChild(node.cloneNode(true));
      node.remove();
    });
  }
} else if (!rootElement) {
  rootElement = document.createElement('div');
  rootElement.id = 'voicegpt-root';
  document.body.appendChild(rootElement);
}

createRoot(rootElement!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
