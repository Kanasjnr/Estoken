import React from 'react'
import ReactDOM from 'react-dom/client'
import { ESTokenProvider } from "./context/ESTokenContext"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <ESTokenProvider>
        <App />
        <ToastContainer position="bottom-right" />
      </ESTokenProvider>
  </React.StrictMode>,
)

