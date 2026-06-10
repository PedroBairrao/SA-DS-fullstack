import { useState, useEffect } from 'react'
import { createTransaction, getTransactions, deleteTransaction } from './api/apiClient'

function DashboardPage({ userEmail, onLogout }) {
  const [transactions, setTransactions] = useState([])
  const [message, setMessage] = useState('')
  const [type, setType] = useState('entrada')
  const [value, setValue] = useState('')
  const [formMsg, setFormMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [userEmail])

  async function loadTransactions() {
    setLoading(true)
    const res = await getTransactions(userEmail)
    if (res.ok) {
      setTransactions(res.body.transactions || [])
    } else {
      console.error('Erro ao carregar transações:', res.body)
    }
    setLoading(false)
  }

  async function handleAddTransaction(e) {
    e.preventDefault()
    setFormMsg('')

    if (!message || !value) {
      setFormMsg('Preencha mensagem e valor.')
      return
    }

    if (message.length > 50) {
      setFormMsg('A mensagem não pode ter mais de 50 caracteres.')
      return
    }

    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue <= 0) {
      setFormMsg('Valor deve ser um número positivo.')
      return
    }

    const date = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    setLoading(true)
    const res = await createTransaction({ 
      email: userEmail, 
      message, 
      type, 
      value: numValue, 
      date 
    })
    setLoading(false)

    if (res.ok) {
      setMessage('')
      setValue('')
      setType('entrada')
      setFormMsg('Transação adicionada! ✅')
      loadTransactions()
    } else {
      setFormMsg(res.body?.error || 'Erro ao adicionar transação')
    }
  }

  async function handleDeleteTransaction(id) {
    const res = await deleteTransaction(id)
    if (res.ok) {
      loadTransactions()
    } else {
      console.error('Erro ao deletar:', res.body)
    }
  }

  const totalEntrada = transactions
    .filter(t => t.type === 'entrada')
    .reduce((acc, t) => acc + t.value, 0)

  const totalSaida = transactions
    .filter(t => t.type === 'saída')
    .reduce((acc, t) => acc + t.value, 0)

  const saldo = totalEntrada - totalSaida

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard Financeiro</h1>
          <button className="logout-button" onClick={onLogout}>
            Sair
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        <section className="stats-area">
          <div className="stat-card entrada">
            <div className="stat-label">Total de Entradas</div>
            <div className="stat-value">R$ {totalEntrada.toFixed(2)}</div>
          </div>
          <div className="stat-card saida">
            <div className="stat-label">Total de Saídas</div>
            <div className="stat-value">R$ {totalSaida.toFixed(2)}</div>
          </div>
          <div className="stat-card saldo">
            <div className="stat-label">Saldo</div>
            <div className={`stat-value ${saldo >= 0 ? 'positivo' : 'negativo'}`}>
              R$ {saldo.toFixed(2)}
            </div>
          </div>
        </section>

        <section className="form-area">
          <div className="form-card">
            <h2>Adicionar Transação</h2>
            <form onSubmit={handleAddTransaction} className="transaction-form">
              <label className="field-label">
                Mensagem
                <input
                  className="field-input"
                  type="text"
                  placeholder="Descrição da transação"
                  maxLength="50"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </label>

              <div className="form-row">
                <label className="field-label">
                  Tipo
                  <select
                    className="field-input field-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="entrada">Entrada</option>
                    <option value="saída">Saída</option>
                  </select>
                </label>

                <label className="field-label">
                  Valor
                  <input
                    className="field-input"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </label>
              </div>

              <button className="primary-button" type="submit">
                Adicionar
              </button>
              {formMsg && <div className="form-feedback">{formMsg}</div>}
            </form>
          </div>
        </section>

        <section className="transactions-area">
          <div className="transactions-card">
            <h2>Histórico de Transações</h2>
            {transactions.length === 0 ? (
              <div className="empty-state">
                <p>Nenhuma transação registrada ainda.</p>
              </div>
            ) : (
              <div className="transactions-list">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
                    <div className="transaction-info">
                      <div className="transaction-message">{transaction.message}</div>
                      <div className="transaction-date">{transaction.date}</div>
                    </div>
                    <div className="transaction-right">
                      <div className={`transaction-value ${transaction.type}`}>
                        {transaction.type === 'entrada' ? '+' : '-'} R$ {transaction.value.toFixed(2)}
                      </div>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        title="Deletar transação"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default DashboardPage
