/* =========================================
   NEXA CALCULADORA
   Configuração de preços
========================================= */

const precos = {
    projetos: {
        landingPage: 800,
        institucional: 1200,
        lojaVirtual: 2000,
        personalizado: 1800
    },

    paginas: {
        uma: 0,
        duasQuatro: 300,
        cincoSete: 600,
        oitoMais: 900
    },

    funcionalidades: {
        formulario: 100,
        whatsapp: 50,
        galeria: 100,
        blog: 250,
        depoimentos: 50,
        mapa: 50,
        animacoes: 150,
        seo: 150
    },

    design: {
        simples: 0,
        personalizado: 100
    },

    prazo: {
        normal: 0,
        reduzido: 0.10,
        urgente: 0.20
    },

    manutencao: 100
};


/* =========================================
   ELEMENTOS DA INTERFACE
========================================= */

const form = document.getElementById("calculator-form");

const resultSection = document.getElementById("result");

const finalPrice = document.getElementById("final-price");

const detailProject = document.getElementById("detail-project");
const detailPages = document.getElementById("detail-pages");
const detailFeatures = document.getElementById("detail-features");
const detailDesign = document.getElementById("detail-design");
const detailDeadline = document.getElementById("detail-deadline");

const maintenanceCheckbox = document.getElementById("maintenance");
const maintenancePreview = document.getElementById("maintenance-preview");
const maintenanceValue = document.getElementById("maintenance-value");
const resultMaintenance = document.getElementById("result-maintenance");

const formError = document.getElementById("form-error");

const copyButton = document.getElementById("copy-summary");
const copyFeedback = document.getElementById("copy-feedback");

const newSimulationButton = document.getElementById("new-simulation");


/* =========================================
   FORMATAÇÃO DE VALORES
========================================= */

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


/* =========================================
   BUSCAR OPÇÃO SELECIONADA
========================================= */

function obterValorSelecionado(nome) {
    const selecionado = document.querySelector(
        `input[name="${nome}"]:checked`
    );

    return selecionado ? selecionado.value : null;
}


/* =========================================
   BUSCAR FUNCIONALIDADES
========================================= */

function obterFuncionalidadesSelecionadas() {
    const selecionadas = document.querySelectorAll(
        'input[name="features"]:checked'
    );

    return Array.from(selecionadas).map(
        (checkbox) => checkbox.value
    );
}


/* =========================================
   CALCULAR FUNCIONALIDADES
========================================= */

function calcularFuncionalidades(funcionalidades) {
    return funcionalidades.reduce((total, funcionalidade) => {
        return total + (precos.funcionalidades[funcionalidade] || 0);
    }, 0);
}


/* =========================================
   CALCULAR ADICIONAL DE PRAZO
========================================= */

function calcularPrazo(valorBase, tipoPrazo) {
    const percentual = precos.prazo[tipoPrazo] || 0;

    return valorBase * percentual;
}


/* =========================================
   VALIDAR FORMULÁRIO
========================================= */

function validarFormulario() {
    limparErro();

    const tipoProjeto = obterValorSelecionado("project-type");
    const paginas = obterValorSelecionado("pages");
    const design = obterValorSelecionado("design");
    const prazo = obterValorSelecionado("deadline");

    if (!tipoProjeto) {
        mostrarErro("Selecione o tipo de projeto para continuar.");
        return false;
    }

    if (!paginas) {
        mostrarErro("Selecione a quantidade de páginas para continuar.");
        return false;
    }

    if (!design) {
        mostrarErro("Selecione uma opção de design para continuar.");
        return false;
    }

    if (!prazo) {
        mostrarErro("Selecione o prazo desejado para continuar.");
        return false;
    }

    return true;
}


/* =========================================
   MENSAGENS DE ERRO
========================================= */

