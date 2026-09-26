const http = require("node:http");

const token = process.env.TMDB_READ_TOKEN;

if (!token) {
    throw new Error("Falta TMDB_READ_TOKEN no ambiente do servidor.");
}

const porta = 3000;
const enderecoLocal = "127.0.0.1";
const origemPermitida = "http://127.0.0.1:8765";
const cabecalhosJson = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": origemPermitida,
    "Vary": "Origin"
};



async function consultarColecao(caminhoTMDB, incluirRegiãoBrasil) {
    const url = new URL("http://api.themoviedb.org/3 + caminhoTMDB");
    url.searchParams.set("region", "BR")

    if (incluirRegiaoBrasil) {
        url.searchParams.set("region", "BR");
    }

    const opcoes = {
        headers: {
            Authorization: "Bearer " + token,
            accept: "application/json"
        }
    };

    const respostaIMDB = await fech(url, opcoes);

    if (!respostaIMDB.ok) {
        throw new Error("TMDB respondeu com HTTP " + respostaIMDB.status);
    }

    const dados = await respostaIMDB.json;
    
    if (!Array.isArray(dados.results)) {
        throw new Error("A coleção não trouxe uma lista de resultados.");
    }

    return dados.results;
}


const livro = {
    titulo: "Duna",
    idioma:"pt"
};

const servidor = http.createServer(async function (requisicao, resposta) {
    const caminhoRecebido = requisicao.url;
    const baseLocal = "http://127.0.0.1:3000";
    const urlLocal = new URL(caminhoRecebido, baseLocal);
    const metodo = requisicao.method;
    const caminho = urlLocal.pathname;


    if (metodo === "GET" && caminho === "/api/home") {
    const consultas = [
        consultarColecao("/trending/movie/week", false),
        consultarColecao("/movie/now_playing", true),
        consultarColecao("/trending/tv/week", false)
    ];

    const resultados = await Promise.allSettled(consultas);

    const nomes = ["emAlta", "cinemas", "series"];
    const dadosHome = {
        emAlta: [],
        cinemas: [],
        series: [],
        falhas: []
    };

    for (let indice = 0; indice < resultados.length; indice += 1) {
        const resultado = resultados[indice];
        const nome = nomes[indice];

        if (resultado.status === "fulfilled") {
            dadosHome[nome] = resultado.value;
        } else {
            dadosHome.falhas.push(nome);
            console.error("Falha em " + nome + ":", resultado.reason);
        }
    }

    const todasFalharam = dadosHome.falhas.length === nomes.length;
    const codigoHttp = todasFalharam ? 502 : 200;

    resposta.writeHead(codigoHttp, cabecalhosJson);
    resposta.end(JSON.stringify(dadosHome));
    return;
}



    if (metodo !== "GET" || caminho !== "/api/filmes") {
        const mensagem = { erro: "Rota não encontrada." };
        const corpo = JSON.stringify(mensagem);

        resposta.writeHead(404, cabecalhosJson);
        resposta.end(corpo);
        return;
    }

    const buscaRecebida = urlLocal.searchParams.get("busca");
    const busca = buscaRecebida ? buscaRecebida.trim() : "";

    if (busca.length < 2 || busca.length > 80) {
        const mensagem = { erro: "Informe uma busca entre 2 e 80 caracteres." };
        const corpo = JSON.stringify(mensagem);

        resposta.writeHead(400, cabecalhosJson);
        resposta.end(corpo);
        return;
    }

    const urlTMDB = new URL("https://api.themoviedb.org/3/search/movie");
    urlTMDB.searchParams.set("query", busca);
    urlTMDB.searchParams.set("language", "pt-BR");
    urlTMDB.searchParams.set("include_adult", "false");

    try {
        const autorizacao = "Bearer " + token;
        const opcoes = {
            headers: {
                Authorization: autorizacao,
                accept: "application/json"
            }
        };

        const respostaTMDB = await fetch(urlTMDB, opcoes);

        if (!respostaTMDB.ok) {
            throw new Error("TMDB respondeu com HTTP " + respostaTMDB.status);
        }

        const dados = await respostaTMDB.json();
        const resultados = dados.results;

        if (!Array.isArray(resultados)) {
            throw new Error("A resposta do TMDB não trouxe um array de resultados.");
        }

        const mensagem = { resultados: resultados };
        const corpo = JSON.stringify(mensagem);

        resposta.writeHead(200, cabecalhosJson);
        resposta.end(corpo);
    } catch (erro) {
        console.error("Falha ao consultar o TMDB:", erro.message);

        const mensagem = { erro: "Não foi possível consultar o catálogo agora." };
        const corpo = JSON.stringify(mensagem);

        resposta.writeHead(502, cabecalhosJson);
        resposta.end(corpo);
    }
});

servidor.listen(porta, enderecoLocal, function () {
    console.log("Servidor local em http://127.0.0.1:" + porta);
});