import { main } from '../main.js';
import { pokemons } from '../js/api.js';
import { setActiveTiposFilter, reloadWithFilters } from '../main.js';

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('filter-toggle');
  const filterBox = document.getElementById('filter-box');
  if (!filterBox) return; // protege caso o elemento não exista
  const buttons = filterBox.querySelectorAll('.type-btn');

  let tiposSelecionados = [];

  // renderiza somente se já houver pokemons carregados, senão espera evento
  if (pokemons && pokemons.length > 0) {
    main(pokemons);
  }

  // quando todos os pokemons terminarem de carregar, renderiza a lista completa
  document.addEventListener('pokemonsLoaded', () => main(pokemons));

  // alterna a visibilidade da caixa de filtro
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation(); // impede fechamento imediato
      filterBox.classList.toggle('hidden');
    });
  }

  // fecha ao clicar fora
  document.addEventListener('click', (e) => {
    if (!filterBox.contains(e.target) && e.target !== toggle) {
      filterBox.classList.add('hidden');
    }
  });

  // seleção dos tipos
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // impede que clique feche o menu

      const tipo = btn.dataset.type.toLowerCase();
      btn.classList.toggle('active');

      if (tiposSelecionados.includes(tipo)) {
        tiposSelecionados = tiposSelecionados.filter(t => t !== tipo);
      } else {
        tiposSelecionados.push(tipo);
      }

      console.log('Selecionados:', tiposSelecionados);

      // Atualiza o filtro ativo globalmente
      setActiveTiposFilter(tiposSelecionados);

      // Recarrega do zero com o filtro ativo e infinite scroll
      reloadWithFilters();
    });
  });
});


