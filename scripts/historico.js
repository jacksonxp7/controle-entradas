export function historico() {

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