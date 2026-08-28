import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// BrowserRouter 讓 React 可以使用前端路由(網頁路徑切換)
import { BrowserRouter } from 'react-router-dom'
import './styles.css'
import App from './App.jsx'

// 匯入 AuthProvider
import { AuthProvider } from './state/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* AuthProvider 包住 App 讓整個系統都可以使用登入狀態 */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
