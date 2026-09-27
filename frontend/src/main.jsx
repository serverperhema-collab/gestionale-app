import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './contexts/ToastContext.jsx'
import { GlobalStateProvider } from './contexts/GlobalStateContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { installAuthFetch } from './authFetch.js'
import { DialogProvider } from './contexts/DialogContext.jsx'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()
installAuthFetch()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider><DialogProvider><GlobalStateProvider>
            <App />
          </GlobalStateProvider></DialogProvider></AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
