const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'users.db');

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados SQLite:', err.message);
    process.exit(1);
  }
  console.log('Banco de dados SQLite conectado em', DB_PATH);
});

const createTableSql = `
CREATE TABLE IF NOT EXISTS cadastros (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  username TEXT NOT NULL
);
`;

const createTransactionsTableSql = `
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  value REAL NOT NULL,
  date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  FOREIGN KEY (email) REFERENCES cadastros(email) ON DELETE CASCADE
);
`;

db.run(createTableSql, (err) => {
  if (err) {
    console.error('Erro ao criar tabela de usuários:', err.message);
    process.exit(1);
  }
});

db.run(createTransactionsTableSql, (err) => {
  if (err) {
    console.error('Erro ao criar tabela de transações:', err.message);
    process.exit(1);
  }
  
  // Verificar e adicionar coluna deleted_at se não existir
  db.all("PRAGMA table_info(transactions)", (err, columns) => {
    if (err) {
      console.error('Erro ao verificar estrutura da tabela:', err.message);
      return;
    }
    
    const hasDeletedAtColumn = columns.some(col => col.name === 'deleted_at');
    if (!hasDeletedAtColumn) {
      db.run('ALTER TABLE transactions ADD COLUMN deleted_at DATETIME DEFAULT NULL', (alterErr) => {
        if (alterErr) {
          console.error('Erro ao adicionar coluna deleted_at:', alterErr.message);
        } else {
          console.log('Coluna deleted_at adicionada com sucesso à tabela transactions');
        }
      });
    }
  });
});

app.post('/register', (req, res) => {
  const {
    email,
    senha,
    username,
    name,
    nome,
    confirmSenha,
    confirm_password
  } = req.body;

  // Normalizar/aceitar vários nomes de campos
  const userName = username || name || nome || (email ? email.split('@')[0] : undefined);
  const confirm = typeof confirmSenha !== 'undefined' ? confirmSenha : confirm_password;

  if (!email || !senha || !userName) {
    return res.status(400).json({ error: 'email, senha e nome de usuário são obrigatórios.' });
  }

  if (typeof confirm !== 'undefined' && senha !== confirm) {
    return res.status(400).json({ error: 'Senha e confirmação não coincidem.' });
  }

  // Hash da senha
  const hashed = bcrypt.hashSync(senha, 10);

  const insertSql = 'INSERT INTO cadastros (email, senha, username) VALUES (?, ?, ?)';
  db.run(insertSql, [email, hashed, userName], function (err) {
    if (err) {
      if (err.message && err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Este email já está cadastrado.' });
      }
      console.error('Erro ao inserir usuário:', err);
      return res.status(500).json({ error: 'Erro ao salvar usuário no banco de dados.' });
    }

    res.status(201).json({ message: 'Cadastro realizado com sucesso.', userId: this.lastID });
  });
});

app.post('/login', (req, res) => {
  const { email, senha, username } = req.body;

  if (!senha || (!email && !username)) {
    return res.status(400).json({ error: 'Forneça senha e email ou username.' });
  }

  const whereField = email ? 'email' : 'username';
  const whereValue = email || username;

  const selectSql = `SELECT * FROM cadastros WHERE ${whereField} = ?`;
  db.get(selectSql, [whereValue], (err, row) => {
    if (err) {
      console.error('Erro ao consultar usuário:', err);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }

    if (!row) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const match = bcrypt.compareSync(senha, row.senha);
    if (match) {
      return res.json({ message: 'logado', userId: row.id, username: row.username });
    }

    return res.status(401).json({ error: 'Credenciais inválidas.' });
  });
});

// Endpoints de transações
app.post('/transactions', (req, res) => {
  const { email, message, type, value, date } = req.body;

  if (!email || !message || !type || value === undefined || !date) {
    return res.status(400).json({ error: 'email, message, type, value e date são obrigatórios.' });
  }

  if (type !== 'entrada' && type !== 'saída') {
    return res.status(400).json({ error: 'type deve ser "entrada" ou "saída".' });
  }

  if (typeof message !== 'string' || message.length > 50) {
    return res.status(400).json({ error: 'message deve ter no máximo 50 caracteres.' });
  }

  if (typeof value !== 'number' || value <= 0) {
    return res.status(400).json({ error: 'value deve ser um número positivo.' });
  }

  const insertSql = 'INSERT INTO transactions (email, message, type, value, date) VALUES (?, ?, ?, ?, ?)';
  db.run(insertSql, [email, message, type, value, date], function (err) {
    if (err) {
      console.error('Erro ao inserir transação:', err);
      return res.status(500).json({ error: 'Erro ao salvar transação no banco de dados.' });
    }

    res.status(201).json({ 
      message: 'Transação criada com sucesso.', 
      id: this.lastID,
      transaction: { id: this.lastID, email, message, type, value, date }
    });
  });
});

app.get('/transactions', (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'email é obrigatório.' });
  }

  const selectSql = 'SELECT id, email, message, type, value, date FROM transactions WHERE email = ? AND deleted_at IS NULL ORDER BY created_at DESC';
  db.all(selectSql, [email], (err, rows) => {
    if (err) {
      console.error('Erro ao consultar transações:', err);
      return res.status(500).json({ error: 'Erro ao recuperar transações do banco de dados.' });
    }

    res.json({ transactions: rows || [] });
  });
});

app.delete('/transactions/:id', (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'id é obrigatório.' });
  }

  const deletedAt = new Date().toISOString();
  const softDeleteSql = 'UPDATE transactions SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL';
  db.run(softDeleteSql, [deletedAt, id], function (err) {
    if (err) {
      console.error('Erro ao deletar transação:', err);
      return res.status(500).json({ error: 'Erro ao deletar transação do banco de dados.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Transação não encontrada ou já foi deletada.' });
    }

    res.json({ message: 'Transação deletada com sucesso.' });
  });
});

// Endpoint para recuperar transações deletadas (auditoria)
app.get('/transactions-deleted', (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'email é obrigatório.' });
  }

  const selectSql = 'SELECT id, email, message, type, value, date, deleted_at FROM transactions WHERE email = ? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC';
  db.all(selectSql, [email], (err, rows) => {
    if (err) {
      console.error('Erro ao consultar transações deletadas:', err);
      return res.status(500).json({ error: 'Erro ao recuperar transações deletadas do banco de dados.' });
    }

    res.json({ transactions: rows || [] });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
