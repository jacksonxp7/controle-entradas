function menu() {
    const container_menu = document.getElementById("container_menu");
    const container_app = document.getElementById("container_app");
    const button_menu = document.getElementById("button_menu");
    const botaofechar_menu = document.getElementById("botaofechar_menu");
    const botoes_menu = document.getElementById("botoes_menu");

    // Abre o menu
    function abrirMenu() {
        container_menu.style.transition = "left 0.3s ease-in-out";
        container_app.style.transition = "width 0.3s ease-in-out";
        container_app.style.width = "80%";
        container_menu.style.left = "0px";
        button_menu.style.display = "none";
        botaofechar_menu.style.display = "flex";
        container_app.style.filter = "blur(0.1rem)";
    }

    // Fecha o menu e restaura a exibição da aplicação
    function fecharMenu() {
        container_app.style.width = "100%";
        container_menu.style.left = "-20%";
        button_menu.style.display = "flex";
        botaofechar_menu.style.display = "none";
        container_app.style.filter = "blur(0px)";
    }

    button_menu.addEventListener("click", abrirMenu);
    botaofechar_menu.addEventListener("click", fecharMenu);

    // Inicializa: esconde todos os containers (remove qualquer exibição ou indentação ativa)
    const buttons = Array.from(botoes_menu.children);
    buttons.forEach((button) => {
        const id = button.textContent.trim().toLowerCase();
        const container = document.getElementById(`container_${id}`);
        if (container) {
            container.classList.add("hide");
            container.classList.remove("show", "container_app_content");
        }
    });

    // Para cada botão do menu, define a ação de trocar de tela
    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            // Primeiro, remove as classes de exibição de todos os containers e adiciona "hide"
            buttons.forEach((btn) => {
                const otherId = btn.textContent.trim().toLowerCase();
                const otherContainer = document.getElementById(`container_${otherId}`);
                if (otherContainer) {
                    otherContainer.classList.remove("show", "container_app_content");
                    otherContainer.classList.add("hide");
                }
            });

            // Seleciona e exibe o container correspondente ao botão clicado
            const id = button.textContent.trim().toLowerCase();
            const currentContainer = document.getElementById(`container_${id}`);
            if (currentContainer) {
                currentContainer.classList.remove("hide");
                currentContainer.classList.add("show", "container_app_content");
            }

            // Fecha o menu após a seleção
            fecharMenu();

        });
    });
    document.getElementById('container_inicio').classList.add("show", "container_app_content")
    document.getElementById('container_inicio').classList.remove("hide")
}
menu()

