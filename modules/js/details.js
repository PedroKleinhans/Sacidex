// coleta elementos do HTML
const botao = document.getElementById("botao");
const busca = document.getElementById("busca");
const favoriteButton = document.getElementById("favorite-btn");

/**
 * Fraquezas por tipo
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
 * CARREGAR DETALHES DO POKEMON
 */
async function loadDetail() {

    const params = new URLSearchParams(window.location.search);
    const pokemonId = params.get('id');

    if (!pokemonId) {
        console.error("ID do Pokémon não encontrado.");
        return;
    }

    // BUSCA DIRETAMENTE NA API
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;

    const response = await fetch(url);
    const pokemon = await response.json();

    fillPageWithPokemonData(pokemon);

    // Carrega dados adicionais para evoluções e espécie
    await loadEvolutionChain(pokemon.species.url);
    await loadSpeciesData(pokemon.species.url);

    setupTabs();
}

(function () {
    const toggle = document.getElementById('menu-toggle');
    const header = document.querySelector('.header');
    if (toggle && header) {
        toggle.addEventListener('click', () => header.classList.toggle('menu-open'));
        document.addEventListener('click', (e) => {
            if (!header.contains(e.target) && header.classList.contains('menu-open')) {
                header.classList.remove('menu-open');
            }
        });
    }
})();

/**
 * Preenche os dados da página de detalhes
 */
function fillPageWithPokemonData(pokemon) {

    const primaryType = pokemon.types[0].type.name;
    applyBackgroundColor(primaryType);

    // ID
    document.querySelector('.pokemon-id').textContent =
        `#${pokemon.id.toString().padStart(4, '0')}`;

    // IMAGEM
    const imgElement = document.querySelector('.pokeimg img');
    const id3 = String(pokemon.id).padStart(3, '0');
    imgElement.src = `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${id3}.png`;
    imgElement.alt = pokemon.name;
    imgElement.onerror = () => {
        imgElement.onerror = null;
        imgElement.src = `https://img.pokemondb.net/artwork/large/${pokemon.name}.jpg`;
    };

    //SHINE IMAGEM
    const buttonShine = document.querySelector('.sparkle');

    buttonShine.addEventListener('click', () => {

        
        imgElement.style.filter = "brightness(0.95)";

        setTimeout(() => {
            const isShiny = imgElement.dataset.mode === "shine";

            if (isShiny) {
                imgElement.dataset.mode = "default";
                const id3 = String(pokemon.id).padStart(3, '0');
                imgElement.src = `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${id3}.png`;
                imgElement.alt = pokemon.name;
            } else {
                imgElement.dataset.mode = "shine";
                imgElement.src = `https://img.pokemondb.net/sprites/home/shiny/${pokemon.name}.png`;
                imgElement.alt = `${pokemon.name} Shine`;
            }

            imgElement.style.filter = "brightness(1)";

        }, 50); // troca rápida, transição faz o resto
    });

    // TIPOS
    const typesContainer = document.querySelector('#TypesIMG');
    typesContainer.innerHTML = "";
    pokemon.types.forEach(t => {
        const span = document.createElement("span");
        span.textContent = t.type.name;
        span.className = `type ${t.type.name}`;
        typesContainer.appendChild(span);
    });


    // Weaknesses
    const weaknessContainer = document.querySelector('#WeaknessesIMG');
    weaknessContainer.innerHTML = "";
    const weaknesses = getWeaknesses(pokemon.types);
    weaknesses.forEach(w => {
        const span = document.createElement("span");
        span.textContent = w;
        span.className = `type ${w}`;
        weaknessContainer.appendChild(span);
    });


    document.querySelector('.pokemon-weight').textContent = `${pokemon.weight / 10}kg`;
    document.querySelector('.pokemon-height').textContent = `${pokemon.height / 10}m`;

    fillStatusTab(pokemon.stats);
    fillMovesTab(pokemon.moves);

}

/**
 * Carrega dados da espécie (descrição, gender_rate, catch_rate)
 */
async function loadSpeciesData(speciesUrl) {
    try {
        const response = await fetch(speciesUrl);
        const speciesData = await response.json();

        // Obter descrição em inglês (flavor_text)
        const flavorText = speciesData.flavor_text_entries.find(
            entry => entry.language.name === 'en'
        );

        const description = flavorText
            ? flavorText.flavor_text.replace(/[\n\f]/g, ' ').trim()
            : 'Descrição não disponível';

        // Preencher descrição
        document.querySelector('.sobrepokemon').innerHTML = `<p>${description}</p>`;

        // Gender Rate
        const genderRate = speciesData.gender_rate;
        fillGenderRate(genderRate);

        // Catch Rate
        const catchRate = speciesData.capture_rate;
        fillCatchRate(catchRate);

    } catch (error) {
        console.error("Erro ao carregar dados da espécie:", error);
        document.querySelector('.sobrepokemon').innerHTML = `<p>Erro ao carregar descrição</p>`;
    }
}


