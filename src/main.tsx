import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import { Landing } from './Landing'
import { Hub } from './Hub'
import { ToastProvider } from './components/Toast'
import './index.css'

const Main = () => {
  return (
    <React.StrictMode>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/hub" element={<Hub />} />
            <Route path="/editor" element={<App />} />
            <Route path="/editor/:id" element={<App />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Main />)