function inicio() {
    // SLIDER FUNCTIONALITY
    function slider() {
        const sliderElement = document.getElementById('labelimages');
        if (!sliderElement) return;
        const images = [
            'imagens/label_inicio/fazer-tabua-de-frios.jpg',
            'imagens/label_inicio/pasteis-coxinhas-miniatura-bares.jpg',
            'imagens/label_inicio/porcoes-frutos-do-mar.jpg',
            'imagens/label_inicio/porcoes-individuais-bar.jpg',
            'imagens/label_inicio/tipos-de-porcoes.jpg'
        ];
        sliderElement.innerHTML = "";
        for (const imagem of images) {
            const img = document.createElement('img');
            img.src = imagem;
            img.classList.add('slider-image');
            sliderElement.appendChild(img);
        }
    }

    // CARDAPIO INITIALIZATION AND MANAGEMENT
    function inicializarCardapio() {
        if (!localStorage.getItem("cardapio")) {
            localStorage.setItem("cardapio", JSON.stringify({}));
        }
    }

    function carregarCardapio() {
        const dados = JSON.parse(localStorage.getItem("cardapio")) || {};
        gerarCardapio(dados);
    }

    function salvarCardapio(cardapio) {
        localStorage.setItem("cardapio", JSON.stringify(cardapio));
    }

    function gerarCardapio(json) {
        const container = document.getElementById("cardapio");
        if (!container) return;
        container.innerHTML = "";

        for (let secao in json) {
            const dados = json[secao];
            const divSecao = document.createElement("div");
            divSecao.classList.add(`cardapio-${secao}`, "cardapios");

            if (dados.imagemTopo) {
                const imgTopo = document.createElement("img");
                imgTopo.src = dados.imagemTopo;
                imgTopo.alt = `Imagem topo ${secao}`;
                divSecao.appendChild(imgTopo);
            }

            const divItens = document.createElement("div");
            divItens.classList.add("itens-cardapio");

            const tituloDiv = document.createElement("div");
            tituloDiv.classList.add("titulo-cardapio");
            const h3 = document.createElement("h3");
            h3.textContent = secao.charAt(0).toUpperCase() + secao.slice(1);

            if (dados.icone) {
                const icone = document.createElement("img");
                icone.src = dados.icone;
                icone.alt = `Ícone ${secao}`;
                if (secao === "porções" || secao === "sobremesas") {
                    tituloDiv.appendChild(icone);
                    tituloDiv.appendChild(h3);
                } else {
                    tituloDiv.appendChild(h3);
                    tituloDiv.appendChild(icone);
                }
            } else {
                tituloDiv.appendChild(h3);
            }
            divItens.appendChild(tituloDiv);

            const ul = document.createElement("ul");
            if (Array.isArray(dados.itens)) {
                dados.itens.forEach(item => {
                    const li = document.createElement("li");
                    const produtoSpan = document.createElement("span");
                    produtoSpan.classList.add("produto");
                    produtoSpan.textContent = item.nome;
                    produtoSpan.dataset.itemName = item.nome;
                    const precoSpan = document.createElement("span");
                    precoSpan.classList.add("preco");
                    precoSpan.textContent = item.preco;
                    li.appendChild(produtoSpan);
                    li.appendChild(precoSpan);
                    ul.appendChild(li);
                });
            }
            divItens.appendChild(ul);
            divSecao.appendChild(divItens);

            if (dados.imagemRodape) {
                const imgRodape = document.createElement("img");
                imgRodape.src = dados.imagemRodape;
                imgRodape.alt = `Imagem rodapé ${secao}`;
                divSecao.appendChild(imgRodape);
            }
            container.appendChild(divSecao);
        }
    }

    // PRICE EDITING FUNCTIONALITY
    function editarPreco() {
        document.addEventListener("click", function (e) {
            if (e.target.classList.contains("preco")) {
                const precoSpan = e.target;
                const precoAtual = precoSpan.textContent.trim();
                if (precoSpan.querySelector("input")) return;

                const input = document.createElement("input");
                input.type = "text";
                input.value = precoAtual.replace("R$", "").trim();
                input.style.width = "80px";
                input.classList.add("input-preco");
                const btn = document.createElement("button");
                btn.textContent = "✅";
                btn.style.marginLeft = "5px";
                btn.classList.add("btn-confirmar");

                precoSpan.innerHTML = "";
                precoSpan.appendChild(input);
                precoSpan.appendChild(btn);
                input.focus();
                input.select();

                const confirmUpdate = () => {
                    let novoPreco = input.value.trim();
                    if (novoPreco === "") novoPreco = precoAtual;
                    else if (!novoPreco.toLowerCase().startsWith("r$")) novoPreco = "R$ " + novoPreco;
                    precoSpan.textContent = novoPreco;

                    const nomeProdutoElement = precoSpan.closest("li").querySelector(".produto");
                    if (!nomeProdutoElement) return;
                    const nomeProduto = nomeProdutoElement.textContent;
                    const cardapioAtual = JSON.parse(localStorage.getItem("cardapio"));
                    const secaoDiv = precoSpan.closest(".cardapios");
                    if (!secaoDiv) return;
                    const className = Array.from(secaoDiv.classList).find(c => c.startsWith("cardapio-"));
                    if (!className) return;
                    const secaoNome = className.replace("cardapio-", "");

                    if (cardapioAtual && cardapioAtual[secaoNome] && Array.isArray(cardapioAtual[secaoNome].itens)) {
                        const itemIndex = cardapioAtual[secaoNome].itens.findIndex(item => item.nome === nomeProduto);
                        if (itemIndex > -1) {
                            cardapioAtual[secaoNome].itens[itemIndex].preco = novoPreco;
                            salvarCardapio(cardapioAtual);
                        }
                    }
                };
                btn.addEventListener("click", confirmUpdate);
                input.addEventListener("keypress", e => { if (e.key === "Enter") { e.preventDefault(); confirmUpdate(); } });
                input.addEventListener("blur", e => {
                    setTimeout(() => {
                        if (precoSpan.querySelector('input') && !precoSpan.contains(document.activeElement)) {
                            precoSpan.textContent = precoAtual;
                        }
                    }, 100);
                });
            }
        });
    }

    // NEW FUNCTION: REMOVE EMPTY SECTIONS
    function removerSecoesVazias() {
        const cardapioAtual = JSON.parse(localStorage.getItem("cardapio"));
        if (!cardapioAtual) return false; // No cardapio, nothing to do

        let algumaSecaoFoiRemovida = false;
        const nomesDasSecoes = Object.keys(cardapioAtual); // Get keys before potentially modifying

        for (const secaoNome of nomesDasSecoes) {
            const secao = cardapioAtual[secaoNome];
            // A section is considered empty if it has no items.
            // Additional properties like imagemTopo, imagemRodape, icone do not prevent deletion if items are empty.
            if (secao && Array.isArray(secao.itens) && secao.itens.length === 0) {
                delete cardapioAtual[secaoNome];
                algumaSecaoFoiRemovida = true;
                console.log(`Seção "${secaoNome}" removida automaticamente por estar vazia.`);
            }
        }

        if (algumaSecaoFoiRemovida) {
            salvarCardapio(cardapioAtual);
            // We don't call gerarCardapio here directly.
            // The function that calls removerSecoesVazias should decide if a re-render is needed.
            // Or, we can make this function also re-render if it made changes.
            // For simplicity, let's make it re-render.
            gerarCardapio(cardapioAtual);
            return true; // Indicates that changes were made and cardapio re-rendered
        }
        return false; // Indicates no changes were made
    }


    // ITEM DELETION FUNCTIONALITY
    function habilitarExclusaoItem() {
        const cardapioContainer = document.getElementById("cardapio");
        if (!cardapioContainer) return;

        // Criar o modal dinamicamente
        const modal = document.createElement("div");
        modal.id = "modal-confirmacao";
        modal.style.cssText = `
        display: none;
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        font-size:30px;
        z-index: 1000;
        justify-content: center;
        align-items: center;
    `;

        modal.innerHTML = `
        <div style="
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px black;
            max-width: 300px;
            text-align: center;
            background: #61bc65;
            color:white;
        ">
            <p id="modal-mensagem">Tem certeza que deseja excluir este item?</p>
            <button id="btn-confirmar" style="margin-right: 10px; margin-top: 10px; background: #37b118;font-size: 25px;color: white;border-radius: 10px;padding: 5px;">Sim</button>
            <button id="btn-cancelar" style="margin-right: 10px; background: #37b118;font-size: 25px;color: white;border-radius: 10px;padding: 5px;">Cancelar</button>
        </div>
    `;
        document.body.appendChild(modal);

        const mensagem = document.getElementById("modal-mensagem");
        const btnConfirmar = document.getElementById("btn-confirmar");
        const btnCancelar = document.getElementById("btn-cancelar");

        let produtoClicado = null;

        cardapioContainer.addEventListener("click", function (e) {
            if (e.target.classList.contains("produto")) {
                produtoClicado = e.target;
                const nomeProduto = produtoClicado.textContent.trim();
                mensagem.textContent = `Tem certeza que deseja excluir o item "${nomeProduto}"?`;
                modal.style.display = "flex";
            }
        });

        btnCancelar.addEventListener("click", () => {
            modal.style.display = "none";
            produtoClicado = null;
        });

        btnConfirmar.addEventListener("click", () => {
            if (!produtoClicado) return;

            const nomeProduto = produtoClicado.textContent.trim();
            const cardapioAtual = JSON.parse(localStorage.getItem("cardapio"));
            if (!cardapioAtual) return;

            const secaoDiv = produtoClicado.closest(".cardapios");
            if (!secaoDiv) return;

            const className = Array.from(secaoDiv.classList).find(c => c.startsWith("cardapio-"));
            if (!className) return;

            const secaoNome = className.replace("cardapio-", "");

            if (cardapioAtual[secaoNome] && Array.isArray(cardapioAtual[secaoNome].itens)) {
                cardapioAtual[secaoNome].itens = cardapioAtual[secaoNome].itens.filter(
                    item => item.nome !== nomeProduto
                );

                salvarCardapio(cardapioAtual);

                const secaoRemovida = removerSecoesVazias();
                if (!secaoRemovida) {
                    gerarCardapio(cardapioAtual);
                }
            }

            modal.style.display = "none";
            produtoClicado = null;
        });
    }



    // FORM TO ADD NEW ITEMS/SECTIONS
    function mostrarFormulario() {
        if (document.getElementById("formAdicionarItem")) {
            document.getElementById("formAdicionarItem").remove();
        }
        const form = document.createElement("form");
        form.id = "formAdicionarItem";
        form.innerHTML = `
            <h3>Adicionar Item ao Cardápio</h3>

            
            <div><label>Nome da Seção <input type="text" id="formSecao" required></label></div>

            <div><label>Nome do Item <input type="text" id="formItemNome" required></label></div>

            <div><label>Preço do Item <input type="text" id="formItemPreco" required></label></div>

            <div id="formExtrasDiv" style=";"></div>
            <div style="margin-top:15px;">
                <button type="submit" id="additem_carp">Adicionar Item</button>
                <button type="button" id="cancelAddItem">Cancelar</button>
            </div>
        `;
        document.body.appendChild(form);
        form.querySelector("#formItemNome").focus();

        const secaoInput = form.querySelector("#formSecao");
        const extrasDiv = form.querySelector("#formExtrasDiv");

        const updateExtraFields = () => {
            const secao = secaoInput.value.trim().toLowerCase().replace(/\s+/g, '-');
            const cardapioAtual = JSON.parse(localStorage.getItem("cardapio")) || {};
            if (secao && !cardapioAtual[secao]) {
                extrasDiv.innerHTML = `
                    <p><strong>Configurações para nova seção "${secao}":</strong></p>
                    <div><label>Imagem esquerda <input type="text" id="formImagemTopo"></label></div>
                    <div><label>Imagem direita <input type="text" id="formImagemRodape"></label></div>
                    <div><label>Ícone da Seção <input type="text" id="formIcone"></label></div>`;
            } else { extrasDiv.innerHTML = ""; }
        };
        secaoInput.addEventListener("input", updateExtraFields);
        updateExtraFields();

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            let secao = form.querySelector("#formSecao").value.trim().toLowerCase().replace(/\s+/g, '-');
            const nome = form.querySelector("#formItemNome").value.trim();
            let preco = form.querySelector("#formItemPreco").value.trim();

            if (!secao || !nome || !preco) { alert("Por favor, preencha Seção, Nome do Item e Preço."); return; }
            if (!preco.toLowerCase().startsWith("r$")) preco = "R$ " + preco;

            const cardapioAtual = JSON.parse(localStorage.getItem("cardapio")) || {};
            if (!cardapioAtual[secao]) {
                const imagemTopoInput = form.querySelector("#formImagemTopo");
                const imagemRodapeInput = form.querySelector("#formImagemRodape");
                const iconeInput = form.querySelector("#formIcone");
                cardapioAtual[secao] = {
                    imagemTopo: imagemTopoInput ? imagemTopoInput.value.trim() : "",
                    imagemRodape: imagemRodapeInput ? imagemRodapeInput.value.trim() : "",
                    icone: iconeInput ? iconeInput.value.trim() : "",
                    itens: []
                };
            }
            cardapioAtual[secao].itens.push({ nome, preco });
            salvarCardapio(cardapioAtual);
            gerarCardapio(cardapioAtual);
            form.remove();
        });
        form.querySelector("#cancelAddItem").addEventListener("click", () => form.remove());
    }

    // --- INITIALIZATION SEQUENCE ---
    slider();
    inicializarCardapio();
    carregarCardapio(); // Loads and generates cardapio from localStorage
    removerSecoesVazias(); // Clean up any empty sections on initial load (and re-renders if needed)
    editarPreco();
    habilitarExclusaoItem(); // Enables item deletion, which also calls removerSecoesVazias

    const botaoAdicionar = document.getElementById("botaoclickeaqui");
    if (botaoAdicionar) {
        botaoAdicionar.addEventListener("click", mostrarFormulario);
    }
}
inicio();

