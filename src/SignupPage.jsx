import { useState } from 'react'
import { registerUser } from './api/apiClient'

function SignupPage({ onSwitch }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmSenha, setConfirmSenha] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg('')
    if (!name || !email || !senha) {
      setMsg('Preencha nome, email e senha.')
      return
    }
    if (senha !== confirmSenha) {
      setMsg('Senha e confirmação não coincidem.')
      return
    }
    setLoading(true)
    const res = await registerUser({ email, senha, username: name, name, confirmSenha })
    setLoading(false)
    if (res.ok) {
      setMsg('Cadastro realizado com sucesso.')
      setName(''); setEmail(''); setSenha(''); setConfirmSenha('')
    } else {
      setMsg(res.body?.error || `Erro (${res.status})`)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-area">
          <div className="brand-logo">LOGO</div>
          <p className="brand-text">Crie sua conta e comece agora mesmo.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field-label">
            Nome
            <input
              className="field-input"
              type="text"
              placeholder="Seu nome"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="field-label">
            Email
            <input
              className="field-input"
              type="email"
              placeholder="seu@email.com"
              required
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

          <label className="field-label">
            Confirmar senha
            <input
              className="field-input"
              type="password"
              placeholder="••••••••"
              required
              value={confirmSenha}
              onChange={(e) => setConfirmSenha(e.target.value)}
            />
          </label>

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
          {msg && <div style={{ marginTop: 10 }}>{msg}</div>}
        </form>

        <div className="auth-footer">
          <span>Já tem uma conta?</span>
          <button className="text-button" type="button" onClick={onSwitch}>
            Faça login
          </button>
        </div>
      </section>
    </main>
  )
}

export default SignupPage
