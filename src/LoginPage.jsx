import { useState } from 'react'
import { loginUser } from './api/apiClient'

function LoginPage({ onSwitch }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg('')
    if (!senha || (!email && !username)) {
      setMsg('Forneça senha e email ou nome de usuário.')
      return
    }
    setLoading(true)
    const res = await loginUser({ email: email || undefined, senha, username: username || undefined })
    setLoading(false)
    if (res.ok) {
      setMsg('Entrou ✅')
      // se quiser, aqui pode redirecionar ou salvar token
    } else {
      setMsg(res.body?.error || `Não entrou (${res.status})`)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-area">
          <div className="brand-logo">LOGO</div>
          <p className="brand-text">Bem-vindo de volta. Entre para continuar.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field-label">
            Nome
            <input
              className="field-input"
              type="text"
              placeholder="Seu nome"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label className="field-label">
            Email
            <input
              className="field-input"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="field-label">
            Senha
            <input
              className="field-input"
              type="password"
              placeholder="••••••••"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </label>

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          {msg && <div style={{ marginTop: 10 }}>{msg}</div>}
        </form>

        <div className="auth-footer">
          <span>Não tem conta?</span>
          <button className="text-button" type="button" onClick={onSwitch}>
            Cadastrar
          </button>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
