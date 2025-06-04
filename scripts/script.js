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

        cardapioContainer.addEventListener("dblclick", function (e) {
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


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicio);
} else {
    inicio();
}





function mesas() {




    function exibirMesas() {
        /*----------- Render das mesas -----------*/
        const mesasData = JSON.parse(localStorage.getItem('mesas')) || {};
        const mesasContainer = document.getElementById('mesas-atuais');
        mesasContainer.innerHTML = '';

        for (const mesaNome in mesasData) {
            /* Total da mesa */
            let total = 0;
            mesasData[mesaNome].forEach(({ quantidade, preco }) => {
                const qtd = parseFloat(quantidade.replace(',', '.'));
                const valor = parseFloat(preco.replace(/\./g, '').replace(',', '.'));
                if (!isNaN(qtd) && !isNaN(valor)) total += qtd * valor;
            });

            /* Elemento da mesa */
            const mesaDiv = document.createElement('div');
            mesaDiv.classList.add('mesas-nmr');
            mesaDiv.innerHTML = `
            <div>mesa ${mesaNome}</div>
            <img src="./imagens/sistema/prato.png" alt="">
        `;

            /* Lista de pedidos */
            const lista = document.createElement('div');
            lista.classList.add('pedido-lista');
            lista.innerHTML = `
            <div class="pedido-header">
                <div class="qtd-header">qtd</div>
                <div class="item-header">item</div>
                <div class="preço-header">preço</div>
            </div>
        `;
            mesasData[mesaNome].forEach(({ quantidade, itens, preco }) => {
                const pedido = document.createElement('div');
                pedido.classList.add('pedido');
                pedido.innerHTML = `
                <div class="qtd-pedido">${quantidade}</div>
                <div class="item-pedido">${itens}</div>
                <div class="preço-pedido">${preco}</div>
            `;
                lista.appendChild(pedido);
            });
            mesaDiv.appendChild(lista);

            /* Rodapé com total */
            const totalDiv = document.createElement('div');
            totalDiv.classList.add('total-pedido');
            totalDiv.textContent = `R$:${total.toFixed(2).replace('.', ',')}`;

            const valorFormatado = `R$:${total.toFixed(2).replace('.', ',')}`;
            totalDiv.textContent = valorFormatado;

            totalDiv.addEventListener('mouseover', () => {
                totalDiv.innerHTML = 'acertar';
            });

            totalDiv.addEventListener('mouseout', () => {
                totalDiv.innerHTML = valorFormatado;
            });


            mesaDiv.appendChild(totalDiv);

            /* Clique → abrir painel de acerto */
            totalDiv.addEventListener('click', () => {
                mesaDiv.style.justifyContent = 'space-between';
                mesaDiv.style.textAlign = 'center';
                abrirAcerto(mesaNome, total, mesaDiv);
            });

            mesasContainer.appendChild(mesaDiv);
        }

        /*----------- Painel de acerto -----------*/
        function abrirAcerto(mesaNome, totalInicial, mesaDiv) {
            mesaDiv.innerHTML = '';
            let saldo = totalInicial;

            const totalTxt = document.createElement('div');
            totalTxt.classList.add('total-pedido');
            totalTxt.textContent = `Total restante: R$ ${saldo.toFixed(2).replace('.', ',')}`;

            const inputPag = document.createElement('input');
            inputPag.classList.add('input-troco');
            inputPag.type = 'number';
            inputPag.min = '0';
            inputPag.placeholder = 'Valor pago';

            const btnPagar = document.createElement('button');
            btnPagar.classList.add('btn-pagar');
            btnPagar.innerHTML = `
            <div>Registrar pagamento</div>
            <img src="./imagens/sistema/dinheiro.png" alt="">
        `;

            const btnExcluir = document.createElement('button');
            btnExcluir.classList.add('btn-excluir');
            btnExcluir.innerHTML = `
            <div>Excluir mesa</div>
            <img src="./imagens/sistema/excluir.png" alt="">
        `;

            const btnDarTroco = document.createElement('button');
            btnDarTroco.classList.add('btn-troco');
            btnDarTroco.innerHTML = `
            <div>Dar troco</div>
            <img src="./imagens/sistema/dinheiro.png" alt="">
        `;

            btnPagar.addEventListener('click', () => {
                const pago = parseFloat(inputPag.value.replace(',', '.'));
                if (isNaN(pago) || pago <= 0) return;

                saldo -= pago;
                inputPag.value = '';

                if (saldo > 0) {
                    totalTxt.textContent = `Total restante: R$ ${saldo.toFixed(2).replace('.', ',')}`;
                } else if (saldo === 0) {
                    removerMesa(mesaNome);
                } else {
                    const troco = Math.abs(saldo).toFixed(2).replace('.', ',');
                    totalTxt.textContent = `Devolva R$ ${troco} ao cliente`;
                    btnPagar.style.display = 'none';
                    btnExcluir.style.display = 'none';
                    inputPag.style.display = 'none';
                    mesaDiv.appendChild(btnDarTroco);
                }
            });

            btnDarTroco.addEventListener('click', () => removerMesa(mesaNome));
            btnExcluir.addEventListener('click', () => removerMesa(mesaNome));

            mesaDiv.appendChild(totalTxt);
            mesaDiv.appendChild(inputPag);
            mesaDiv.appendChild(btnPagar);
            mesaDiv.appendChild(btnExcluir);
        }

        /*----------- Remove mesa + grava HISTÓRICO -----------*/
        function removerMesa(mesaNome) {
            const mesas = JSON.parse(localStorage.getItem('mesas')) || {};
            const pedidosMesa = mesas[mesaNome] || [];
            const historicoRaw = JSON.parse(localStorage.getItem('historico')) || {};

            /* Cria array-sessão */
            const agora = new Date();
            const dataStr = agora.toLocaleDateString('pt-BR');
            const horaStr = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            const sessao = pedidosMesa.map(({ quantidade, itens, preco }) => ({
                data: dataStr,
                hora: horaStr,
                quantidade: quantidade,
                item: itens,
                valorItem: preco
            }));

            /* Gera chave única: ex. "mesa 1 – 29/05/2025 20:18" */
            const chaveSessao = `${mesaNome} – ${dataStr} ${horaStr}`;

            /* Grava sem sobrescrever outras chaves */
            historicoRaw[chaveSessao] = sessao;
            localStorage.setItem('historico', JSON.stringify(historicoRaw));

            /* Remove mesa e recarrega */
            delete mesas[mesaNome];
            localStorage.setItem('mesas', JSON.stringify(mesas));
            exibirMesas();

        }
    }










    document.getElementById('button-adicionar-comanda-mesa').addEventListener('click', () => {
        const inputMesa = document.getElementById('input-mesa');
        const inputQtd = document.getElementById('input-qtd');
        const inputItens = document.getElementById('input-itens');
        const mesaNome = inputMesa.value.trim();
        const quantidade = inputQtd.value.trim();
        const itens = inputItens.value.trim();
        const preco = '1,50';

        if (!mesaNome || !quantidade || !itens) {
            console.log('Por favor, preencha todos os campos.');
            return;
        }

        let mesasData = JSON.parse(localStorage.getItem('mesas')) || {};

        if (mesasData[mesaNome]) {
            mesasData[mesaNome].push({ quantidade, itens, preco });
        } else {
            mesasData[mesaNome] = [{ quantidade, itens, preco }];
        }

        localStorage.setItem('mesas', JSON.stringify(mesasData));
        console.log(`Comanda adicionada para a mesa ${mesaNome}: ${quantidade} - ${itens}`);

        inputMesa.value = '';
        inputQtd.value = '';
        inputItens.value = '';


        exibirMesas();
    });


    exibirMesas();
}
mesas();


