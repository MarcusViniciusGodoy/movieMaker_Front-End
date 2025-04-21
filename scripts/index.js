import getDados from "./getDados.js";

// Mapeia os elementos DOM que você deseja atualizar
const elementos = {
    top5: document.querySelector('[data-name="top5"]'),
    lancamentos: document.querySelector('[data-name="lancamentos"]'),
    series: document.querySelector('[data-name="series"]'),
    busca: document.querySelector('[data-name="busca"]')
};

// Função para criar a lista de filmes
function criarListaFilmes(elemento, dados) {
    // Verifique se há um elemento <ul> dentro da seção
    const ulExistente = elemento.querySelector('ul');

    // Se um elemento <ul> já existe dentro da seção, remova-o
    if (ulExistente) {
        elemento.removeChild(ulExistente);
    }

    const ul = document.createElement('ul');
    ul.className = 'lista';
    const listaHTML = dados.map((filme) => `
        <li>
            <a href="/detalhes.html?id=${filme.id}">
                <img src="${filme.poster}" alt="${filme.titulo}">
            </a>
        </li>
    `).join('');

    ul.innerHTML = listaHTML;
    elemento.appendChild(ul);
}

// Função genérica para tratamento de erros
function lidarComErro(mensagemErro) {
    console.error(mensagemErro);
}

const categoriaSelect = document.querySelector('[data-categorias]');
const sectionsParaOcultar = document.querySelectorAll('.section'); // Adicione a classe CSS 'hide-when-filtered' às seções e títulos que deseja ocultar.

categoriaSelect.addEventListener('change', function () {
    const categoria = document.querySelector('[data-name="categoria"]');
    const categoriaSelecionada = categoriaSelect.value;

    if (categoriaSelecionada === 'todos') {

        for (const section of sectionsParaOcultar) {
            section.classList.remove('hidden')
        }
        categoria.classList.add('hidden');

    } else {

        for (const section of sectionsParaOcultar) {
            section.classList.add('hidden')
        }

        categoria.classList.remove('hidden')
        // Faça uma solicitação para o endpoint com a categoria selecionada
        getDados(`/series/categoria/${categoriaSelecionada}`)
            .then(data => {
                criarListaFilmes(categoria, data);
            })
            .catch(error => {
                lidarComErro("Ocorreu um erro ao carregar os dados da categoria.");
            });
    }
});

// Array de URLs para as solicitações
geraSeries();
function geraSeries() {
    const urls = ['/series/top5', '/series/lancamentos', '/series'];

    // Faz todas as solicitações em paralelo
    Promise.all(urls.map(url => getDados(url)))
        .then(data => {
            criarListaFilmes(elementos.top5, data[0]);
            criarListaFilmes(elementos.lancamentos, data[1]);
            criarListaFilmes(elementos.series, data[2].slice(0, 5));
        })
        .catch(error => {
            lidarComErro("Ocorreu um erro ao carregar os dados.");
        });

}

const buscaIcone = document.getElementById('busca-icone');
const buscaEntrada = document.getElementById('busca-entrada');
const buscaIconeContainer = document.querySelector('.container_icone_busca');

// Exibe a barra de busca ao clicar no ícone
buscaIcone.addEventListener('click', (event) => {
  event.stopPropagation(); 
  buscaEntrada.classList.add('active');
  buscaIconeContainer.style.display = 'none'; 
  buscaEntrada.focus();
});

// Oculta a barra de busca ao clicar fora
document.addEventListener('click', (event) => {
  if (!buscaEntrada.contains(event.target) && !buscaIconeContainer.contains(event.target)) {
    buscaEntrada.classList.remove('active');
    buscaIconeContainer.style.display = 'block'; 
  }
});

// Ativa a busca ao pressionar Enter
buscaEntrada.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const titulo = buscaEntrada.value.trim();
    if (titulo) {
      carregarSerieBuscada(titulo);
    }
  }
});

// Função para buscar série no backend Java
function carregarSerieBuscada(titulo) {
    const tituloFormatado = encodeURIComponent(titulo);
  
    getDados(`/series/busca/${tituloFormatado}`)
      .then(resultado => {
        if (!resultado || resultado.length === 0) {
          // Oculta seções antigas
          sectionsParaOcultar.forEach(section => {
            section.classList.add('hidden');
          });
  
          // Exibe a seção de busca
          elementos.busca.classList.remove('hidden');
  
          // Insere a mensagem de erro personalizada
          const container = document.getElementById("conteudo-busca");
  
          container.innerHTML = `
            <div class="mensagem-erro">
              <p><strong>Ops...</strong> Nenhum resultado encontrado para "<em>${titulo}</em>".</p>
            </div>
          `;
          return;
        }
  
        const data = resultado[0];
  
        // Oculta seções antigas
        sectionsParaOcultar.forEach(section => {
          section.classList.add('hidden');
        });
  
        // Exibe a seção de busca
        elementos.busca.classList.remove('hidden');
  
        // Insere conteúdo apenas dentro do div específico
        const container = document.getElementById("conteudo-busca");
  
        container.innerHTML = `
          <div class="serie-detalhes">
            <img src="${data.poster}" alt="${data.titulo}" />
            <div>
              <h2>${data.titulo}</h2>
              <div class="descricao-texto">
                <p><b>Média de avaliações:</b> ${data.avaliacao}</p>
                <p>${data.sinopse}</p>
                <p><b>Estrelando:</b> ${data.atores}</p>
              </div>
            </div>
          </div>
        `;
      })
      .catch(error => {
        console.error("Erro ao buscar a série:", error);
      });
}