function mostrarErro(mensagem) {
    formError.textContent = mensagem;
    formError.classList.add("visible");

    formError.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


function limparErro() {
    formError.textContent = "";
    formError.classList.remove("visible");
}


/* =========================================
   CALCULAR ESTIMATIVA
========================================= */

function calcularEstimativa() {
    const tipoProjeto = obterValorSelecionado("project-type");
    const paginas = obterValorSelecionado("pages");
    const design = obterValorSelecionado("design");
    const prazo = obterValorSelecionado("deadline");

    const funcionalidades = obterFuncionalidadesSelecionadas();

    /* Projeto base */
    const valorProjeto =
        precos.projetos[tipoProjeto] || 0;

    /* Páginas */
    const valorPaginas =
        precos.paginas[paginas] || 0;

    /* Funcionalidades */
    const valorFuncionalidades =
        calcularFuncionalidades(funcionalidades);

    /* Design */
    const valorDesign =
        precos.design[design] || 0;

    /*
        O adicional de prazo é calculado
        sobre o subtotal antes do prazo.
    */
    const subtotal =
        valorProjeto +
        valorPaginas +
        valorFuncionalidades +
        valorDesign;

    const valorPrazo =
        calcularPrazo(subtotal, prazo);

    /* Valor final */
    const valorFinal =
        subtotal + valorPrazo;

    /* Manutenção */
    const incluirManutencao =
        maintenanceCheckbox.checked;

    const valorManutencao =
        incluirManutencao
            ? precos.manutencao
            : 0;

    return {
        tipoProjeto,
        paginas,
        funcionalidades,
        design,
        prazo,

        valorProjeto,
        valorPaginas,
        valorFuncionalidades,
        valorDesign,
        valorPrazo,
        valorFinal,

        incluirManutencao,
        valorManutencao
    };
}


/* =========================================
   MOSTRAR RESULTADO
========================================= */

function mostrarResultado(dados) {
    detailProject.textContent =
        formatarMoeda(dados.valorProjeto);

    detailPages.textContent =
        formatarMoeda(dados.valorPaginas);

    detailFeatures.textContent =
        formatarMoeda(dados.valorFuncionalidades);

    detailDesign.textContent =
        formatarMoeda(dados.valorDesign);

    detailDeadline.textContent =
        formatarMoeda(dados.valorPrazo);

    finalPrice.textContent =
        formatarMoeda(dados.valorFinal);

    if (dados.incluirManutencao) {
        resultMaintenance.textContent =
            `${formatarMoeda(dados.valorManutencao)}/mês`;
    } else {
        resultMaintenance.textContent =
            "Não incluída";
    }

    resultSection.hidden = false;

    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================
   MANUTENÇÃO
========================================= */

function atualizarManutencao() {
    if (maintenanceCheckbox.checked) {
        maintenancePreview.hidden = false;

        maintenanceValue.textContent =
            `${formatarMoeda(precos.manutencao)}/mês`;
    } else {
        maintenancePreview.hidden = true;
    }
}


/* =========================================
   NOMES PARA O RESUMO
========================================= */

const nomesProjetos = {
    landingPage: "Landing Page",
    institucional: "Site Institucional",
    lojaVirtual: "Loja Virtual",
    personalizado: "Site Personalizado"
};


const nomesPaginas = {
    uma: "1 página",
    duasQuatro: "2 a 4 páginas",
    cincoSete: "5 a 7 páginas",
    oitoMais: "8 ou mais páginas"
};


const nomesFuncionalidades = {
    formulario: "Formulário",
    whatsapp: "WhatsApp",
    galeria: "Galeria de imagens",
    blog: "Blog",
    depoimentos: "Depoimentos",
    mapa: "Mapa / localização",
    animacoes: "Animações",
    seo: "SEO básico"
};


const nomesDesign = {
    simples: "Simples",
    personalizado: "Personalizado"
};


const nomesPrazo = {
    normal: "Normal",
    reduzido: "Reduzido",
    urgente: "Urgente"
};


/* =========================================
   CRIAR RESUMO
========================================= */

function criarResumo(dados) {
    const funcionalidades =
        dados.funcionalidades.length > 0
            ? dados.funcionalidades
                .map((item) => `* ${nomesFuncionalidades[item]}`)
                .join("\n")
            : "* Nenhuma";

    const manutencao =
        dados.incluirManutencao
            ? `${formatarMoeda(dados.valorManutencao)}/mês`
            : "Não incluída";

    return `NEXA - ESTIMATIVA DE PROJETO

Projeto: ${nomesProjetos[dados.tipoProjeto]}

Páginas: ${nomesPaginas[dados.paginas]}

Funcionalidades:
${funcionalidades}

Design: ${nomesDesign[dados.design]}

Prazo: ${nomesPrazo[dados.prazo]}

Desenvolvimento: ${formatarMoeda(dados.valorFinal)}

Manutenção: ${manutencao}`;
}


/* =========================================
   COPIAR RESUMO
========================================= */

async function copiarResumo() {
    if (resultSection.hidden) {
        return;
    }

    const dados = calcularEstimativa();
    const resumo = criarResumo(dados);

    try {
        await navigator.clipboard.writeText(resumo);

        copyFeedback.textContent =
            "Resumo copiado para a área de transferência.";

        setTimeout(() => {
            copyFeedback.textContent = "";
        }, 3000);

    } catch (erro) {
        copyFeedback.textContent =
            "Não foi possível copiar automaticamente.";

        console.error(
            "Erro ao copiar resumo:",
            erro
        );
    }
}


/* =========================================
   NOVA SIMULAÇÃO
========================================= */

function novaSimulacao() {
    form.reset();

    resultSection.hidden = true;

    maintenancePreview.hidden = true;

    limparErro();

    copyFeedback.textContent = "";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================
   EVENTOS
========================================= */

form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    const dados = calcularEstimativa();

    mostrarResultado(dados);
});


maintenanceCheckbox.addEventListener(
    "change",
    atualizarManutencao
);


copyButton.addEventListener(
    "click",
    copiarResumo
);


newSimulationButton.addEventListener(
    "click",
    novaSimulacao
);


/* =========================================
   INICIALIZAÇÃO
========================================= */

atualizarManutencao();