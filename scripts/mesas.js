

export function mesas() {


    const inputItensDiv = document.getElementById('input-itens');
    const mesasContainer = document.getElementById('mesas-atuais');
    const btnAdicionarComanda = document.getElementById('button-adicionar-comanda-mesa');
    const inputMesaEl = document.getElementById('input-mesa');
    const inputQtdEl = document.getElementById('input-qtd');

    const placeholderTextOriginal = 'Clique para selecionar um item';
    let cardapioDataGlobal = {};
    let cardapioAbertoNoInput = false;
    let cardapioConstruidoNoInput = false;
    let placeholderElGlobal;
    let cardapioContentElGlobal;


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
            // inicio()
            if (!nomeItemSelecionado || nomeItemSelecionado === placeholderTextOriginal) {
                // alert('Selecione um item do cardápio.');
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


    carregarCardapioData();
    setupCardapioDivParaInput();
    exibirMesas();

}

