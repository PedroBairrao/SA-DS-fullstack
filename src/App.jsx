import { useState } from 'react'
import LoginPage from './LoginPage.jsx'
import SignupPage from './SignupPage.jsx'
import DashboardPage from './DashboardPage.jsx'

function App() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  function handleLoginSuccess(email) {
    setUserEmail(email)
    setIsLoggedIn(true)
  }

  function handleLogout() {
    setUserEmail('')
    setIsLoggedIn(false)
    setIsLogin(true)
  }

  if (isLoggedIn) {
    return <DashboardPage userEmail={userEmail} onLogout={handleLogout} />
  }

  return (
    <div className="app-shell">
      <div className="page-switcher">
        <button
          className={isLogin ? 'switch-button active' : 'switch-button'}
          onClick={() => setIsLogin(true)}
          type="button"
        >
          Entrar
        </button>
        <button
          className={!isLogin ? 'switch-button active' : 'switch-button'}
          onClick={() => setIsLogin(false)}
          type="button"
        >
          Cadastrar
        </button>
      </div>

      {isLogin ? (
        <LoginPage onSwitch={() => setIsLogin(false)} onLoginSuccess={handleLoginSuccess} />
      ) : (
        <SignupPage onSwitch={() => setIsLogin(true)} />
      )}
    </div>
  )
}

export default App