function historico() {

    /* ---------- helpers ---------- */
    const BRtoISO = br => {           // "dd/mm/aaaa" -> "aaaa-mm-dd"
        const [d, m, y] = br.split('/');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    };

    const matchFiltroDia = (pedidoData, filtroISO) => {
        if (!filtroISO) return true;    // sem filtro
        return BRtoISO(pedidoData) === filtroISO;
    };

    const mesaContemItem = (pedidos, itemFiltro) => {
        if (!itemFiltro) return true;
        const termo = itemFiltro.trim().toLowerCase();
        return pedidos.some(p => p.item.toLowerCase().includes(termo));
    };

    /* ---------- render principal ---------- */
    function renderHistorico() {
        const container = document.getElementById('container-historico');
        container.innerHTML = '';

        const mesSel = parseInt(document.getElementById('select-mes').value, 10);
        const diaISO = document.getElementById('input-dia').value; // "" ou "yyyy-mm-dd"
        const itemSel = document.getElementById('input-item').value;

        const histRaw = JSON.parse(localStorage.getItem('historico')) || {};
        const histArr = Array.isArray(histRaw)
            ? histRaw
            : Object.entries(histRaw).map(([chave, pedidos]) => ({ chave, pedidos }));

        histArr.forEach(({ chave, pedidos }) => {

            /* filtra pedidos pelo mês e dia */
            const pedidosFiltrados = pedidos.filter(p => {
                const [, mes] = p.data.split('/');
                return parseInt(mes, 10) === mesSel && matchFiltroDia(p.data, diaISO);
            });

            if (!pedidosFiltrados.length) return;               // nenhum pedido no mês/dia
            if (!mesaContemItem(pedidosFiltrados, itemSel)) return; // mesa não contém item procurado

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
            const detalhesComanda = [];

            pedidosFiltrados.forEach(p => {
                const precoStr = p.valorItem ?? p.valor ?? '0,00';
                const qtd = parseFloat(p.quantidade.replace(',', '.')) || 0;
                const precoNum = parseFloat(precoStr.replace(/\./g, '').replace(',', '.')) || 0;
                totalMesa += qtd * precoNum;

                const linha = document.createElement('div');
                linha.classList.add('linha-historico');
                linha.innerHTML = `
            <span><strong>${qtd}x</strong> ${p.item}</span>
            <span>${p.data} ${p.hora}</span>
            <span>R$ ${precoStr}</span>`;
                cima.appendChild(linha);

                detalhesComanda.push({ qtd, item: p.item, precoStr });
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
            btn.onclick = () => imprimirNotaFiscal(chave, detalhesComanda, totalMesa);
            baixo.appendChild(btn);

            container.appendChild(sessao);
        });
    }

    /* ---------- impressão estilo nota ---------- */
    function imprimirNotaFiscal(chave, itens, total) {
        const win = window.open('', '', 'width=300,height=600');
        win.document.write(`
        <html><head><title>${chave}</title>
        <style>
          body{font-family:monospace;width:58mm;margin:0;padding:6px;font-size:12px}
          h2{text-align:center;font-size:16px;margin:6px 0}
          .linha{display:flex;justify-content:space-between;margin:2px 0}
          .total{margin-top:8px;border-top:1px dashed #000;padding-top:4px;font-weight:bold;text-align:right}
        </style></head><body>
        <h2>${chave}</h2>`);

        itens.forEach(it => {
            win.document.write(`<div class="linha"><span>${it.qtd}x ${it.item}</span><span>R$ ${it.precoStr}</span></div>`);
        });

        win.document.write(`<div class="total">Total: R$ ${total.toFixed(2).replace('.', ',')}</div>`);
        win.document.write('</body></html>');
        win.document.close(); win.focus(); win.print();
    }

    /* ---------- listeners ---------- */
    document.getElementById('btn-filtrar').onclick = renderHistorico;
    document.getElementById('btn-limpar').onclick = () => {
        document.getElementById('input-dia').value = '';
        document.getElementById('input-item').value = '';
        renderHistorico();
    };
    document.getElementById('select-mes').onchange = renderHistorico;

    /* mês atual default */
    document.getElementById('select-mes').value = new Date().getMonth() + 1;

    renderHistorico(); // primeira renderização
}


historico();

