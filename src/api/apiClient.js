const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options);
    const body = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    // rede/connection error
    return { ok: false, status: 0, body: { error: 'Erro de conexão: não foi possível alcançar o servidor.' } };
  }
}

export async function registerUser({ email, senha, username, name, confirmSenha }) {
  const payload = { email, senha, username, name, confirmSenha };
  return await safeFetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function loginUser({ email, senha, username }) {
  const payload = { email, senha, username };
  return await safeFetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}