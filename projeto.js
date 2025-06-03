// DOM Elements
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');
const btnToggleDarkMode = document.getElementById('toggle-dark-mode');
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('close-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const switchToRegisterBtn = document.getElementById('switch-to-register');
const switchToLoginBtn = document.getElementById('switch-to-login');
const buscarBtn = document.getElementById('buscar-btn');
const resultadosDiv = document.getElementById('results');

const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

// API key Spoonacular (troca pela sua chave real)
const API_KEY = '09b91db0b0694452900df23737e49200';

// Abre modal no modo login ou register
function openModal(mode = 'login') {
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  if (mode === 'login') {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
  } else {
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
  }
  clearErrors();
  clearForms();
}

// Fecha modal
function closeModal() {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  clearErrors();
  clearForms();
}

// Limpa mensagens de erro
function clearErrors() {
  loginError.textContent = '';
  registerError.textContent = '';
}

// Limpa inputs dos forms
function clearForms() {
  loginForm.reset();
  registerForm.reset();
}

// Troca entre forms login/register
switchToRegisterBtn.addEventListener('click', () => openModal('register'));
switchToLoginBtn.addEventListener('click', () => openModal('login'));

// Botões abrir modal login/register
btnLogin.addEventListener('click', () => openModal('login'));
btnRegister.addEventListener('click', () => openModal('register'));

// Fecha modal ao clicar no "X"
closeModalBtn.addEventListener('click', closeModal);

// Fecha modal ao clicar fora do conteúdo
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Login submit (exemplo simulado)
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  clearErrors();

  const email = loginForm['login-email'].value.trim();
  const password = loginForm['login-password'].value.trim();

  // Exemplo de validação simples
  if (!email || !password) {
    loginError.textContent = 'Preencha todos os campos.';
    return;
  }

  // Simulação de login — aqui você faria fetch para backend
  if (email === 'usuario@teste.com' && password === '123456') {
    alert('Login efetuado com sucesso!');
    closeModal();
  } else {
    loginError.textContent = 'Email ou senha inválidos.';
  }
});

// Register submit (exemplo simulado)
registerForm.addEventListener('submit', e => {
  e.preventDefault();
  clearErrors();

  const name = registerForm['register-name'].value.trim();
  const email = registerForm['register-email'].value.trim();
  const password = registerForm['register-password'].value.trim();

  if (!name || !email || !password) {
    registerError.textContent = 'Preencha todos os campos.';
    return;
  }

  if (password.length < 6) {
    registerError.textContent = 'A senha deve ter pelo menos 6 caracteres.';
    return;
  }

  // Simulação de registro
  alert(`Utilizador ${name} registado com sucesso!`);
  closeModal();
});

// Modo escuro persistente
function setDarkMode(isDark) {
  if (isDark) {
    document.body.classList.add('dark-mode');
    btnToggleDarkMode.textContent = '☀️ Modo Claro';
  } else {
    document.body.classList.remove('dark-mode');
    btnToggleDarkMode.textContent = '🌙 Modo Escuro';
  }
  localStorage.setItem('darkMode', isDark);
}

btnToggleDarkMode.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark-mode');
  setDarkMode(isDark);
});

// Ao carregar a página, verifica modo escuro salvo
document.addEventListener('DOMContentLoaded', () => {
  const darkModeStored = localStorage.getItem('darkMode') === 'true';
  setDarkMode(darkModeStored);
});

// Função para buscar receitas da Spoonacular com os ingredientes
async function buscarReceitas() {
  resultadosDiv.innerHTML = '<p>Buscando receitas...</p>';
  const ingredientes = document.getElementById('ingredientes').value.trim();

  if (!ingredientes) {
    resultadosDiv.innerHTML = '<p style="color:#e74c3c;">Por favor, digite pelo menos um ingrediente.</p>';
    return;
  }

  try {
    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredientes)}&number=6&apiKey=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      resultadosDiv.innerHTML = '<p>Nenhuma receita encontrada para esses ingredientes.</p>';
      return;
    }

    // Monta cards das receitas
    resultadosDiv.innerHTML = '';
    data.forEach(receita => {
      const receitaDiv = document.createElement('div');
      receitaDiv.classList.add('recipe');

      // Aqui substituímos o link por botão que chama verDetalhesReceita
      receitaDiv.innerHTML = `
        <h3>${receita.title}</h3>
        <img src="${receita.image}" alt="Imagem da receita ${receita.title}" loading="lazy" />
        <p>Ingredientes usados: ${receita.usedIngredientCount}</p>
        <p>Ingredientes faltando: ${receita.missedIngredientCount}</p>
        <button onclick="verDetalhesReceita(${receita.id})">Ver Receita</button>
      `;

      resultadosDiv.appendChild(receitaDiv);
    });

  } catch (error) {
    resultadosDiv.innerHTML = `<p style="color:#e74c3c;">Erro ao buscar receitas: ${error.message}</p>`;
  }
}

// Função para buscar detalhes da receita pela API e mostrar na página
async function verDetalhesReceita(id) {
  resultadosDiv.innerHTML = '<p>Carregando detalhes da receita...</p>';

  try {
    const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro ao buscar detalhes: ${response.status}`);
    }

    const detalhes = await response.json();

    resultadosDiv.innerHTML = `
      <h2>${detalhes.title}</h2>
      <img src="${detalhes.image}" alt="${detalhes.title}" loading="lazy" />
      <p><strong>Resumo:</strong> ${detalhes.summary}</p>
      <p><strong>Instruções:</strong> ${detalhes.instructions || 'Nenhuma instrução disponível.'}</p>
      <button onclick="buscarReceitas()">🔙 Voltar</button>
    `;

  } catch (error) {
    resultadosDiv.innerHTML = `<p style="color:#e74c3c;">Erro ao carregar detalhes da receita: ${error.message}</p>`;
  }
}

// Evento no botão buscar
buscarBtn.addEventListener('click', buscarReceitas);

// Também permite buscar ao apertar Enter no input ingredientes
document.getElementById('ingredientes').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    buscarReceitas();
  }
});
