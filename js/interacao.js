const formulario = document.querySelector("#formulario-titulo");
const campo = document.querySelector("#campo-titulo");
const retorno = document.querySelector("#retorno-titulo");




const filmes = [
    { titulo: "Interestelar", resumo: "Melhor filme de ficção científica", detalhe: "filme.html"},
    {titulo: "Cidade de Deus", resumo: "Tráfico de Drogas ", detalhe: null},
    {titulo: "Se beber não case", resumo: "Comédia foda! ", detalhe: null},
    {titulo: "O Poderoso Chefão", resumo: "Maior filme de todos os tempos", detalhe: null},
    {titulo: "Uma Linda Mulher", resumo: "Comédia Romântica", detalhe: null},
    {titulo: "O Exterminador do Futuro 2", resumo: "Maior filme de ação de todos os tempos", detalhe: null}]; 

function criarCapaDoCard(filme) {
    if (filme.poster) {
        const imagem = document.createElement("img");

        imagem.className = "poster-filme";
        imagem.src = filme.poster;
        imagem.alt = "Pôster de " + filme.titulo;
        imagem.loading = "lazy";
        imagem.width = 342;
        imagem.height = 513;

        return imagem;
    }

    const posterAusente = document.createElement("div");

    posterAusente.className = "poster-ausente";
    posterAusente.textContent = "Pôster não disponível";

    return posterAusente;
}

function criarCard(filme) {
    const card = document.createElement("article");
    card.className = "card-filme";
    const capa = criarCapaDoCard(filme);
    card.appendChild(capa);

    const titulo = document.createElement("h3");
    titulo.textContent = filme.titulo;
    card.appendChild(titulo);
    if (filme.ano) {
        const ano = document.createElement("p");
        ano.textContent = filme.ano;
        card.appendChild(ano)
    }
    const resumo = document.createElement("p");
    resumo.textContent = filme.resumo;
    card.appendChild(resumo);


    let detalhe;
    if (filme.detalhe) {
        detalhe = document.createElement("a");
        detalhe.href = filme.detalhe;
        detalhe.textContent = `Ver detalhes de ${filme.titulo}`;
    } else {
        detalhe = document.createElement("p");
        detalhe.textContent = "Detalhes virão depois.";
    }

    card.appendChild(detalhe);

    return card;
}


const grade = document.querySelector(".grade-filmes");

function mostrarFilmes(lista) {
    grade.replaceChildren();

    for (const filme of lista) {
        const card = criarCard(filme);
        grade.appendChild(card);
    }
}





function transformarFilmeTMDB(resultado) {
    const idRecebido = resultado.id;
    const tituloRecebido = resultado.title;
    const resumoRecebido = resultado.overview;
    const dataRecebida = resultado.release_date;
    const caminhoPosterRecebido = resultado.poster_path;

    const titulo = tituloRecebido || "Título não informado";
    const resumo = resumoRecebido || "Sinopse não disponível em português.";

    let ano = "Ano não informado";

    if (dataRecebida) {
        ano = dataRecebida.slice(0, 4);
    }

    let poster = null;

    if (caminhoPosterRecebido) {
        const baseImagem = "https://image.tmdb.org/t/p/w342";
        poster = baseImagem + caminhoPosterRecebido;
    }

    let detalhe = null;

    if (idRecebido) {
        const idParaUrl = encodeURIComponent(idRecebido);
        detalhe = "filme.html?id=" + idParaUrl;
    }

    const filmeTransformado = {
        id: idRecebido,
        titulo: titulo,
        resumo: resumo,
        ano: ano,
        poster: poster,
        detalhe: detalhe
    };

    return filmeTransformado;
}


formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const textoDigitado = campo.value;
    const termo = textoDigitado.trim();

    if (termo === "") {
        mostrarFilmes(filmes);
        retorno.textContent = "Mostrando os filmes de demonstração.";
        return;
    }

    if (termo.length < 2) {
        retorno.textContent = "Digite pelo menos dois caracteres.";
        return;
    }

    const termoParaUrl = encodeURIComponent(termo);
    const enderecoBase = "http://127.0.0.1:3000/api/filmes?busca=";
    const enderecoCompleto = enderecoBase + termoParaUrl;

    retorno.textContent = "Buscando filmes...";

    try {
        const resposta = await fetch(enderecoCompleto);
        const dados = await resposta.json();

        if (!resposta.ok) {
            const mensagemRecebida = dados.erro;
            const mensagemDeErro = mensagemRecebida || "A busca não foi concluída.";
            throw new Error(mensagemDeErro);
        }

        const resultados = dados.resultados;
        const filmesTransformados = [];

        for (const resultado of resultados) {
            const filmeTransformado = transformarFilmeTMDB(resultado);
            filmesTransformados.push(filmeTransformado);
        }

        mostrarFilmes(filmesTransformados);

        if (filmesTransformados.length === 0) {
            retorno.textContent = "Nenhum filme encontrado no TMDB.";
        } else if (filmesTransformados.length === 1) {
            retorno.textContent = "1 filme encontrado no TMDB.";
        } else {
            const quantidade = filmesTransformados.length;
            retorno.textContent = quantidade + " filmes encontrados no TMDB.";
        }
    } catch (erro) {
        retorno.textContent = "Não foi possível buscar filmes agora. Confira o servidor local.";
        console.error(erro);
    }
});








mostrarFilmes(filmes);