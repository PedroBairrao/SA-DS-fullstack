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

db.run(createTableSql, (err) => {
  if (err) {
    console.error('Erro ao criar tabela de usuários:', err.message);
    process.exit(1);
  }
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

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
