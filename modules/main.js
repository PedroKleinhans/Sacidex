import { createPokemonCard } from "./js/ui.js";
import { pokemons, loadNextBatch, hasMorePokemon, resetPokemonPagination } from "./js/api.js";

const campoBusca = document.getElementById("busca");
const favoriteButton = document.getElementById("favorite-btn");
const container = document.getElementById("cards");
// botão de troca de tema (seleciona o botão que envolve a imagem, se existir)
const toggleThemeBtn = document.querySelector('.toggle-theme button');
const toggleThemeImg = document.getElementById("toggleTheme");

// busca dinâmica
campoBusca.addEventListener("input", () => {
  const texto = campoBusca.value.toLowerCase();
  const filtrados = pokemons.filter(p => p.name.toLowerCase().includes(texto));
  main(filtrados);
});

// botão de favoritos
favoriteButton.addEventListener("click", () => {
  localStorage.setItem("pageFavorite", "true");
  const getFavoritos = localStorage.getItem("favoritos");
  const parseFavoritos = JSON.parse(getFavoritos);
  main(parseFavoritos);

});


// tema: funções limpas e confiáveis
const headertheme = document.querySelector('header');
const iconimglogo = document.querySelector('.icon');
const logo = document.querySelector('.sacidex');

function aplicarTema(tema) {
  const cardtheme = document.querySelectorAll('.card');
  const idEls = document.querySelectorAll('.card-id');
  const cardPokeboll = document.querySelectorAll('.card-favoriteButton.removeCapture');

  if (tema === 'dark') {
    document.body.classList.add('dark');
    headertheme && headertheme.classList.add('dark-header');
    cardtheme.forEach(card => card.classList.add('dark-card'));
    idEls.forEach(el => el.classList.add('dark'));
    cardPokeboll.forEach(p => p.classList.add('dark'));
    if (toggleThemeImg) toggleThemeImg.src = '/assets/img/sunwhite.png';
    if (iconimglogo) iconimglogo.src = '/assets/img/pokebola-logo-branca.png';
    if (logo) logo.src = '/assets/img/logo-sacidex-branca.png';
  } else {
    document.body.classList.remove('dark');
    headertheme && headertheme.classList.remove('dark-header');
    cardtheme.forEach(card => card.classList.remove('dark-card'));
    idEls.forEach(el => el.classList.remove('dark'));
    cardPokeboll.forEach(p => p.classList.remove('dark'));
    if (toggleThemeImg) toggleThemeImg.src = '/assets/img/moon-icon.png';
    if (iconimglogo) iconimglogo.src = '/assets/img/pokebola-logo.png';
    if (logo) logo.src = '/assets/img/logo-sacidex.png';
  }

  localStorage.setItem('theme', tema);
}

function verificarTemaSalvo() {
  const tema = localStorage.getItem('theme') || 'light';
  aplicarTema(tema);
}

// adiciona listener ao botão que envolve o ícone; fallback para imagem
if (toggleThemeBtn) {
  toggleThemeBtn.addEventListener('click', () => {
    const atual = localStorage.getItem('theme') || 'light';
    aplicarTema(atual === 'dark' ? 'light' : 'dark');
  });
} else if (toggleThemeImg) {
  toggleThemeImg.addEventListener('click', () => {
    const atual = localStorage.getItem('theme') || 'light';
    aplicarTema(atual === 'dark' ? 'light' : 'dark');
  });
}

// Verifica e aplica tema ao carregar
document.addEventListener('DOMContentLoaded', verificarTemaSalvo);

//===================//
//==== FUNÇÕES ======//
//===================//

export async function main(lista) {
  container.innerHTML = "";

  for (const item of lista) {
    const card = createPokemonCard(item); // cria o elemento
    container.appendChild(card);          // adiciona aqui
  }

}

// busca por localStorage 
function carregarBuscaSalva() {
  const storageBusca = localStorage.getItem("busca");

  if (storageBusca) {
    const campoBusca = storageBusca.toLowerCase();
    const filtrados = pokemons.filter(p => p.name.toLowerCase().includes(campoBusca));
    localStorage.removeItem("busca");
    main(filtrados);
  } else {
    main(pokemons);
  };

};

// Verifica se veio da página de outra página para mostrar favoritos
function VerifcaroutraPage() {
  const storagePage = localStorage.getItem("page");

  if (storagePage === "outraPage") {
    const getFavoritos = localStorage.getItem("favoritos");
    const parseFavoritos = JSON.parse(getFavoritos);
    localStorage.setItem("pageFavorite", "true");
    localStorage.removeItem("page");
    main(parseFavoritos);
  };

};

function resetarFavoritePage() {
  localStorage.removeItem("pageFavorite");
  localStorage.removeItem("clickFavorite");
}

//===================//
//==== EVENTOS ======//
//===================//

campoBusca.addEventListener("input", () => {
  const texto = campoBusca.value.toLowerCase();
  const filtrados = pokemons.filter(p => p.name.toLowerCase().includes(texto));
  main(filtrados);
});

favoriteButton.addEventListener("click", () => {
  localStorage.setItem("pageFavorite", "true");
  carregarFavoritos();
});

//===================//
//==== INFINITE SCROLL ====//
//===================//

const loader = document.getElementById('infinite-loader');
let loading = false;
export let activeTiposFilter = []; // Filtros de tipos ativos

export function setActiveTiposFilter(tipos) {
  activeTiposFilter = tipos;
}

export function getActiveTiposFilter() {
  return activeTiposFilter;
}

async function renderNextBatch() {
  if (loading || !hasMorePokemon()) return;
  loading = true;
  loader.classList.remove('hidden');

  let pokemonsToRender = [];

  // Continua carregando lotes até ter pokémons suficientes ou acabar
  while (pokemonsToRender.length < 20 && hasMorePokemon()) {
    const pokemonsBatch = await loadNextBatch();

    // Aplica filtro se houver tipos selecionados
    const filtered = activeTiposFilter.length === 0
      ? pokemonsBatch
      : pokemonsBatch.filter(pokemon => {
        const tiposDoPokemon = pokemon.types.map(t => t.type.name.toLowerCase());
        return activeTiposFilter.every(tipo => tiposDoPokemon.includes(tipo));
      });

    pokemonsToRender.push(...filtered);

    // Se não há filtro ativo, não precisa continuar carregando
    if (activeTiposFilter.length === 0) break;
  }

  pokemonsToRender.forEach(pokemon => {
    const card = createPokemonCard(pokemon);
    container.appendChild(card);
  });

  loader.classList.add('hidden');
  loading = false;

  // Se a página ainda não tem scroll e há mais pokémons, carrega mais
  setTimeout(() => {
    if (document.body.offsetHeight <= window.innerHeight && hasMorePokemon()) {
      renderNextBatch();
    }
  }, 100);
}

function onScroll() {
  const scrollY = window.scrollY || window.pageYOffset;
  const viewport = window.innerHeight;
  const fullHeight = document.body.offsetHeight;
  if (fullHeight - (scrollY + viewport) < 300) {
    renderNextBatch();
  }
}

function startInfiniteScroll() {
  resetarFavoritePage();
  verificarTemaSalvo();
  resetPokemonPagination();
  container.innerHTML = "";
  renderNextBatch();
  window.addEventListener('scroll', onScroll);
}

export function reloadWithFilters() {
  resetPokemonPagination();
  container.innerHTML = "";
  renderNextBatch();
  // Garante que o scroll listener está ativo
  window.removeEventListener('scroll', onScroll);
  window.addEventListener('scroll', onScroll);
}

document.addEventListener('DOMContentLoaded', startInfiniteScroll);