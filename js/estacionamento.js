
const CHAVE_DADOS = "neris_estacionamento_dados";
const CUSTO_ENTRADA = 5;
const CUSTO_HORA = 10;
const DURACAO_HORA = 60 * 1000;

// CADASTRO DOS VEÍCULOS
const veiculos = {
    "002": {
        nome: "Richard Praz De Almeida",
        modelo: "Mercedes-AMG GT",
        cor: "Amarelo",
        ano: "2018",
        foto: "img/m.jpeg"
    },
    "022": {
        nome: "Miguel da Silva Junior",
        modelo: "Honda Civic Type R",
        cor: "Azul",
        ano: "2016",
        foto: "img/civic.jpeg"
    },
    "027": {
        nome: "João Pedro Matos",
        modelo: "Lamborghini",
        cor: "Não informado",
        ano: "Não informado",
        foto: "img/lambo.jpeg"
    }
};

const formPesquisa = document.getElementById("formPesquisa");
const codigoPesquisa = document.getElementById("codigoPesquisa");
const cartaoVeiculo = document.getElementById("cartaoVeiculo");
const mensagem = document.getElementById("mensagem");

const formRecarga = document.getElementById("formRecarga");
const codigoRecarga = document.getElementById("codigoRecarga");
const quantidadeRecarga = document.getElementById("quantidadeRecarga");

let codigoAtual = null;
let dados = carregarDados();

function carregarDados() {
    let salvos = {};

    try {
        salvos = JSON.parse(
            localStorage.getItem(CHAVE_DADOS) || "{}"
        );
    } catch (erro) {
        salvos = {};
    }

    Object.keys(veiculos).forEach(codigo => {
        const registro = salvos[codigo] || {};

        salvos[codigo] = {
            pontos: Number.isInteger(registro.pontos)
                ? Math.max(0, registro.pontos)
                : 20,
            estacionado: registro.estacionado === true,
            proximaCobranca:
                Number.isFinite(registro.proximaCobranca)
                    ? registro.proximaCobranca
                    : null
        };
    });

    return salvos;
}

function salvarDados() {
    localStorage.setItem(CHAVE_DADOS, JSON.stringify(dados));
}

function mostrarMensagem(texto, tipo = "") {
    mensagem.textContent = texto;
    mensagem.className = "mensagem " + tipo;
}

formPesquisa.addEventListener("submit", evento => {
    evento.preventDefault();
    pesquisarVeiculo(codigoPesquisa.value);
});

function pesquisarVeiculo(codigo) {
    codigo = codigo.trim();

    if (!veiculos[codigo]) {
        codigoAtual = null;

        cartaoVeiculo.innerHTML = `
            <div class="cartao-vazio">
                <p>Cadastro não encontrado. Confira o código.</p>
            </div>
        `;

        mostrarMensagem("Código não cadastrado.", "erro");
        return;
    }

    codigoAtual = codigo;
    mostrarMensagem("Veículo localizado!", "sucesso");
    renderizarCartao();
}

function estacionar(codigo) {
    const registro = dados[codigo];

    if (registro.estacionado) {
        mostrarMensagem("O veículo já está estacionado.", "erro");
        return;
    }

    if (registro.pontos < CUSTO_ENTRADA) {
        mostrarMensagem(
            "Entrada bloqueada! Solicite pontos ao oficial.",
            "erro"
        );
        return;
    }

    registro.pontos -= CUSTO_ENTRADA;
    registro.estacionado = true;
    registro.proximaCobranca = Date.now() + DURACAO_HORA;

    salvarDados();
    mostrarMensagem("Veículo estacionado!", "sucesso");
    renderizarCartao();
}

function retirarVeiculo(codigo) {
    dados[codigo].estacionado = false;
    dados[codigo].proximaCobranca = null;

    salvarDados();
    mostrarMensagem("Veículo retirado do estacionamento.", "sucesso");
    renderizarCartao();
}

formRecarga.addEventListener("submit", evento => {
    evento.preventDefault();

    const codigo = codigoRecarga.value.trim();
    const quantidade = Number(quantidadeRecarga.value);

    if (!veiculos[codigo]) {
        alert("Código não encontrado.");
        return;
    }

    if (!Number.isSafeInteger(quantidade) || quantidade < 1) {
        alert("Digite uma quantidade válida de pontos.");
        return;
    }

    if (dados[codigo].pontos + quantidade > Number.MAX_SAFE_INTEGER) {
        alert("Quantidade muito alta.");
        return;
    }

    dados[codigo].pontos += quantidade;
    salvarDados();

    alert(
        "Recarga demonstrativa realizada!\n" +
        "Proprietário: " + veiculos[codigo].nome + "\n" +
        "Pontos adicionados: " + quantidade + "\n" +
        "Saldo atual: " + dados[codigo].pontos
    );

    quantidadeRecarga.value = "";

    if (codigoAtual === codigo) {
        renderizarCartao();
    }
});

