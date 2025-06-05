const btnBuscar = document.getElementById('btnBuscar');
const ingredientesInput = document.getElementById('ingredientes');
const resultadosDiv = document.getElementById('resultados');
const btnDarkMode = document.getElementById('btnDarkMode');

const SPOONACULAR_API_KEY = '0c0544af7c614f418e1a722e01f22510';
const OPENAI_API_KEY = 'TUA_CHAVE_OPENAI';

btnBuscar.addEventListener('click', async () => {
  const ingredientes = ingredientesInput.value.trim();
  if (!ingredientes) return alert('Por favor, introduz ingredientes.');

  resultadosDiv.innerHTML = '<p>A procurar receitas...</p>';

  try {
    const receitas = await buscarReceitas(ingredientes);
    resultadosDiv.innerHTML = '';

    if (receitas.length === 0) {
      resultadosDiv.innerHTML = '<p>Nenhuma receita encontrada para os ingredientes fornecidos.</p>';
      return;
    }

    for (const receita of receitas) {
      const descricaoTraduzida = await traduzirDescricao(receita.title);
      mostrarReceita(receita, descricaoTraduzida);
    }
  } catch (erro) {
    console.error('Erro ao obter receitas:', erro);
    resultadosDiv.innerHTML = '<p>Erro ao procurar receitas. Verifica a tua ligação ou chave de API.</p>';
  }
});

async function buscarReceitas(ingredientes) {
  const url = `https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${encodeURIComponent(ingredientes)}&number=6&addRecipeInformation=true&apiKey=${SPOONACULAR_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
}

async function traduzirDescricao(texto) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Traduza para português de Portugal de forma informal e natural."
          },
          {
            role: "user",
            content: `Traduza este nome de receita: ${texto}`
          }
        ]
      })
    });

    const data = await res.json();
    return data.choices[0].message.content.trim();
  } catch (erro) {
    console.error("Erro na tradução:", erro);
    return texto; // Se falhar, usa o título original
  }
}

// NOVO: Função para buscar detalhes completos da receita incluindo instruções
async function buscarDetalhesReceita(id) {
  const url = `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=${SPOONACULAR_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro ao buscar detalhes da receita");
  return await res.json();
}

function mostrarReceita(receita, descricaoTraduzida) {
  const card = document.createElement('div');
  card.className = 'card';

  // Estrutura básica da receita
  card.innerHTML = `
    <img src="${receita.image}" alt="${receita.title}" />
    <div class="card-content">
      <h3>${descricaoTraduzida}</h3>
      <p><strong>Pronto em:</strong> ${receita.readyInMinutes} min</p>
      <button class="btn-instrucoes" data-id="${receita.id}">Ver Instruções</button>
      <div class="instrucoes" style="display:none; margin-top:10px;"></div>
    </div>
  `;

  resultadosDiv.appendChild(card);

  // Evento para mostrar/ocultar instruções
  const btnInstrucoes = card.querySelector('.btn-instrucoes');
  const divInstrucoes = card.querySelector('.instrucoes');

  btnInstrucoes.addEventListener('click', async () => {
    if (divInstrucoes.style.display === 'block') {
      // Se estiver visível, esconde
      divInstrucoes.style.display = 'none';
      btnInstrucoes.textContent = 'Ver Instruções';
    } else {
      // Se estiver escondido, carrega e mostra
      btnInstrucoes.textContent = 'A carregar...';

      try {
        const detalhes = await buscarDetalhesReceita(receita.id);
        // Usa as instruções em texto limpo
        const instrucaoTexto = detalhes.instructions ? detalhes.instructions.replace(/<\/?[^>]+(>|$)/g, "") : "Instruções não disponíveis.";
        divInstrucoes.textContent = instrucaoTexto;
        divInstrucoes.style.display = 'block';
        btnInstrucoes.textContent = 'Esconder Instruções';
      } catch (erro) {
        divInstrucoes.textContent = 'Erro ao carregar as instruções.';
        divInstrucoes.style.display = 'block';
        btnInstrucoes.textContent = 'Ver Instruções';
      }
    }
  });
}

btnDarkMode.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

async function buscarReceitas(ingredientes) {
  // Usamos o findByIngredients para obter a contagem de ingredientes em falta
  const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredientes)}&number=6&apiKey=${SPOONACULAR_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();
  return data || [];
}

function mostrarReceita(receita, descricaoTraduzida) {
  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <img src="${receita.image}" alt="${receita.title}" />
    <div class="card-content">
      <h3>${descricaoTraduzida}</h3>
      <p><strong>Ingredientes em falta:</strong> ${receita.missedIngredientCount}</p>
      <p><strong>Pronto em:</strong> -- min (necessita fetch de detalhes)</p>
      <button class="btn-instrucoes" data-id="${receita.id}">Ver Instruções</button>
      <div class="instrucoes" style="display:none; margin-top:10px;"></div>
    </div>
  `;

  resultadosDiv.appendChild(card);

  const btnInstrucoes = card.querySelector('.btn-instrucoes');
  const divInstrucoes = card.querySelector('.instrucoes');

  btnInstrucoes.addEventListener('click', async () => {
    if (divInstrucoes.style.display === 'block') {
      divInstrucoes.style.display = 'none';
      btnInstrucoes.textContent = 'Ver Instruções';
    } else {
      btnInstrucoes.textContent = 'A carregar...';

      try {
        const detalhes = await buscarDetalhesReceita(receita.id);
        const instrucaoTexto = detalhes.instructions ? detalhes.instructions.replace(/<\/?[^>]+(>|$)/g, "") : "Instruções não disponíveis.";
        divInstrucoes.textContent = instrucaoTexto;

        // Atualizar pronto em minutos agora que temos os detalhes
        const prontoEmP = card.querySelector('.card-content p:nth-child(3)');
        if (prontoEmP) prontoEmP.textContent = `Pronto em: ${detalhes.readyInMinutes} min`;

        divInstrucoes.style.display = 'block';
        btnInstrucoes.textContent = 'Esconder Instruções';
      } catch (erro) {
        divInstrucoes.textContent = 'Erro ao carregar as instruções.';
        divInstrucoes.style.display = 'block';
        btnInstrucoes.textContent = 'Ver Instruções';
      }
    }
  });
}
