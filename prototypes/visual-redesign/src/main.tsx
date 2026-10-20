import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import { LocaleProvider } from '@/data/locale';
import { CompareProvider } from '@/data/compare';

import './index.css';
import './cinematic.css';

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <LocaleProvider>
      <BrowserRouter>
        <CompareProvider>
          <App />
        </CompareProvider>
      </BrowserRouter>
    </LocaleProvider>
  </ErrorBoundary>,
);