function historico() {

    /* ---------- helpers ---------- */
    const BRtoISO = br => {           // "dd/mm/aaaa" -> "aaaa-mm-dd"
        if (!br || typeof br !== 'string' || !br.includes('/')) return ""; // Adiciona checagem
        const parts = br.split('/');
        if (parts.length !== 3) return ""; // Adiciona checagem
        const [d, m, y] = parts;
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    };

    const matchFiltroDia = (pedidoData, filtroISO) => {
        if (!filtroISO) return true;    // sem filtro
        return BRtoISO(pedidoData) === filtroISO;
    };

    const mesaContemItem = (pedidos, itemFiltro) => {
        if (!itemFiltro) return true;
        const termo = itemFiltro.trim().toLowerCase();
        return pedidos.some(p => p.item && p.item.toLowerCase().includes(termo)); // Checa se p.item existe
    };

    /* ---------- render principal ---------- */
    function renderHistorico() {
        const container = document.getElementById('container-historico');
        if (!container) {
            console.error("Elemento 'container-historico' não encontrado.");
            return;
        }
        container.innerHTML = '';

        const selectMesEl = document.getElementById('select-mes');
        const inputDiaEl = document.getElementById('input-dia');
        const inputItemEl = document.getElementById('input-item');

        if (!selectMesEl || !inputDiaEl || !inputItemEl) {
            console.error("Elementos de filtro do histórico não encontrados.");
            return;
        }

        const mesSel = parseInt(selectMesEl.value, 10);
        const diaISO = inputDiaEl.value; // "" ou "yyyy-mm-dd"
        const itemSel = inputItemEl.value;

        const histRaw = JSON.parse(localStorage.getItem('historico')) || {};
        // Verifica se histRaw é um objeto antes de usar Object.entries
        const histArr = Array.isArray(histRaw)
            ? histRaw // Caso já seja um array (pouco provável pelo seu código de salvar)
            : (typeof histRaw === 'object' && histRaw !== null)
                ? Object.entries(histRaw).map(([chave, pedidos]) => ({ chave, pedidos }))
                : []; // Se não for objeto, retorna array vazio

        if (histArr.length === 0) {
            container.innerHTML = '<p>Nenhum histórico encontrado.</p>';
            return;
        }

        let encontrouResultados = false;

        histArr.forEach(({ chave, pedidos }) => {
            if (!Array.isArray(pedidos)) { // Sanity check
                console.warn(`Pedidos para a chave "${chave}" não é um array.`);
                return;
            }

            /* filtra pedidos pelo mês e dia */
            const pedidosFiltrados = pedidos.filter(p => {
                if (!p || !p.data || typeof p.data !== 'string' || !p.data.includes('/')) return false; // Checagem robusta de p.data
                const parts = p.data.split('/');
                if (parts.length !== 3) return false;
                const [, mes] = parts;
                return parseInt(mes, 10) === mesSel && matchFiltroDia(p.data, diaISO);
            });

            if (!pedidosFiltrados.length) return;
            if (!mesaContemItem(pedidosFiltrados, itemSel)) return;

            encontrouResultados = true; // Marcar que encontrou resultados para os filtros atuais

            /* ----- monta bloco ----- */
            const sessao = document.createElement('div');
            sessao.classList.add('sessao-historico');

            const cima = document.createElement('div');
            cima.classList.add('cima-historico-item');
            sessao.appendChild(cima);

            const titulo = document.createElement('h3');
            titulo.textContent = chave;
            cima.appendChild(titulo);

            let totalMesa = 0;
            const detalhesComandaParaImpressao = [];

            pedidosFiltrados.forEach(p => {
                // p.valorItem é a chave correta (string "XX.YY")
                // p.quantidade é a chave correta (NÚMERO)
                const precoStrOriginal = p.valorItem ?? '0.00'; // p.valorItem deve ser string "XX.YY"
                // const qtd = parseFloat(p.quantidade.replace(',', '.')) || 0; // << LINHA COM BUG
                const qtd = p.quantidade; // << CORREÇÃO: p.quantidade JÁ É UM NÚMERO

                // precoStrOriginal já deve estar no formato "XX.YY" (ponto como decimal)
                // Não precisa de .replace(/\./g, '') se o formato for consistente
                const precoNum = parseFloat(precoStrOriginal) || 0;

                if (isNaN(qtd) || isNaN(precoNum)) {
                    console.warn(`Dados inválidos no histórico para item: ${p.item}. Qtd: ${p.quantidade}, Preço: ${p.valorItem}`);
                    return; // Pula este item se os dados forem inválidos
                }

                totalMesa += qtd * precoNum;

                const linha = document.createElement('div');
                linha.classList.add('linha-historico');
                // Formata o preço para exibição com vírgula
                const precoExibicao = `R$ ${parseFloat(precoStrOriginal).toFixed(2).replace('.', ',')}`;
                linha.innerHTML = `
                    <span><strong>${qtd}x</strong> ${p.item || 'Item não especificado'}</span>
                    <span>${p.data || ''} ${p.hora || ''}</span>
                    <span>${precoExibicao}</span>`;
                cima.appendChild(linha);

                // Para impressão, usamos o precoStrOriginal (que deve ser "XX.YY")
                // mas formatamos para vírgula se a função de impressão esperar isso.
                // A função imprimirNotaFiscal parece esperar R$ com vírgula.
                detalhesComandaParaImpressao.push({ qtd, item: p.item, precoStr: precoExibicao });
            });

            /* rodapé */
            const baixo = document.createElement('div');
            baixo.classList.add('baixo-historico-item');
            sessao.appendChild(baixo);

            const totalDiv = document.createElement('div');
            totalDiv.classList.add('total-historico');
            totalDiv.innerHTML = `<strong>Total da mesa:</strong> R$ ${totalMesa.toFixed(2).replace('.', ',')}`;
            baixo.appendChild(totalDiv);

            /* botão imprimir */
            const btn = document.createElement('button');
            btn.textContent = 'Imprimir comanda';
            btn.classList.add('btn-imprimir');
            btn.onclick = () => imprimirNotaFiscal(chave, detalhesComandaParaImpressao, totalMesa);
            baixo.appendChild(btn);

            container.appendChild(sessao);
        });

        if (!encontrouResultados && container.innerHTML === '') { // Se não adicionou nenhuma sessão e o container está vazio
            container.innerHTML = '<p>Nenhum registro encontrado para os filtros aplicados.</p>';
        }
    }

    /* ---------- impressão estilo nota ---------- */
    function imprimirNotaFiscal(chave, itens, total) {
        const win = window.open('', '_blank', 'width=300,height=600,scrollbars=yes,resizable=yes');
        if (!win || win.closed || typeof win.closed == 'undefined') {
            alert("Por favor, habilite pop-ups para este site.");
            return;
        }
        win.document.write(`
        <html><head><title>${chave.replace(/</g, "<").replace(/>/g, ">")}</title>
        <style>
          body { font-family: monospace; width: calc(100% - 12px); max-width: 58mm; margin: 0 auto; padding: 6px; font-size: 10pt; line-height: 1.4; }
          h2 { text-align: center; font-size: 12pt; margin: 8px 0; }
          .item-linea { display: flex; justify-content: space-between; margin: 3px 0; }
          .item-linea span:first-child { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 5px; }
          .item-linea span:last-child { white-space: nowrap; }
          .total-linea { margin-top: 10px; border-top: 1px dashed #000; padding-top: 6px; font-weight: bold; display: flex; justify-content: space-between; }
          hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
          @media print {
            body { font-size: 9pt; width: 100%; max-width: none; padding: 0; } /* Ajustes para impressão real */
            h2 { font-size: 11pt; }
          }
        </style></head><body>
        <h2>${chave.replace(/</g, "<").replace(/>/g, ">")}</h2>`);

        itens.forEach(it => {
            // 'it.precoStr' já vem formatado como "R$ XX,YY" da função renderHistorico
            win.document.write(`<div class="item-linea"><span>${it.qtd}x ${it.item ? it.item.replace(/</g, "<").replace(/>/g, ">") : ''}</span><span>${it.precoStr}</span></div>`);
        });

        win.document.write(`<div class="total-linea"><span>Total:</span><span>R$ ${total.toFixed(2).replace('.', ',')}</span></div>`);
        win.document.write('</body></html>');
        win.document.close();
        // Adicionar um pequeno delay antes de imprimir pode ajudar em alguns navegadores
        setTimeout(() => {
            win.focus();
            win.print();
            // win.close(); // Opcional: fechar após imprimir, mas pode ser abrupto para o usuário
        }, 250);
    }

    /* ---------- listeners ---------- */
    const btnFiltrarEl = document.getElementById('btn-filtrar');
    const btnLimparEl = document.getElementById('btn-limpar');
    const selectMesElListener = document.getElementById('select-mes');

    if (btnFiltrarEl) btnFiltrarEl.onclick = renderHistorico;
    if (btnLimparEl) {
        btnLimparEl.onclick = () => {
            const inputDiaElListener = document.getElementById('input-dia');
            const inputItemElListener = document.getElementById('input-item');
            if (inputDiaElListener) inputDiaElListener.value = '';
            if (inputItemElListener) inputItemElListener.value = '';
            renderHistorico();
        };
    }
    if (selectMesElListener) selectMesElListener.onchange = renderHistorico;

    /* mês atual default */
    const selectMesDefaultEl = document.getElementById('select-mes');
    if (selectMesDefaultEl) {
        selectMesDefaultEl.value = new Date().getMonth() + 1;
    }

    renderHistorico(); // primeira renderização
}
historico();



