import { useState } from 'react'
import LoginPage from './LoginPage.jsx'
import SignupPage from './SignupPage.jsx'

function App() {
  const [isLogin, setIsLogin] = useState(true)

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
        <LoginPage onSwitch={() => setIsLogin(false)} />
      ) : (
        <SignupPage onSwitch={() => setIsLogin(true)} />
      )}
    </div>
  )
}

export default App
