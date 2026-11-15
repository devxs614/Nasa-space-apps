import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import './styles/globals.css';
import { App } from './App';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

if (import.meta.env.DEV) {
  void Promise.all([
    import('./state/useJourneyStore'),
    import('./state/useAppStore'),
    import('./state/useUiStore'),
  ]).then(([j, a, u]) => {
    Object.assign(window, {
      __journey: j.useJourneyStore,
      __app: a.useAppStore,
      __ui: u.useUiStore,
    });
  });
}