/**
 * Preenche a taxa de gênero
 */
function fillGenderRate(genderRate) {
    // Gender rate varia de -1 (sem gênero) a 8 (todas fêmeas)
    // -1 = sem gênero, 0 = 100% macho, 8 = 100% fêmea

    let malePercentage = 0;
    let femalePercentage = 0;
    let displayText = 'Sem Gênero';

    if (genderRate === -1) {
        displayText = 'Sem Gênero';
    } else {
        malePercentage = ((8 - genderRate) / 8) * 100;
        femalePercentage = (genderRate / 8) * 100;
        displayText = `${malePercentage.toFixed(1)}% / ${femalePercentage.toFixed(1)}%`;
    }

    // Atualizar barra de progresso
    const progressFill = document.querySelector('.progress-fill-male');
    progressFill.style.width = `${malePercentage}%`;

    // Atualizar texto
    document.querySelector('.progress-gender-custom .progress-text').textContent = displayText;
}


/**
 * Preenche a taxa de captura
 */
function fillCatchRate(catchRate) {
    // Catch rate é um valor de 0 a 255
    // Calcular percentual
    const catchPercentage = (catchRate / 255) * 100;

    // Atualizar barra de progresso
    const progressFill = document.querySelector('.progress-fill-catch');
    progressFill.style.width = `${catchPercentage}%`;

    // Atualizar texto
    document.querySelector('.catchrate-text').textContent = `${catchRate}/255`;
}


/**
 *Aplica gradiente do tipo no background
 */
function applyBackgroundColor(type) {
    // preservar se o usuário já está no tema escuro
    const isDark = document.body.classList.contains('dark');
    // limpa somente classes anteriores de tipo, preservando 'dark' se presente
    document.body.className = isDark ? 'dark' : '';
    document.body.classList.add(`type-${type}`);
}

/* ==========================
   Tema (dark/light) para a página de detalhes
   ========================== */
let toggleThemeBtn;
let toggleThemeImg;
let headerEl;
let iconImg;
let logoImg;

function aplicarTemaDetalhes(tema) {
    if (!headerEl) headerEl = document.querySelector('header');
    if (!iconImg) iconImg = document.querySelector('.icon');
    if (!logoImg) logoImg = document.querySelector('.sacidex');

    if (tema === 'dark') {
        document.body.classList.add('dark');
        headerEl && headerEl.classList.add('dark-header');
        // trocar logos para versão branca (caminho relativo nesta página)
        if (toggleThemeImg) toggleThemeImg.src = '../../assets/img/sunwhite.png';
        if (iconImg) iconImg.src = '../../assets/img/pokebola-logo-branca.png';
        if (logoImg) logoImg.src = '../../assets/img/logo-sacidex-branca.png';
    } else {
        document.body.classList.remove('dark');
        headerEl && headerEl.classList.remove('dark-header');
        if (toggleThemeImg) toggleThemeImg.src = '../../assets/img/moon-icon.png';
        if (iconImg) iconImg.src = '../../assets/img/pokebola-logo.png';
        if (logoImg) logoImg.src = '../../assets/img/logo-sacidex.png';
    }
    localStorage.setItem('theme', tema);
}

function verificarTemaDetalhes() {
    const tema = localStorage.getItem('theme') || 'light';
    aplicarTemaDetalhes(tema);
}

document.addEventListener('DOMContentLoaded', () => {
    // selecionar elementos só após DOM pronto
    toggleThemeBtn = document.querySelector('.toggle-theme button');
    toggleThemeImg = document.getElementById('toggleTheme');
    headerEl = document.querySelector('header');
    iconImg = document.querySelector('.icon');
    logoImg = document.querySelector('.sacidex');

    // anexar listeners de clique
    if (toggleThemeBtn) {
        toggleThemeBtn.addEventListener('click', () => {
            const atual = localStorage.getItem('theme') || 'light';
            aplicarTemaDetalhes(atual === 'dark' ? 'light' : 'dark');
        });
    } else if (toggleThemeImg) {
        toggleThemeImg.addEventListener('click', () => {
            const atual = localStorage.getItem('theme') || 'light';
            aplicarTemaDetalhes(atual === 'dark' ? 'light' : 'dark');
        });
    }

    verificarTemaDetalhes();
});


/**
 * Calcula fraquezas
 */
function getWeaknesses(types) {
    const set = new Set();
    types.forEach(t => {
        const w = typeWeaknesses[t.type.name] || [];
        w.forEach(item => set.add(item));
    });
    return Array.from(set).slice(0, 3);
}


/**
 * Tabs (status / sobre / movimentos)
 */
function setupTabs() {
    const buttons = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const tab = btn.dataset.tab;
            document.getElementById(`${tab}-tab`).classList.add('active');
        });
    });
}


/**
 * Navegação entre pokemons
 */
