import { pokemons } from './data.js';

const botao = document.getElementById("botao");
const busca = document.getElementById("busca");
const favoriteButton = document.getElementById("favorite-btn");

// Mapa de cores removido - agora usando classes CSS com gradientes

/**
 * Tabela de fraquezas por tipo
 */
const typeWeaknesses = {
    fire: ['water', 'ground', 'rock'],
    water: ['electric', 'grass'],
    grass: ['fire', 'ice', 'poison', 'flying', 'bug'],
    electric: ['ground'],
    psychic: ['bug', 'ghost', 'dark'],
    ice: ['fire', 'fighting', 'rock', 'steel'],
    dragon: ['ice', 'dragon', 'fairy'],
    dark: ['fighting', 'bug', 'fairy'],
    fairy: ['poison', 'steel'],
    normal: ['fighting'],
    fighting: ['flying', 'psychic', 'fairy'],
    flying: ['electric', 'ice', 'rock'],
    poison: ['ground', 'psychic'],
    ground: ['water', 'grass', 'ice'],
    rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
    bug: ['fire', 'flying', 'rock'],
    ghost: ['ghost', 'dark'],
    steel: ['fire', 'fighting', 'ground']
};

/**
 * Função principal para carregar os detalhes
 */
function loadDetail() {
    const params = new URLSearchParams(window.location.search);
    const pokemonId = params.get('id');

    if (!pokemonId) {
        console.error("ID do Pokémon não encontrado na URL.");
        document.querySelector('.sobrepokemon p').textContent = "Erro: ID do Pokémon não encontrado na URL.";
        return;
    }

    const pokemon = pokemons.find(p => p.id == pokemonId);

    if (!pokemon) {
        console.error("Pokémon não encontrado no array 'data.js'.");
        document.querySelector('.sobrepokemon p').textContent = `Erro: Pokémon com ID ${pokemonId} não foi encontrado.`;
        return;
    }

    fillPageWithPokemonData(pokemon);
    setupTabs();
}




/**
 * Esta função preenche seu HTML usando os dados do Pokémon
 */
function fillPageWithPokemonData(pokemon) {
    // Aplica cor de fundo baseada no tipo primário
    const primaryType = pokemon.types[0].type.name;
    applyBackgroundColor(primaryType);

    // Pokemon ID
    document.querySelector('.pokemon-id').textContent = `#${pokemon.id.toString().padStart(3, '0')}`;

    // Pokemon image
    const imgElement = document.querySelector('.pokeimg img');
    imgElement.src = pokemon.sprites.other["official-artwork"].front_default;
    imgElement.alt = pokemon.name;

    //SHINE IMAGEM
const buttonShine = document.querySelector('.sparkle');

buttonShine.addEventListener('click', () => {

    // leve efeito para suavizar a troca (parece um "ajuste de luz")
    imgElement.style.filter = "brightness(0.95)";

    setTimeout(() => {
        const isShiny = imgElement.dataset.mode === "shine";

        if (isShiny) {
            imgElement.dataset.mode = "default";
            imgElement.src = pokemon.sprites.other["official-artwork"].front_default;
            imgElement.alt = pokemon.name;
        } else {
            imgElement.dataset.mode = "shine";
            imgElement.src = pokemon.sprites.other["official-artwork"].front_shiny;
            imgElement.alt = `${pokemon.name} Shine`;
        }

        // volta suave ao normal
        imgElement.style.filter = "brightness(1)";

    }, 50); // troca rápida, transição faz o resto
});

    // TIPOS
    const typesContainer = document.querySelector('#TypesIMG');
    typesContainer.innerHTML = "";

    pokemon.types.forEach(typeInfo => {
        const typeName = typeInfo.type.name;
        const typeSpan = document.createElement('span');
        typeSpan.textContent = typeName;
        typeSpan.className = `type ${typeName}`;
        typesContainer.appendChild(typeSpan);
    });

    //Shine button

    const sparkle = document.querySelector('.sparkle')

    let clickedShine = false;
    sparkle.addEventListener('click', () =>{ 
        
        if (clickedShine == false)
        {
            imgElement.src = pokemon.sprites.other["official-artwork"].shine_version;
            clickedShine = true;
            imgElement.classList.add('shine');
        }
        else
        {
            imgElement.src = pokemon.sprites.other["official-artwork"].front_default;
            clickedShine = false;
            imgElement.classList.add('noshine');
        }
    });
     



    // Weaknesses
    const weaknessContainer = document.querySelector('#WeaknessesIMG');
    weaknessContainer.innerHTML = "";

    const weaknesses = getWeaknesses(pokemon.types);
    weaknesses.forEach(weakness => {
        const weakSpan = document.createElement('span');
        weakSpan.textContent = weakness;
        weakSpan.className = `type ${weakness}`;
        weaknessContainer.appendChild(weakSpan);
    });

    // Weight and Height (mock data - you can add these to data.js)
    document.querySelector('.pokemon-weight').textContent = `${(pokemon.id * 10 + 50) / 10}kg`;
    document.querySelector('.pokemon-height').textContent = `${(pokemon.id * 5 + 100) / 100}m`;
}

/**
 * Aplica classe CSS de gradiente baseada no tipo do Pokemon
 */
function applyBackgroundColor(type) {
    // Remove todas as classes de tipo existentes
    document.body.className = document.body.className.replace(/type-\w+/g, '');

    // Adiciona a nova classe de tipo
    document.body.classList.add(`type-${type}`);
}

/**
 * Obtém as fraquezas baseadas nos tipos do Pokemon
 */
function getWeaknesses(types) {
    const weaknessSet = new Set();

    types.forEach(typeInfo => {
        const typeName = typeInfo.type.name;
        const weaknesses = typeWeaknesses[typeName] || [];
        weaknesses.forEach(w => weaknessSet.add(w));
    });

    return Array.from(weaknessSet).slice(0, 3); // Limita a 3 fraquezas principais
}

/**
 * Configura as abas
 */
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active de todos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Adiciona active ao clicado
            button.classList.add('active');
            const tabName = button.getAttribute('data-tab');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

/**
 * Navegação entre Pokemon
 */
window.navigatePokemon = function (direction) {
    const params = new URLSearchParams(window.location.search);
    const currentId = parseInt(params.get('id'));

    const currentIndex = pokemons.findIndex(p => p.id === currentId);
    let newIndex;

    if (direction === 'prev') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : pokemons.length - 1;
    } else {
        newIndex = currentIndex < pokemons.length - 1 ? currentIndex + 1 : 0;
    }

    const newPokemonId = pokemons[newIndex].id;
    window.location.href = `pokemon.html?id=${newPokemonId}`;
}

// Roda o script assim que a página carrega
loadDetail();

// Evento do botão de busca que salva no localStorage e volta para a index
botao.addEventListener("click", () => {
    const textoBusca = busca.value;
    localStorage.setItem("busca", textoBusca);
    window.location.href = "../index.html";
});
// Evento do botão de favoritos que salva a página atual no localStorage e volta para a index
favoriteButton.addEventListener("click", () => {
    localStorage.setItem("page", "outraPage");
    window.location.href = "../index.html";
});

// Evento para permitir busca ao pressionar Enter
busca.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    botao.click(); // simula o clique do botão
  }
});
