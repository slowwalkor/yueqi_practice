import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AudioProvider } from './context/AudioCtx'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <HashRouter>
        <AudioProvider>
          <App />
        </AudioProvider>
      </HashRouter>
    </AppProvider>
  </React.StrictMode>
)
