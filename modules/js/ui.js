import { main } from '../main.js';

export function createPokemonCard(pokemon) {
    // Cria o elemento do card
    const card = document.createElement('div');
    card.classList.add('card');

    // Define o destino do link para a página de detalhes
    card.addEventListener("click", () => {
        window.location.href = `pages/pokemon.html?id=${pokemon.id}`;
    });

    // Cria o container do botão de favorito
    const divButton = document.createElement('div');
    divButton.classList.add('button-favorite');

    const button = document.createElement("button");
    const imageButton = document.createElement("img");
    let particleTimeout = 0;

    button.classList.add("card-favoriteButton");

    // Animação de partículas ao favoritar
    button.addEventListener('click', (e) => {
        const isActive = button.classList.contains('active');
        button.classList.toggle('active');

        if (!isActive) {
            particleTimeout = setTimeout(() => {
                const numStars = 15;
                for (let i = 0; i < numStars; i++) {
                    const star = document.createElement('span');
                    star.classList.add('star');

                    const distance = 50 + Math.random() * 50;
                    const xDir = (Math.random() - 0.5) * distance * 2;
                    const yDir = -distance;

                    star.style.setProperty('--x', `${xDir}px`);
                    star.style.setProperty('--y', `${yDir}px`);

                    button.appendChild(star);

                    setTimeout(() => {
                        star.remove();
                    }, 3000);
                }
            }, 3300);
        } else {
            clearTimeout(particleTimeout);
            const stars = button.querySelectorAll('.star');
            stars.forEach(star => star.remove());
        }
    });

    // Impede o redirecionamento ao clicar no botão
    button.addEventListener('click', function (event) {
        event.preventDefault();
    });

    // Gerencia favoritos no localStorage
    button.addEventListener("click", (event) => {
        event.stopPropagation(); // Impede clique no botão de abrir o card

        const pageFavorite = localStorage.getItem("pageFavorite");
        if (pageFavorite === 'true') {
            localStorage.setItem("clickFavorite", 'true');
        }

        const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
        const index = favoritos.findIndex(p => p.id === pokemon.id);

        if (index >= 0) {
            // Se já estiver, remove (desfavorita)
            favoritos.splice(index, 1);
            button.classList.remove('active');
            button.classList.add('removeCapture');
        } else {
            // Se não estiver, adiciona
            favoritos.push(pokemon);
            button.classList.remove('removeCapture');
            button.classList.add('active');
        }

        localStorage.setItem("favoritos", JSON.stringify(favoritos));

        function verificarFavoritePage() {
            if (pageFavorite === 'true') {
                localStorage.removeItem("clickFavorite");
                const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
                main(favoritos);
            }
        }

        verificarFavoritePage();
    });

    // Função para verificar se o Pokémon já está favoritado
    function verificarCaptura() {
        const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

        // Verifica se o Pokémon já está favoritado
        const index = favoritos.findIndex(p => p.id === pokemon.id);

        if (index >= 0) {
            button.classList.remove('removeCapture');
            button.classList.add('Capture');
        } else {
            button.classList.remove('Capture');
            button.classList.add('removeCapture');
        }
    }

    verificarCaptura();

    // Estilização base
    card.style.textDecoration = 'none';
    card.style.color = 'inherit';

    // Header
    const header = document.createElement('div');
    header.classList.add('card-header');

    const id = document.createElement('span');
    id.classList.add('card-id');
    id.textContent = `#${pokemon.id.toString().padStart(4, '0')}`;

    const name = document.createElement('h2');
    name.classList.add('card-name');
    name.textContent = pokemon.name;

    // Tipos
    const types = document.createElement('div');
    types.classList.add('card-types');
    pokemon.types.forEach(t => {
        const type = document.createElement('span');
        type.classList.add("type", t.type.name);
        type.textContent = t.type.name;
        types.appendChild(type);
    });

    // Imagem
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('card-image');

    const image = document.createElement('img');
    image.src = pokemon.sprites.other["official-artwork"].front_default;
    image.alt = pokemon.name;
    imageContainer.appendChild(image);

    // Montagem final
    header.appendChild(divButton);
    divButton.appendChild(button);
    button.appendChild(imageButton);
    header.appendChild(name);
    header.appendChild(id);

    card.appendChild(header);
    card.appendChild(imageContainer);
    card.appendChild(types);

    // Adiciona observer para animação ao entrar na tela
    if (typeof IntersectionObserver !== 'undefined') {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('card-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        observer.observe(card);
    } else {
        // Fallback para navegadores sem suporte
        card.classList.add('card-visible');
    }

    return card;
}

// Corrige o nome da função (era "createDeatailCard")
export function createDetailCard(pokemon) {
    const container = document.querySelector('.pokemon-id');
    container.textContent = `#${pokemon.id.toString().padStart(4, '0')}`;
}
