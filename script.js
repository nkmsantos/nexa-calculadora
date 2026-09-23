/* =========================================
   NEXA CALCULADORA
   Configuração de preços e lógica de cálculo para estimativa de projetos.
========================================= */

// Objeto que armazena os valores base para cada tipo de serviço e funcionalidade.
// A estrutura reflete as opções disponíveis no formulário.
const precosServicos = {
    projetos: {
        landingPage: 800,
        institucional: 1200,
        lojaVirtual: 2000,
        personalizado: 1800
    },

    paginas: {
        uma: 0, // A primeira página geralmente está inclusa no valor base do projeto
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
        simples: 0, // Design simples geralmente não adiciona custo extra
        personalizado: 100
    },

    prazo: {
        normal: 0, // Prazo normal não tem adicional
        reduzido: 0.10, // 10% de adicional para prazo reduzido
        urgente: 0.20 // 20% de adicional para prazo urgente
    },

    manutencaoMensal: 100 // Valor fixo para manutenção mensal
};


/* =========================================
   REFERÊNCIAS AOS ELEMENTOS DA INTERFACE (DOM)
   Facilita o acesso e manipulação dos elementos HTML no JavaScript.
========================================= */

const formularioCalculadora = document.getElementById("calculator-form");

const secaoResultado = document.getElementById("result-section");

const precoFinalElemento = document.getElementById("final-price");

// Elementos para exibir o detalhamento do orçamento
const detalheProjetoValor = document.getElementById("detail-project-value");
const detalhePaginasValor = document.getElementById("detail-pages-value");
const detalheFuncionalidadesValor = document.getElementById("detail-features-value");
const detalheDesignValor = document.getElementById("detail-design-value");
const detalhePrazoValor = document.getElementById("detail-deadline-value");

// Elementos relacionados à manutenção
const checkboxManutencao = document.getElementById("maintenance-checkbox");
const preVisualizacaoManutencao = document.getElementById("maintenance-preview");
const valorManutencaoExibicao = document.getElementById("maintenance-value");
const statusManutencaoResultado = document.getElementById("result-maintenance-status");

// Elemento para exibir mensagens de erro do formulário
const mensagemErroFormulario = document.getElementById("form-error-message");

// Botões de ação
const botaoCopiarResumo = document.getElementById("copy-summary-button");
const feedbackCopiaMensagem = document.getElementById("copy-feedback-message");
const botaoNovaSimulacao = document.getElementById("new-simulation-button");


/* =========================================
   FUNÇÕES AUXILIARES DE FORMATAÇÃO
========================================= */

/**
 * Formata um valor numérico para o formato de moeda brasileira (BRL).
 * @param {number} valor - O número a ser formatado.
 * @returns {string} O valor formatado como moeda.
 */
function formatarValorParaMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


/* =========================================
   FUNÇÕES AUXILIARES PARA OBTER DADOS DO FORMULÁRIO
========================================= */

/**
 * Obtém o valor do radio button selecionado em um grupo específico.
 * @param {string} nomeDoGrupo - O atributo 'name' do grupo de radio buttons.
 * @returns {string|null} O 'value' do radio button selecionado, ou null se nenhum for selecionado.
 */
function obterOpcaoSelecionada(nomeDoGrupo) {
    const elementoSelecionado = document.querySelector(
        `input[name="${nomeDoGrupo}"]:checked`
    );
    return elementoSelecionado ? elementoSelecionado.value : null;
}

/**
 * Obtém um array com os valores de todos os checkboxes marcados no grupo 'features'.
 * @returns {string[]} Um array de strings com os valores das funcionalidades selecionadas.
 */
function obterFuncionalidadesMarcadas() {
    const checkboxesMarcados = document.querySelectorAll(
        'input[name="features"]:checked'
    );
    // Converte a NodeList para Array e mapeia para obter apenas os valores.
    return Array.from(checkboxesMarcados).map(
        (checkbox) => checkbox.value
    );
}