window.navigatePokemon = function (direction) {
    const params = new URLSearchParams(window.location.search);
    const current = Number(params.get('id'));

    let next = direction === "prev" ? current - 1 : current + 1;

    if (next < 1) next = 151;
    if (next > 151) next = 1;

    window.location.href = `pokemon.html?id=${next}`;
};


/**
 * Preenche aba de Status
 */
function fillStatusTab(stats) {
    const statusTab = document.getElementById('status-tab');

    const statsHTML = stats.map(stat => {
        const statName = stat.stat.name
            .replace('special-attack', 'Sp. Attack')
            .replace('special-defense', 'Sp. Defense')
            .replace('hp', 'HP')
            .replace('attack', 'Attack')
            .replace('defense', 'Defense')
            .replace('speed', 'Speed');

        const percentage = Math.min((stat.base_stat / 255) * 100, 100);

        return `
            <div class="stat-row">
                <div class="stat-name">${statName}</div>
                <div class="stat-value">${stat.base_stat}</div>
                <div class="stat-bar">
                    <div class="stat-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');

    statusTab.innerHTML = `
        <div class="stats-container">
            ${statsHTML}
        </div>
    `;
}


/**
 * Preenche aba de Moves
 */
function fillMovesTab(moves) {
    const movesTab = document.getElementById('moves-tab');

    // Ordena moves por nível aprendido
    const sortedMoves = moves
        .filter(m => m.version_group_details[0])
        .sort((a, b) => {
            const levelA = a.version_group_details[0].level_learned_at;
            const levelB = b.version_group_details[0].level_learned_at;
            return levelA - levelB;
        });

    const movesHTML = sortedMoves.slice(0, 30).map(move => {
        const learnMethod = move.version_group_details[0].move_learn_method.name;
        const level = move.version_group_details[0].level_learned_at;

        let learnInfo = '';
        if (learnMethod === 'level-up' && level > 0) {
            learnInfo = `Nível ${level}`;
        } else if (learnMethod === 'machine') {
            learnInfo = 'TM/HM';
        } else if (learnMethod === 'egg') {
            learnInfo = 'Egg Move';
        } else if (learnMethod === 'tutor') {
            learnInfo = 'Tutor';
        } else {
            learnInfo = learnMethod;
        }

        return `
            <div class="move-item">
                <div class="move-name">${move.move.name.replace(/-/g, ' ')}</div>
                <div class="move-learn">${learnInfo}</div>
            </div>
        `;
    }).join('');

    movesTab.innerHTML = `
        <div class="moves-container">
            ${movesHTML}
        </div>
    `;
}


/**
 * Carrega cadeia evolutiva
 */
async function loadEvolutionChain(speciesUrl) {
    try {
        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();

        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();

        await fillEvolutionsTab(evolutionData.chain);
    } catch (error) {
        console.error("Erro ao carregar evoluções:", error);
        document.getElementById('evolucoes-tab').innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <p style="color: #999;">Não foi possível carregar as evoluções.</p>
            </div>
        `;
    }
}


/**
 * Preenche aba de Evoluções
 */
async function fillEvolutionsTab(chain) {
    const evolutions = [];

    // Função recursiva para extrair toda a cadeia
    function extractEvolutions(node) {
        const pokemonName = node.species.name;
        const pokemonId = node.species.url.split('/').filter(Boolean).pop();

        evolutions.push({ name: pokemonName, id: pokemonId });

        if (node.evolves_to.length > 0) {
            node.evolves_to.forEach(evo => extractEvolutions(evo));
        }
    }

    extractEvolutions(chain);

    // Busca imagens para cada evolução
    const evolutionsWithImages = await Promise.all(
        evolutions.map(async (evo) => {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${evo.id}`);
                const data = await response.json();
                const id3 = String(evo.id).padStart(3, '0');
                return {
                    ...evo,
                    image: `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${id3}.png`,
                    types: data.types
                };
            } catch (error) {
                console.error(`Erro ao carregar ${evo.name}:`, error);
                return evo;
            }
        })
    );

    const evolutionsHTML = evolutionsWithImages.map((evo, index) => {
        const typesHTML = evo.types ? evo.types.map(t =>
            `<span class="type ${t.type.name}">${t.type.name}</span>`
        ).join('') : '';

        return `
            <div class="evolution-item">
                ${index > 0 ? '<div class="evolution-arrow">→</div>' : ''}
                <div class="evolution-card">
                    <img src="${evo.image}" alt="${evo.name}" class="evolution-img">
                    <div class="evolution-name">${evo.name}</div>
                    <div class="evolution-id">#${evo.id.padStart(4, '0')}</div>
                    <div class="evolution-types">${typesHTML}</div>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('evolucoes-tab').innerHTML = `
        <div class="evolutions-container">
            ${evolutionsHTML}
        </div>
    `;
}


// roda ao abrir
loadDetail();