function atualizarCobrancas() {
    const agora = Date.now();
    let alterou = false;

    Object.keys(veiculos).forEach(codigo => {
        const registro = dados[codigo];

        if (!registro.estacionado || !registro.proximaCobranca) {
            return;
        }

        while (agora >= registro.proximaCobranca) {
            if (registro.pontos < CUSTO_HORA) {
                registro.estacionado = false;
                registro.proximaCobranca = null;
                alterou = true;

                if (codigoAtual === codigo) {
                    mostrarMensagem(
                        "Estacionamento encerrado por falta de pontos. Solicite recarga ao oficial.",
                        "erro"
                    );
                }

                break;
            }

            registro.pontos -= CUSTO_HORA;
            registro.proximaCobranca += DURACAO_HORA;
            alterou = true;
        }
    });

    if (alterou) {
        salvarDados();
    }

    if (codigoAtual) {
        renderizarCartao();
    }
}

function renderizarCartao() {
    const veiculo = veiculos[codigoAtual];
    const registro = dados[codigoAtual];

    if (!veiculo || !registro) return;

    const estacionado = registro.estacionado;

    // Caminhos das fotos relativos à página estacionamento.html.
    const foto = veiculo.foto;

    const status = estacionado
        ? "ESTACIONADO"
        : registro.pontos < CUSTO_ENTRADA
            ? "BLOQUEADO POR SALDO"
            : "FORA DO ESTACIONAMENTO";

    let temporizador = "";

    if (estacionado && registro.proximaCobranca) {
        const restante = Math.max(
            0,
            registro.proximaCobranca - Date.now()
        );

        const segundos = Math.ceil(restante / 1000);
        const minutos = Math.floor(segundos / 60);
        const segundosFinais = segundos % 60;

        temporizador = `
            <p class="timer">
                Próxima cobrança:
                ${String(minutos).padStart(2, "0")}:
                ${String(segundosFinais).padStart(2, "0")}
            </p>
        `;
    }

    cartaoVeiculo.innerHTML = `
        <article class="cartao-veiculo">

            <div class="foto-veiculo">
                <img
                    src="${foto}"
                    alt="Foto do ${veiculo.modelo}"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                >
                <span style="display:none">
                    FOTO NÃO ENCONTRADA<br>
                    Verifique o caminho: ${foto}
                </span>
            </div>

            <div class="dados-veiculo">
                <h3>${veiculo.modelo}</h3>

                <p><strong>Código:</strong> ${codigoAtual}</p>
                <p><strong>Proprietário:</strong> ${veiculo.nome}</p>
                <p><strong>Cor:</strong> ${veiculo.cor}</p>
                <p><strong>Ano:</strong> ${veiculo.ano}</p>

                <p class="pontos">
                    Saldo: ${registro.pontos} pontos
                </p>

                <p>
                    <strong>Entrada:</strong> ${CUSTO_ENTRADA} pontos
                </p>

                <p>
                    <strong>Hora simulada:</strong>
                    ${CUSTO_HORA} pontos (R$ 5,00)
                </p>

                <span class="status ${
                    estacionado
                        ? "ativo"
                        : registro.pontos < CUSTO_ENTRADA
                            ? "bloqueado"
                            : ""
                }">
                    ${status}
                </span>

                ${temporizador}

                <div class="acoes">
                    ${
                        estacionado
                            ? `<button class="botao-sair" id="botaoAcao">
                                   Retirar veículo
                               </button>`
                            : `<button class="botao-estacionar" id="botaoAcao"
                                ${registro.pontos < CUSTO_ENTRADA ? "disabled" : ""}>
                                   Estacionar (-5 pontos)
                               </button>`
                    }
                </div>
            </div>

        </article>
    `;

    document.getElementById("botaoAcao").addEventListener("click", () => {
        if (dados[codigoAtual].estacionado) {
            retirarVeiculo(codigoAtual);
        } else {
            estacionar(codigoAtual);
        }
    });
}

// Atualiza o temporizador e as cobranças.
atualizarCobrancas();
setInterval(atualizarCobrancas, 1000);