/* =========================================
   FUNÇÕES DE CÁLCULO ESPECÍFICAS
========================================= */

/**
 * Calcula o custo total das funcionalidades extras selecionadas.
 * @param {string[]} listaDeFuncionalidades - Array com os nomes das funcionalidades selecionadas.
 * @returns {number} O valor total das funcionalidades.
 */
function calcularCustoFuncionalidades(listaDeFuncionalidades) {
    // Utiliza 'reduce' para somar os preços de cada funcionalidade.
    return listaDeFuncionalidades.reduce((totalAcumulado, funcionalidadeAtual) => {
        // Garante que a funcionalidade exista no objeto de preços, caso contrário, adiciona 0.
        return totalAcumulado + (precosServicos.funcionalidades[funcionalidadeAtual] || 0);
    }, 0); // O valor inicial da soma é 0.
}


/**
 * Calcula o adicional percentual baseado no prazo de entrega escolhido.
 * @param {number} valorBaseDoProjeto - O subtotal do projeto antes do adicional de prazo.
 * @param {string} tipoDePrazo - O tipo de prazo selecionado (normal, reduzido, urgente).
 * @returns {number} O valor adicional a ser somado ao projeto devido ao prazo.
 */
function calcularAdicionalPrazo(valorBaseDoProjeto, tipoDePrazo) {
    const percentualAdicional = precosServicos.prazo[tipoDePrazo] || 0;
    return valorBaseDoProjeto * percentualAdicional;
}


/* =========================================
   FUNÇÕES DE VALIDAÇÃO E FEEDBACK DO FORMULÁRIO
========================================= */

/**
 * Valida se todas as opções obrigatórias do formulário foram selecionadas.
 * Exibe uma mensagem de erro se alguma opção estiver faltando.
 * @returns {boolean} True se o formulário for válido, False caso contrário.
 */
function validarFormulario() {
    limparMensagemErro(); // Limpa qualquer erro anterior antes de validar novamente.

    // Obtém os valores das opções obrigatórias.
    const tipoProjeto = obterOpcaoSelecionada("project-type");
    const paginas = obterOpcaoSelecionada("pages");
    const design = obterOpcaoSelecionada("design");
    const prazo = obterOpcaoSelecionada("deadline"); // CORRIGIDO: Era 'obterOpterOpcaoSelecionada'

    // Verifica cada campo obrigatório e exibe um erro se estiver faltando.
    if (!tipoProjeto) {
        exibirMensagemErro("Por favor, selecione o tipo de projeto para continuar.");
        return false;
    }

    if (!paginas) {
        exibirMensagemErro("Por favor, selecione a quantidade de páginas para continuar.");
        return false;
    }

    if (!design) {
        exibirMensagemErro("Por favor, selecione uma opção de design para continuar.");
        return false;
    }

    if (!prazo) {
        exibirMensagemErro("Por favor, selecione o prazo desejado para continuar.");
        return false;
    }

    return true; // Se todas as verificações passarem, o formulário é válido.
}


/**
 * Exibe uma mensagem de erro no elemento de feedback do formulário.
 * @param {string} mensagem - A mensagem de erro a ser exibida.
 */
