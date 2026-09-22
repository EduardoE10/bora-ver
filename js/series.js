const formulario = document.querySelector("#formulario-serie");
const campo = document.querySelector("#campo-series");
const estado = document.querySelector("#estado-series");
const lista = document.querySelector("#lista-series");

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const textoDigitado = campo.value;
    const termo = textoDigitado.trim();
    const termoParaUrl = encodeURIComponent(termo);
    const enderecoBase = "https://api.tvmaze.com/search/shows?q=";
    const enderecoCompleto = enderecoBase + termoParaUrl;

    lista.replaceChildren();
    estado.textContent = "Buscando séries...";

    try {
        const resposta = await fetch(enderecoCompleto);

        if (!resposta.ok) {
            throw new Error("A API respondeu com o código " + resposta.status);
        }

        const resultados = await resposta.json();

        if (resultados.length === 0) {
            estado.textContent = "Nenhuma série encontrada.";
            return;
        }

        for (const resultado of resultados) {
            const serie = resultado.show;
            const nome = serie.name;
            const item = document.createElement("li");

            item.textContent = nome;
            lista.appendChild(item);
        }

        const quantidade = resultados.length;
        estado.textContent = quantidade + " série(s) encontrada(s).";
    } catch (erro) {
        estado.textContent = "Não foi possível buscar séries agora. Tente novamente.";
        console.error(erro);
    }
});