function mesas() {

    document.addEventListener('DOMContentLoaded', () => {
        // ----- VARIÁVEIS GLOBAIS E ELEMENTOS DO DOM -----
        const inputItensDiv = document.getElementById('input-itens');
        const mesasContainer = document.getElementById('mesas-atuais');
        const btnAdicionarComanda = document.getElementById('button-adicionar-comanda-mesa');
        const inputMesaEl = document.getElementById('input-mesa');
        const inputQtdEl = document.getElementById('input-qtd');

        const placeholderTextOriginal = 'Clique para selecionar um item';
        let cardapioDataGlobal = {};
        let cardapioAbertoNoInput = false; // Para o controle do dropdown de itens
        let cardapioConstruidoNoInput = false;
        let placeholderElGlobal; // Referência ao span do placeholder no input de itens
        let cardapioContentElGlobal; // Referência ao container de conteúdo do cardápio no input

        // ----- FUNÇÕES DO CARDÁPIO (para input-itens) -----
        function carregarCardapioData() {
            // Exemplo para teste (se o localStorage estiver vazio):
            if (!localStorage.getItem('cardapio')) {
                localStorage.setItem('cardapio', JSON.stringify({
                    "Bebidas": { itens: [{ nome: "Refrigerante", preco: "5.50" }, { nome: "Suco Laranja", preco: "7.00" }] },
                    "Lanches": { itens: [{ nome: "X-Burger", preco: "18.00" }, { nome: "Misto Quente", preco: "R$ 12,50" }] },
                    "Pratos": { itens: [{ nome: "PF Simples", preco: "25" }, { nome: "Salada Top", preco: "22.00" }] }
                }));
            }
            const cardapioDataRaw = localStorage.getItem('cardapio');
            cardapioDataGlobal = cardapioDataRaw ? JSON.parse(cardapioDataRaw) : {};

            if (typeof cardapioDataGlobal !== 'object' || cardapioDataGlobal === null) {
                console.warn('Dados do cardápio (com preços) não encontrados ou inválidos no localStorage.');
                cardapioDataGlobal = {};
            }
        }

        function construirCardapioInternoNoInput() {
            if (!cardapioContentElGlobal) return;
            cardapioContentElGlobal.innerHTML = "";

            if (Object.keys(cardapioDataGlobal).length === 0) {
                cardapioContentElGlobal.innerHTML = "<p>Cardápio não disponível.</p>";
                return;
            }

            for (const secaoNome in cardapioDataGlobal) {
                const itens = cardapioDataGlobal[secaoNome]?.itens || [];
                const secaoIdSafe = `secao-${secaoNome.replace(/\s+/g, '-').toLowerCase()}`;
                const secaoDiv = document.createElement('div');
                secaoDiv.className = 'secao';
                const headerDiv = document.createElement('div');
                headerDiv.className = 'secao-header';
                headerDiv.dataset.secaoId = secaoIdSafe;
                headerDiv.innerHTML = `<span class="arrow">▶</span> ${secaoNome.toUpperCase()}`;
                secaoDiv.appendChild(headerDiv);
                const itensContainerDiv = document.createElement('div');
                itensContainerDiv.className = 'secao-itens-container';
                itensContainerDiv.style.display = 'none';
                itensContainerDiv.dataset.containerFor = secaoIdSafe;
                itens.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'item';
                    itemDiv.textContent = item.nome;
                    itemDiv.dataset.value = item.nome;
                    itensContainerDiv.appendChild(itemDiv);
                });
                secaoDiv.appendChild(itensContainerDiv);
                cardapioContentElGlobal.appendChild(secaoDiv);
            }
            cardapioConstruidoNoInput = true;
        }

        function setupCardapioDivParaInput() {
            if (!inputItensDiv) {
                console.error("Elemento com id 'input-itens' não encontrado para o cardápio.");
                return;
            }
            inputItensDiv.innerHTML = '';

            placeholderElGlobal = document.createElement('span');
            placeholderElGlobal.className = 'cardapio-placeholder';
            placeholderElGlobal.textContent = placeholderTextOriginal;
            inputItensDiv.appendChild(placeholderElGlobal);

            cardapioContentElGlobal = document.createElement('div');
            cardapioContentElGlobal.className = 'cardapio-content';
            cardapioContentElGlobal.style.display = 'none';
            inputItensDiv.appendChild(cardapioContentElGlobal);

            inputItensDiv.addEventListener('click', (e) => {
                if (e.target.closest('.secao-header') || e.target.closest('.item')) return;
                cardapioAbertoNoInput = !cardapioAbertoNoInput;
                if (cardapioAbertoNoInput) {
                    if (!cardapioConstruidoNoInput) construirCardapioInternoNoInput();
                    cardapioContentElGlobal.style.display = 'block';
                    if (placeholderElGlobal) placeholderElGlobal.style.display = 'none';
                } else {
                    cardapioContentElGlobal.style.display = 'none';
                    if (placeholderElGlobal) placeholderElGlobal.style.display = 'block';
                }
            });

            cardapioContentElGlobal.addEventListener('click', (e) => {
                const secaoHeader = e.target.closest('.secao-header');
                const itemClicado = e.target.closest('.item');
                if (secaoHeader) {
                    const secaoId = secaoHeader.dataset.secaoId;
                    const itensContainer = cardapioContentElGlobal.querySelector(`.secao-itens-container[data-container-for="${secaoId}"]`);
                    const arrow = secaoHeader.querySelector('.arrow');
                    if (itensContainer) {
                        const isExpanded = itensContainer.style.display !== 'none';
                        itensContainer.style.display = isExpanded ? 'none' : 'block';
                        if (arrow) arrow.textContent = isExpanded ? '▶' : '▼';
                    }
                } else if (itemClicado) {
                    const valorSelecionado = itemClicado.dataset.value;
                    if (placeholderElGlobal) {
                        placeholderElGlobal.textContent = valorSelecionado;
                        placeholderElGlobal.style.fontWeight = 'bold';
                    }
                    cardapioContentElGlobal.style.display = 'none';
                    if (placeholderElGlobal) placeholderElGlobal.style.display = 'block';
                    cardapioAbertoNoInput = false;
                }
            });
        }

        function buscarItemNoCardapio(nomeItem) {
            for (const secaoNome in cardapioDataGlobal) {
                const secao = cardapioDataGlobal[secaoNome];
                if (secao && secao.itens) {
                    const itemEncontrado = secao.itens.find(item => item.nome === nomeItem);
                    if (itemEncontrado) return itemEncontrado;
                }
            }
            console.warn(`Item "${nomeItem}" não encontrado no cardápio para buscar preço.`);
            return null;
        }

        // ----- FUNÇÕES DAS MESAS (exibir, acertar, remover) -----
        function removerMesa(mesaNome) {
            const mesas = JSON.parse(localStorage.getItem('mesas')) || {};
            const pedidosMesa = mesas[mesaNome] || [];
            const historicoRaw = JSON.parse(localStorage.getItem('historico')) || {};
            const agora = new Date();
            const dataStr = agora.toLocaleDateString('pt-BR');
            const horaStr = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const sessao = pedidosMesa.map(pedido => ({
                data: dataStr,
                hora: horaStr,
                quantidade: pedido.quantidade,
                item: pedido.item,
                valorItem: pedido.precoUnitario
            }));
            const chaveSessao = `${mesaNome} – ${dataStr} ${horaStr}`;
            historicoRaw[chaveSessao] = sessao;
            localStorage.setItem('historico', JSON.stringify(historicoRaw));
            delete mesas[mesaNome];
            localStorage.setItem('mesas', JSON.stringify(mesas));
            exibirMesas();
        }

        function abrirAcerto(mesaNome, totalInicial, mesaDivParaAcerto) {
            mesaDivParaAcerto.innerHTML = '';
            mesaDivParaAcerto.style.justifyContent = 'space-between';
            mesaDivParaAcerto.style.textAlign = 'center';

            let saldo = totalInicial;

            const totalTxt = document.createElement('div');
            totalTxt.classList.add('total-pedido');
            totalTxt.textContent = `Total restante: R$ ${saldo.toFixed(2).replace('.', ',')}`;

            const inputPag = document.createElement('input');
            inputPag.classList.add('input-troco');
            inputPag.type = 'number';
            inputPag.min = '0';
            inputPag.step = '0.01';
            inputPag.placeholder = 'Valor pago';

            const btnPagar = document.createElement('button');
            btnPagar.classList.add('btn-pagar');
            btnPagar.innerHTML = `<div>Registrar pagamento</div><img src="./imagens/sistema/dinheiro.png" alt="Pagar">`;

            const btnExcluir = document.createElement('button');
            btnExcluir.classList.add('btn-excluir');
            btnExcluir.innerHTML = `<div>Excluir mesa</div><img src="./imagens/sistema/excluir.png" alt="Excluir">`;

            const btnDarTroco = document.createElement('button');
            btnDarTroco.classList.add('btn-troco');
            btnDarTroco.innerHTML = `<div>Dar troco e Fechar</div><img src="./imagens/sistema/dinheiro.png" alt="Troco">`;

            btnPagar.addEventListener('click', () => {
                const pagoStr = inputPag.value.replace(',', '.');
                const pago = parseFloat(pagoStr);
                if (isNaN(pago) || pago <= 0) {
                    alert("Valor pago inválido.");
                    inputPag.focus();
                    return;
                }
                saldo -= pago;
                inputPag.value = '';
                if (saldo > 0.009) {
                    totalTxt.textContent = `Total restante: R$ ${saldo.toFixed(2).replace('.', ',')}`;
                } else if (Math.abs(saldo) < 0.009) {
                    removerMesa(mesaNome);
                } else {
                    const troco = Math.abs(saldo).toFixed(2).replace('.', ',');
                    totalTxt.textContent = `Devolva R$ ${troco} ao cliente`;
                    btnPagar.style.display = 'none';
                    btnExcluir.style.display = 'none';
                    inputPag.style.display = 'none';
                    mesaDivParaAcerto.appendChild(btnDarTroco);
                }
            });

            btnDarTroco.addEventListener('click', () => removerMesa(mesaNome));
            btnExcluir.addEventListener('click', () => removerMesa(mesaNome));

            mesaDivParaAcerto.appendChild(totalTxt);
            mesaDivParaAcerto.appendChild(inputPag);
            mesaDivParaAcerto.appendChild(btnPagar);
            mesaDivParaAcerto.appendChild(btnExcluir);
        }

        function exibirMesas() {
            if (!mesasContainer) {
                console.error("Elemento 'mesas-atuais' não encontrado para exibir as mesas.");
                return;
            }
            const mesasData = JSON.parse(localStorage.getItem('mesas')) || {};
            mesasContainer.innerHTML = '';

            if (Object.keys(mesasData).length === 0) {
                mesasContainer.innerHTML = '<p>Nenhuma mesa comanda aberta.</p>';
                return;
            }

            for (const mesaNome in mesasData) {
                const pedidosDaMesa = mesasData[mesaNome];
                let totalDaMesa = 0;

                pedidosDaMesa.forEach(pedido => {
                    // const qtd = parseInt(pedido.quantidade); // << LINHA ORIGINAL
                    const qtd = pedido.quantidade; // << CORREÇÃO: pedido.quantidade JÁ É UM NÚMERO
                    // parseInt aqui é redundante, mas não prejudica se já for número.
                    // O problema era o .replace() que não existe para números.

                    const valor = parseFloat(pedido.precoUnitario); // precoUnitario é string "XX.YY"
                    if (!isNaN(qtd) && !isNaN(valor)) {
                        totalDaMesa += qtd * valor;
                    } else {
                        console.warn(`Item com dados inválidos na mesa ${mesaNome}: Qtd=${pedido.quantidade}, Preço=${pedido.precoUnitario}`);
                    }
                });

                const mesaDiv = document.createElement('div');
                mesaDiv.classList.add('mesas-nmr');
                mesaDiv.innerHTML = `
                    <div>Mesa ${mesaNome}</div>
                    <img src="./imagens/sistema/prato.png" alt="Prato">
                `;

                const listaPedidosDiv = document.createElement('div');
                listaPedidosDiv.classList.add('pedido-lista');
                listaPedidosDiv.innerHTML = `
                    <div class="pedido-header">
                        <div class="qtd-header">Qtd</div>
                        <div class="item-header">Item</div>
                        <div class="preço-header">Preço Un.</div>
                    </div>
                `;

                pedidosDaMesa.forEach(pedido => {
                    // const quantidadeDoPedido = parseInt(pedido.quantidade); // Também redundante se já é número
                    const quantidadeDoPedido = pedido.quantidade; // Usar diretamente
                    const precoUnitarioDoPedido = parseFloat(pedido.precoUnitario);

                    const pedidoEl = document.createElement('div');
                    pedidoEl.classList.add('pedido');
                    pedidoEl.innerHTML = `
                        <div class="qtd-pedido">${quantidadeDoPedido}</div>
                        <div class="item-pedido">${pedido.item}</div>
                        <div class="preço-pedido">R$ ${precoUnitarioDoPedido.toFixed(2).replace('.', ',')}</div>
                    `;
                    listaPedidosDiv.appendChild(pedidoEl);
                });
                mesaDiv.appendChild(listaPedidosDiv);

                const totalDiv = document.createElement('div');
                totalDiv.classList.add('total-pedido');
                const valorFormatadoTotal = `R$ ${totalDaMesa.toFixed(2).replace('.', ',')}`;
                totalDiv.textContent = valorFormatadoTotal;

                totalDiv.addEventListener('mouseover', () => { totalDiv.textContent = 'ACERTAR'; });
                totalDiv.addEventListener('mouseout', () => { totalDiv.textContent = valorFormatadoTotal; });
                totalDiv.addEventListener('click', () => abrirAcerto(mesaNome, totalDaMesa, mesaDiv));

                mesaDiv.appendChild(totalDiv);
                mesasContainer.appendChild(mesaDiv);
            }
        }

        // ----- LÓGICA PARA ADICIONAR COMANDA -----
        if (btnAdicionarComanda) {
            btnAdicionarComanda.addEventListener('click', () => {
                if (!inputMesaEl || !inputQtdEl || !placeholderElGlobal) {
                    console.error('Elementos do formulário de adição não encontrados.');
                    return;
                }
                const mesaNome = inputMesaEl.value.trim();
                const quantidadeStr = inputQtdEl.value.trim();
                const nomeItemSelecionado = placeholderElGlobal.textContent.trim();

                if (!mesaNome) { alert('Informe o nome/número da mesa.'); inputMesaEl.focus(); return; }
                if (!quantidadeStr || isNaN(parseInt(quantidadeStr)) || parseInt(quantidadeStr) <= 0) {
                    alert('Informe uma quantidade válida.'); inputQtdEl.focus(); return;
                }
                const quantidade = parseInt(quantidadeStr); // Converte para número AQUI

                if (!nomeItemSelecionado || nomeItemSelecionado === placeholderTextOriginal) {
                    alert('Selecione um item do cardápio.');
                    if (inputItensDiv && !cardapioAbertoNoInput) inputItensDiv.click();
                    return;
                }

                const itemDoCardapio = buscarItemNoCardapio(nomeItemSelecionado);
                if (!itemDoCardapio || typeof itemDoCardapio.preco === 'undefined') {
                    alert(`Preço para "${nomeItemSelecionado}" não encontrado. Verifique o cadastro.`);
                    if (placeholderElGlobal) {
                        placeholderElGlobal.textContent = placeholderTextOriginal;
                        placeholderElGlobal.style.fontWeight = 'normal';
                    }
                    return;
                }

                let precoUnitarioLimpo = String(itemDoCardapio.preco).replace(/R\$\s*/g, "").trim().replace(",", ".");
                if (isNaN(parseFloat(precoUnitarioLimpo))) {
                    alert(`Preço "${itemDoCardapio.preco}" para "${nomeItemSelecionado}" é inválido.`);
                    return;
                }
                precoUnitarioLimpo = parseFloat(precoUnitarioLimpo).toFixed(2); // Salva como string "XX.YY"

                let mesasData = JSON.parse(localStorage.getItem('mesas')) || {};
                const novoPedido = {
                    quantidade: quantidade, // SALVA COMO NÚMERO
                    item: nomeItemSelecionado,
                    precoUnitario: precoUnitarioLimpo
                };

                if (mesasData[mesaNome]) {
                    mesasData[mesaNome].push(novoPedido);
                } else {
                    mesasData[mesaNome] = [novoPedido];
                }
                localStorage.setItem('mesas', JSON.stringify(mesasData));
                console.log(`Comanda: ${mesaNome}, ${quantidade}x ${nomeItemSelecionado} (R$ ${precoUnitarioLimpo})`);

                inputMesaEl.value = '';
                inputQtdEl.value = '';
                if (placeholderElGlobal) {
                    placeholderElGlobal.textContent = placeholderTextOriginal;
                    placeholderElGlobal.style.fontWeight = 'normal';
                }
                exibirMesas();
            });
        } else {
            console.error("Botão 'button-adicionar-comanda-mesa' não encontrado.");
        }

        // ----- INICIALIZAÇÃO -----
        carregarCardapioData();
        setupCardapioDivParaInput();
        exibirMesas();
    });
}
mesas();







