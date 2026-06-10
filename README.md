# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

Markdown
# Finance API

Uma API REST simples e eficiente para gerenciamento de usuários e controle de transações financeiras (entradas e saídas), utilizando **Node.js**, **Express** e banco de dados **SQLite**.

## 🚀 Tecnologias Utilizadas

* **Node.js** - Ambiente de execução JavaScript.
* **Express** - Framework web para construção das rotas.
* **SQLite3** - Banco de dados relacional leve e em arquivo.
* **Bcryptjs** - Criptografia de senhas (hashing).
* **CORS** - Compartilhamento de recursos entre origens diferentes.

---

## 🛠️ Instalação e Execução

1. Instale as dependências do projeto:
   ```bash
   npm install
Inicie o servidor:

Bash
npm start
O servidor rodará por padrão na porta 3001 (http://localhost:3001).

🛣️ Rotas da API
Autenticação e Usuários
POST /register
Realiza o cadastro de um novo usuário. A senha é criptografada antes de ser salva.

Corpo da Requisição (JSON):

JSON
{
  "email": "usuario@email.com",
  "senha": "sua_senha_segura",
  "username": "nome_usuario"
}
Respostas: 201 Created (Sucesso) | 400 Bad Request (Campos ausentes/senhas não coincidem) | 409 Conflict (E-mail já cadastrado).

POST /login
Autentica um usuário cadastrado. Aceita login por e-mail ou nome de usuário.

Corpo da Requisição (JSON):

JSON
{
  "email": "usuario@email.com", 
  "senha": "sua_senha_segura"
}
(ou alterne o campo email por username)

Respostas: 200 OK (Logado com sucesso) | 400 Bad Request (Falta de credenciais) | 401 Unauthorized (Credenciais inválidas).

Transações Financeiras
POST /transactions
Cria uma nova transação financeira vinculada ao e-mail do usuário.

Corpo da Requisição (JSON):

JSON
{
  "email": "usuario@email.com",
  "message": "Compra do mês",
  "type": "saída", 
  "value": 150.50,
  "date": "2026-06-10"
}
Nota: O campo type aceita apenas os valores "entrada" ou "saída". A message possui limite máximo de 50 caracteres.

Respostas: 201 Created | 400 Bad Request.

GET /transactions
Lista todas as transações ativas de um usuário, ordenadas das mais recentes para as mais antigas.

Parâmetro de URL (Query): ?email=usuario@email.com

Respostas: 200 OK | 400 Bad Request.

DELETE /transactions/:id
Realiza a exclusão lógica (soft delete) de uma transação específica através do seu ID. A transação não é apagada fisicamente, mas recebe uma marcação em deleted_at.

Parâmetro de Rota: ID da transação (ex: /transactions/1)

Respostas: 200 OK | 404 Not Found (Se já deletada ou inexistente).

GET /transactions-deleted
Recupera o histórico de transações que foram excluídas (útil para fins de auditoria ou lixeira).

Parâmetro de URL (Query): ?email=usuario@email.com

Respostas: 200 OK | 400 Bad Request.