function exibirMensagemErro(mensagem) {
    mensagemErroFormulario.textContent = mensagem;
    mensagemErroFormulario.classList.add("visible");

    // Rola a página até a mensagem de erro para que o usuário a veja.
    mensagemErroFormulario.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


/**
 * Limpa qualquer mensagem de erro exibida no formulário.
 */
function limparMensagemErro() {
    mensagemErroFormulario.textContent = "";
    mensagemErroFormulario.classList.remove("visible");
}


/* =========================================
   FUNÇÃO PRINCIPAL DE CÁLCULO DA ESTIMATIVA
========================================= */

/**
 * Calcula a estimativa de preço do projeto com base nas opções selecionadas no formulário.
 * @returns {object} Um objeto contendo todos os detalhes do cálculo e o valor final.
 */
function calcularEstimativaProjeto() {
    // Coleta os valores selecionados do formulário.
    const tipoProjetoSelecionado = obterOpcaoSelecionada("project-type");
    const paginasSelecionadas = obterOpcaoSelecionada("pages");
    const designSelecionado = obterOpcaoSelecionada("design");
    const prazoSelecionado = obterOpcaoSelecionada("deadline");
    const funcionalidadesSelecionadas = obterFuncionalidadesMarcadas();

    /* 1. Cálculo do valor base do projeto */
    const valorBaseProjeto = precosServicos.projetos[tipoProjetoSelecionado] || 0;

    /* 2. Cálculo do valor das páginas adicionais */
    const valorAdicionalPaginas = precosServicos.paginas[paginasSelecionadas] || 0;

    /* 3. Cálculo do valor das funcionalidades extras */
    const valorTotalFuncionalidades = calcularCustoFuncionalidades(funcionalidadesSelecionadas);

    /* 4. Cálculo do valor do design (se personalizado) */
    const valorAdicionalDesign = precosServicos.design[designSelecionado] || 0;

    /*
        5. O adicional de prazo é calculado sobre o subtotal
        (valor base + páginas + funcionalidades + design) antes do próprio adicional de prazo.
        Isso garante que o percentual seja aplicado sobre o custo total do trabalho.
    */
    const subtotalAntesPrazo =
        valorBaseProjeto +
        valorAdicionalPaginas +
        valorTotalFuncionalidades +
        valorAdicionalDesign;

    const valorAdicionalPrazo = calcularAdicionalPrazo(subtotalAntesPrazo, prazoSelecionado);

    /* 6. Valor final do projeto (sem manutenção) */
    const valorEstimadoFinal = subtotalAntesPrazo + valorAdicionalPrazo;

    /* 7. Verificação e cálculo da manutenção mensal */
    const incluirManutencao = checkboxManutencao.checked;
    const valorManutencao = incluirManutencao ? precosServicos.manutencaoMensal : 0;

    // Retorna um objeto com todos os valores calculados para exibição e resumo.
    return {
        tipoProjeto: tipoProjetoSelecionado,
        paginas: paginasSelecionadas,
        funcionalidades: funcionalidadesSelecionadas,
        design: designSelecionado,
        prazo: prazoSelecionado,

        valorBaseProjeto,
        valorAdicionalPaginas,
        valorTotalFuncionalidades,
        valorAdicionalDesign,
        valorAdicionalPrazo,
        valorEstimadoFinal,

        incluirManutencao,
        valorManutencao
    };
}


/* =========================================
   FUNÇÕES DE ATUALIZAÇÃO DA INTERFACE
========================================= */

/**
 * Atualiza a seção de resultados na interface com os dados calculados.
 * @param {object} dadosDoCalculo - Objeto retornado por `calcularEstimativaProjeto`.
 */
function exibirResultadosNaInterface(dadosDoCalculo) {
    // Atualiza os valores detalhados do orçamento.
    detalheProjetoValor.textContent = formatarValorParaMoeda(dadosDoCalculo.valorBaseProjeto);
    detalhePaginasValor.textContent = formatarValorParaMoeda(dadosDoCalculo.valorAdicionalPaginas);
    detalheFuncionalidadesValor.textContent = formatarValorParaMoeda(dadosDoCalculo.valorTotalFuncionalidades);
    detalheDesignValor.textContent = formatarValorParaMoeda(dadosDoCalculo.valorAdicionalDesign);
    detalhePrazoValor.textContent = formatarValorParaMoeda(dadosDoCalculo.valorAdicionalPrazo);

    // Atualiza o preço final.
    precoFinalElemento.textContent = formatarValorParaMoeda(dadosDoCalculo.valorEstimadoFinal);

    // Atualiza o status da manutenção no resultado.
    if (dadosDoCalculo.incluirManutencao) {
        statusManutencaoResultado.textContent =
            `${formatarValorParaMoeda(dadosDoCalculo.valorManutencao)}/mês`;
    } else {
        statusManutencaoResultado.textContent = "Não incluída";
    }

    // Torna a seção de resultados visível.
    secaoResultado.hidden = false;

    // Rola a página até a seção de resultados para que o usuário a veja.
    secaoResultado.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/**
 * Atualiza a pré-visualização do valor da manutenção com base no estado do checkbox.
 */
function atualizarPreVisualizacaoManutencao() {
    if (checkboxManutencao.checked) {
        preVisualizacaoManutencao.hidden = false;
        valorManutencaoExibicao.textContent =
            `${formatarValorParaMoeda(precosServicos.manutencaoMensal)}/mês`;
    } else {
        preVisualizacaoManutencao.hidden = true;
    }
}


/* =========================================
   OBJETOS DE MAPEAMENTO PARA NOMES AMIGÁVEIS (RESUMO)
   Usados para converter os valores técnicos do formulário em descrições legíveis para o resumo.
========================================= */

const nomesAmigaveisProjetos = {
    landingPage: "Landing Page",
    institucional: "Site Institucional",
    lojaVirtual: "Loja Virtual",
    personalizado: "Site Personalizado"
};


const nomesAmigaveisPaginas = {
    uma: "1 página",
    duasQuatro: "2 a 4 páginas",
    cincoSete: "5 a 7 páginas",
    oitoMais: "8 ou mais páginas"
};


const nomesAmigaveisFuncionalidades = {
    formulario: "Formulário de contato",
    whatsapp: "Integração com WhatsApp",
    galeria: "Galeria de imagens",
    blog: "Blog",
    depoimentos: "Área de depoimentos",
    mapa: "Mapa / localização",
    animacoes: "Animações",
    seo: "SEO básico"
};


const nomesAmigaveisDesign = {
    simples: "Simples",
    personalizado: "Personalizado"
};


const nomesAmigaveisPrazo = {
    normal: "Normal",
    reduzido: "Reduzido",
    urgente: "Urgente"
};


/* =========================================
   FUNÇÕES DE RESUMO E CÓPIA
========================================= */

/**
 * Cria uma string de resumo formatada com todos os detalhes do orçamento.
 * @param {object} dadosDoCalculo - Objeto retornado por `calcularEstimativaProjeto`.
 * @returns {string} O resumo completo do orçamento.
 */
function gerarResumoDoOrcamento(dadosDoCalculo) {
    // Formata a lista de funcionalidades para o resumo.
    const funcionalidadesFormatadas =
        dadosDoCalculo.funcionalidades.length > 0
            ? dadosDoCalculo.funcionalidades
                .map((item) => `* ${nomesAmigaveisFuncionalidades[item]}`)
                .join("\n") // Junta os itens com quebra de linha
            : "* Nenhuma funcionalidade extra selecionada"; // Mensagem padrão se não houver funcionalidades.

    // Determina o status da manutenção para o resumo.
    const statusManutencaoResumo =
        dadosDoCalculo.incluirManutencao
            ? `${formatarValorParaMoeda(dadosDoCalculo.valorManutencao)}/mês`
            : "Não incluída";

    // Utiliza template literals para construir o resumo de forma legível.
    return `NEXA - ESTIMATIVA DE PROJETO

Tipo de Projeto: ${nomesAmigaveisProjetos[dadosDoCalculo.tipoProjeto]}

Número de Páginas: ${nomesAmigaveisPaginas[dadosDoCalculo.paginas]}

Funcionalidades Extras:
${funcionalidadesFormatadas}

Nível de Design: ${nomesAmigaveisDesign[dadosDoCalculo.design]}

Prazo de Entrega: ${nomesAmigaveisPrazo[dadosDoCalculo.prazo]}

----------------------------------------
Valor Estimado do Desenvolvimento: ${formatarValorParaMoeda(dadosDoCalculo.valorEstimadoFinal)}
Manutenção Mensal: ${statusManutencaoResumo}
----------------------------------------

Esta é uma estimativa inicial. Para um orçamento detalhado, entre em contato.`;
}


/**
 * Copia o resumo do orçamento para a área de transferência do usuário.
 * Fornece feedback visual sobre o sucesso ou falha da operação.
 */
async function copiarResumoParaAreaDeTransferencia() {
    // Não tenta copiar se a seção de resultados estiver oculta.
    if (secaoResultado.hidden) {
        return;
    }

    const dadosAtuais = calcularEstimativaProjeto();
    const resumoGerado = gerarResumoDoOrcamento(dadosAtuais);

    try {
        // Utiliza a API Clipboard moderna para copiar texto.
        await navigator.clipboard.writeText(resumoGerado);

        feedbackCopiaMensagem.textContent =
            "Resumo copiado para a área de transferência!";
        // Usa a variável CSS para a cor de sucesso
        feedbackCopiaMensagem.style.color = 'var(--color-success)';

        // Limpa a mensagem de feedback após 3 segundos.
        setTimeout(() => {
            feedbackCopiaMensagem.textContent = "";
            feedbackCopiaMensagem.style.color = ''; // Reseta a cor
        }, 3000);

    } catch (erro) {
        // Em caso de falha (ex: permissão negada), informa o usuário.
        feedbackCopiaMensagem.textContent =
            "Não foi possível copiar automaticamente. Por favor, copie manualmente.";
        // Usa a variável CSS para a cor de erro
        feedbackCopiaMensagem.style.color = 'var(--color-error)';

        console.error(
            "Erro ao copiar resumo para a área de transferência:",
            erro
        );
    }
}


/* =========================================
   FUNÇÃO PARA INICIAR UMA NOVA SIMULAÇÃO
========================================= */

/**
 * Reseta o formulário e a interface para iniciar uma nova simulação de orçamento.
 */
function iniciarNovaSimulacao() {
    formularioCalculadora.reset(); // Limpa todos os campos do formulário.

    secaoResultado.hidden = true; // Esconde a seção de resultados.

    preVisualizacaoManutencao.hidden = true; // Esconde a pré-visualização da manutenção.

    limparMensagemErro(); // Limpa qualquer mensagem de erro.

    feedbackCopiaMensagem.textContent = ""; // Limpa o feedback de cópia.
    feedbackCopiaMensagem.style.color = ''; // Reseta a cor do feedback.

    // Rola a página para o topo para uma nova experiência de usuário.
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================
   REGISTRO DE EVENTOS (EVENT LISTENERS)
   Conecta as interações do usuário às funções JavaScript.
========================================= */

// Evento de submissão do formulário: calcula e exibe a estimativa.
formularioCalculadora.addEventListener("submit", (evento) => {
    evento.preventDefault(); // Impede o comportamento padrão de recarregar a página.

    // Valida o formulário antes de prosseguir com o cálculo.
    if (!validarFormulario()) {
        return; // Se a validação falhar, interrompe a execução.
    }

    const dadosCalculados = calcularEstimativaProjeto(); // Realiza o cálculo.
    exibirResultadosNaInterface(dadosCalculados); // Atualiza a interface com os resultados.
});

// Evento de mudança no checkbox de manutenção: atualiza a pré-visualização.
checkboxManutencao.addEventListener(
    "change",
    atualizarPreVisualizacaoManutencao
);

// Evento de clique no botão de copiar resumo.
botaoCopiarResumo.addEventListener(
    "click",
    copiarResumoParaAreaDeTransferencia
);

// Evento de clique no botão de nova simulação.
botaoNovaSimulacao.addEventListener(
    "click",
    iniciarNovaSimulacao
);


/* =========================================
   INICIALIZAÇÃO DA APLICAÇÃO
   Funções a serem executadas quando a página é carregada.
========================================= */

// Garante que a pré-visualização da manutenção esteja no estado correto ao carregar a página.
atualizarPreVisualizacaoManutencao();