import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AdsProvider } from './components/AdsProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AdsProvider>
        <App />
      </AdsProvider>
    </BrowserRouter>
  </StrictMode>,
);
