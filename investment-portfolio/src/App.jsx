import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './routes/AppRoutes'

const App = () => (
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    <AuthProvider>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1f2b',
            color: '#ffffff',
            border: '1px solid #232b38',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#00c853', secondary: '#000' } },
          error: { iconTheme: { primary: '#ff5252', secondary: '#000' } },
        }}
      />
    </AuthProvider>
  </BrowserRouter>
)

export default App
