/* dashboard.js (VERSÃO FINAL E REALMENTE COMPLETA) */

export function dashboard() {

    /* ---------- Helpers ---------- */
    const BRtoISO = br => (br && br.includes('/')) ? br.split('/').reverse().join('-') : null;
    const formatCurrency = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const getDaysBetween = (start, end) => (new Date(end) - new Date(start)) / (1000 * 3600 * 24) + 1;

    // Função melhorada para obter pedidos, agora incluindo a chave da comanda
    function getProcessedPedidos(startDate, endDate) {
        const histRaw = JSON.parse(localStorage.getItem('historico')) || {};
        const start = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null;
        const end = endDate ? new Date(`${endDate}T23:59:59`).getTime() : null;
        
        let allPedidos = [];
        for (const comandaChave in histRaw) {
            if (Array.isArray(histRaw[comandaChave])) {
                histRaw[comandaChave].forEach(p => {
                    const dataISO = BRtoISO(p.data);
                    if (!p.item || !dataISO) return;

                    const dataObj = new Date(`${dataISO}T00:00:00`);
                    if ((start && dataObj.getTime() < start) || (end && dataObj.getTime() > end)) return;
                    
                    allPedidos.push({
                        ...p,
                        comandaChave, // ESSENCIAL para cálculos por comanda
                        dataObj,
                        totalItem: (p.quantidade || 0) * (parseFloat(p.valorItem) || 0),
                        hora: p.hora ? parseInt(p.hora.split(':')[0], 10) : null,
                    });
                });
            }
        }
        return allPedidos;
    }

    // Agrupa pedidos por comanda
    function getGroupedPedidos(pedidos) {
        return pedidos.reduce((acc, p) => {
            (acc[p.comandaChave] = acc[p.comandaChave] || []).push(p);
            return acc;
        }, {});
    }

    /* ---------- Funções de Renderização dos Dashboards ---------- */
    function renderCard(container, title, contentElement, cardClasses = '') {
        const card = document.createElement('div');
        card.className = `dashboard-card ${cardClasses}`;
        card.innerHTML = `<h2>${title}</h2>`;
        card.appendChild(contentElement);
        container.appendChild(card);
    }

    function createEmptyMessage(text) {
        const p = document.createElement('p');
        p.className = 'empty-message';
        p.textContent = text;
        return p;
    }
    
    // =================================================================
    //  NÍVEL 1: Visão Geral e Métricas Chave
    // =================================================================
    
    function renderMetricCards(container, pedidos) {
        const faturamentoTotal = pedidos.reduce((sum, p) => sum + p.totalItem, 0);
        const totalItens = pedidos.reduce((sum, p) => sum + p.quantidade, 0);
        const valorMedioItem = totalItens > 0 ? faturamentoTotal / totalItens : 0;
        
        const metricsContainer = document.createElement('div');
        metricsContainer.className = 'metric-cards';
        
        metricsContainer.innerHTML = `
            <div class="metric-card"><h3>Faturamento no Período</h3><p>${formatCurrency(faturamentoTotal)}</p></div>
            <div class="metric-card"><h3>Itens Vendidos</h3><p>${totalItens.toLocaleString('pt-BR')}</p></div>
            <div class="metric-card"><h3>Valor Médio por Item</h3><p>${formatCurrency(valorMedioItem)}</p></div>
        `;
        container.appendChild(metricsContainer);
    }
    
    function renderPeriodSummary(container, startDate, endDate, pedidos) {
        const content = document.createElement('div');
        content.className = 'summary-card-content';
        const numDays = getDaysBetween(startDate, endDate);
        const numPedidos = pedidos.length;
        const numComandas = Object.keys(getGroupedPedidos(pedidos)).length;

        content.innerHTML = `
            <div class="summary-label">Resumo do Período</div>
            <div class="main-value">${numDays.toFixed(0)} <span>dias</span></div>
            <div class="summary-label">analisando</div>
            <div class="summary-value">${numComandas} <span>comandas</span> / ${numPedidos} <span>itens</span></div>
        `;
        renderCard(container, "Visão Geral", content);
    }
    
    function renderTicketMedioPorComanda(container, pedidos) {
        const grouped = getGroupedPedidos(pedidos);
        const totalComandas = Object.keys(grouped).length;
        const faturamentoTotal = pedidos.reduce((sum, p) => sum + p.totalItem, 0);
        const ticketMedio = totalComandas > 0 ? faturamentoTotal / totalComandas : 0;
        
        const content = document.createElement('div');
        content.className = 'summary-card-content';
        content.innerHTML = `<div class="main-value">${formatCurrency(ticketMedio)}</div>`;
        renderCard(container, "Ticket Médio por Comanda", content);
    }

    function renderItensPorComanda(container, pedidos) {
        const grouped = getGroupedPedidos(pedidos);
        const totalComandas = Object.keys(grouped).length;
        const totalItens = pedidos.length;
        const mediaItens = totalComandas > 0 ? totalItens / totalComandas : 0;

        const content = document.createElement('div');
        content.className = 'summary-card-content';
        content.innerHTML = `<div class="main-value">${mediaItens.toFixed(1)} <span>itens</span></div>`;
        renderCard(container, "Média de Itens por Comanda", content);
    }
    
    // =================================================================
    //  NÍVEL 2: Análise de Performance de Itens
    // =================================================================

    function renderTopItemsByQuantity(container, pedidos) {
        const content = document.createElement('div');
        const itemCounts = pedidos.reduce((acc, p) => { acc[p.item] = (acc[p.item] || 0) + p.quantidade; return acc; }, {});
        const sortedItems = Object.entries(itemCounts).sort(([, a], [, b]) => b - a).slice(0, 10);
        
        if (sortedItems.length === 0) { content.appendChild(createEmptyMessage('Sem dados para este período.')); }
        else {
            const list = document.createElement('ol'); list.className = 'top-items-list';
            sortedItems.forEach(([name, quantity]) => { list.innerHTML += `<li><span class="item-name" title="${name}">${name}</span><span class="item-quantity">${quantity}x</span></li>`; });
            content.appendChild(list);
        }
        renderCard(container, 'Top 10 Itens (Quantidade)', content);
    }

    function renderTopItemsByRevenue(container, pedidos) {
        const content = document.createElement('div');
        const itemRevenue = pedidos.reduce((acc, p) => { acc[p.item] = (acc[p.item] || 0) + p.totalItem; return acc; }, {});
        const sortedItems = Object.entries(itemRevenue).sort(([, a], [, b]) => b - a).slice(0, 10);

        if (sortedItems.length === 0) { content.appendChild(createEmptyMessage('Sem dados para este período.')); }
        else {
            const list = document.createElement('ol'); list.className = 'top-items-list';
            sortedItems.forEach(([name, revenue]) => { list.innerHTML += `<li><span class="item-name" title="${name}">${name}</span><span class="item-value">${formatCurrency(revenue)}</span></li>`; });
            content.appendChild(list);
        }
        renderCard(container, 'Top 10 Itens (Faturamento)', content);
    }
    
    function renderLeastSoldItems(container, pedidos) {
        const content = document.createElement('div');
        const itemCounts = pedidos.reduce((acc, p) => { acc[p.item] = (acc[p.item] || 0) + p.quantidade; return acc; }, {});
        const sorted = Object.entries(itemCounts).sort(([,a],[,b]) => a - b).slice(0, 10);
        
        if(sorted.length === 0) { content.appendChild(createEmptyMessage('Nenhum item vendido.')); }
        else {
            const list = document.createElement('ol'); list.className = 'top-items-list';
            sorted.forEach(([name, quantity]) => { list.innerHTML += `<li><span class="item-name" title="${name}">${name}</span><span class="item-quantity">${quantity}x</span></li>`; });
            content.appendChild(list);
        }
        renderCard(container, "Top 10 Itens Menos Vendidos", content);
    }

    function renderComboAnalysis(container, pedidos) {
        const content = document.createElement('div');
        const grouped = getGroupedPedidos(pedidos);
        const comboCounts = {};

        for (const comanda in grouped) {
            const items = [...new Set(grouped[comanda].map(p => p.item))].sort();
            if (items.length > 1) {
                for (let i = 0; i < items.length; i++) {
                    for (let j = i + 1; j < items.length; j++) {
                        const comboKey = `${items[i]} + ${items[j]}`;
                        comboCounts[comboKey] = (comboCounts[comboKey] || 0) + 1;
                    }
                }
            }
        }
        
        const sortedCombos = Object.entries(comboCounts).sort(([,a],[,b]) => b - a).slice(0, 10);
        
        if(sortedCombos.length === 0) { content.appendChild(createEmptyMessage('Não há dados de combos.')); }
        else {
            const list = document.createElement('ol'); list.className = 'top-items-list';
            sortedCombos.forEach(([name, count]) => { list.innerHTML += `<li><span class="item-name" title="${name}">${name}</span><span class="item-quantity">${count}x</span></li>`; });
            content.appendChild(list);
        }
        renderCard(container, "Top 10 Combos de Itens", content);
    }
    
    // =================================================================
    //  NÍVEL 3: Análise Temporal
    // =================================================================
    
    function renderPeriodComparison(container, currentStartDate, currentEndDate) {
        const content = document.createElement('div');
        content.className = 'comparison-card-content';
        const faturamentoAtual = getProcessedPedidos(currentStartDate, currentEndDate).reduce((sum, p) => sum + p.totalItem, 0);
        const start = new Date(`${currentStartDate}T00:00:00`);
        const diffDays = getDaysBetween(currentStartDate, currentEndDate);
        const prevEndDate = new Date(start); prevEndDate.setDate(prevEndDate.getDate() - 1);
        const prevStartDate = new Date(prevEndDate); prevStartDate.setDate(prevStartDate.getDate() - (diffDays - 1));
        const faturamentoAnterior = getProcessedPedidos(prevStartDate.toISOString().split('T')[0], prevEndDate.toISOString().split('T')[0]).reduce((sum, p) => sum + p.totalItem, 0);
        let percentageChange = 0; let changeClass = '';
        if (faturamentoAnterior > 0) { percentageChange = ((faturamentoAtual - faturamentoAnterior) / faturamentoAnterior) * 100; }
        else if (faturamentoAtual > 0) { percentageChange = 100; }
        if (percentageChange > 0) changeClass = 'positive'; if (percentageChange < 0) changeClass = 'negative';
        const sign = percentageChange >= 0 ? '+' : '';
        const periodLabel = `vs. ${prevStartDate.toLocaleDateString('pt-BR')} - ${prevEndDate.toLocaleDateString('pt-BR')}`;
        content.innerHTML = `<div class="period-label">Faturamento no período</div><div class="main-value">${formatCurrency(faturamentoAtual)}</div><div class="comparison-value ${changeClass}">${faturamentoAnterior > 0 || faturamentoAtual > 0 ? `${sign}${percentageChange.toFixed(1)}%` : 'Sem dados'}</div><div class="period-label">${periodLabel}</div>`;
        renderCard(container, 'Comparativo de Período', content);
    }

    function renderSalesByDayOfWeek(container, pedidos) {
        const canvas = document.createElement('canvas');
        const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const salesByDay = Array(7).fill(0);
        pedidos.forEach(p => { salesByDay[p.dataObj.getDay()] += p.totalItem; });
        if (pedidos.length === 0) { renderCard(container, 'Vendas por Dia da Semana', createEmptyMessage('Sem dados para este período.')); return; }
        new Chart(canvas, { type: 'doughnut', data: { labels: weekDays, datasets: [{ label: 'Faturamento', data: salesByDay, backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#6366f1', '#a855f7']}] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, tooltip: { callbacks: { label: c => `${c.label}: ${formatCurrency(c.raw)}`}}}}});
        renderCard(container, 'Vendas por Dia da Semana', canvas);
    }
    
    function renderHourlySales(container, pedidos) {
        const canvas = document.createElement('canvas');
        const salesByHour = Array(24).fill(0);
        pedidos.forEach(p => { if (p.hora !== null) salesByHour[p.hora] += p.totalItem; });
        if (pedidos.length === 0) { renderCard(container, 'Pico de Faturamento por Hora', createEmptyMessage('Sem dados para este período.')); return; }
        new Chart(canvas, { type: 'bar', data: { labels: Array.from({length: 24}, (_, i) => `${i}h`), datasets: [{ label: 'Faturamento', data: salesByHour, backgroundColor: 'rgba(30, 58, 138, 0.7)' }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { callback: v => formatCurrency(v) }}}, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.dataset.label}: ${formatCurrency(c.raw)}`}}}}});
        renderCard(container, 'Pico de Faturamento por Hora', canvas);
    }

    function renderPeakHoursByOrders(container, pedidos) {
        const canvas = document.createElement('canvas');
        const ordersByHour = Array(24).fill(0);
        pedidos.forEach(p => { if (p.hora !== null) ordersByHour[p.hora]++; });
        new Chart(canvas, { type: 'bar', data: { labels: Array.from({length: 24}, (_, i) => `${i}h`), datasets: [{ label: 'Nº de Pedidos', data: ordersByHour, backgroundColor: 'rgba(22, 163, 74, 0.7)' }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { precision: 0 } } }, plugins: { legend: { display: false } } } });
        renderCard(container, "Pico de Pedidos por Hora", canvas);
    }
    
    function calculateStandardDeviation(arr) { if(arr.length < 2) return 0; const mean = arr.reduce((a, b) => a + b) / arr.length; const variance = arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / arr.length; return Math.sqrt(variance); }
    function renderSalesVolatility(container, pedidos) {
        const salesByDay = pedidos.reduce((acc, p) => { const day = p.dataObj.toISOString().split('T')[0]; acc[day] = (acc[day] || 0) + p.totalItem; return acc; }, {});
        const dailyTotals = Object.values(salesByDay);
        const stdDev = calculateStandardDeviation(dailyTotals);
        const content = document.createElement('div'); content.className = 'summary-card-content';
        content.innerHTML = `<div class="main-value">${formatCurrency(stdDev)}</div><div class="summary-label">Quanto as vendas diárias variam da média</div>`;
        renderCard(container, "Volatilidade de Vendas", content);
    }
    
    // =================================================================
    //  NÍVEL 4: Visões Consolidadas e de Longo Prazo
    // =================================================================
    
    function renderDailyRevenueDistribution(container, pedidos) {
        const canvas = document.createElement('canvas');
        const salesByDay = pedidos.reduce((acc, p) => { const day = p.dataObj.toISOString().split('T')[0]; acc[day] = (acc[day] || 0) + p.totalItem; return acc; }, {});
        const sortedDays = Object.keys(salesByDay).sort();
        const labels = sortedDays.map(day => new Date(`${day}T00:00:00`).toLocaleDateString('pt-BR'));
        const data = sortedDays.map(day => salesByDay[day]);
        if (data.length === 0) { renderCard(container, 'Faturamento Diário', createEmptyMessage('Sem dados para este período.'), 'full-width-card'); return; }
        new Chart(canvas, { type: 'line', data: { labels, datasets: [{ label: 'Faturamento', data, fill: true, borderColor: 'rgba(30, 58, 138, 1)', backgroundColor: 'rgba(30, 58, 138, 0.2)', tension: 0.1 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { callback: v => formatCurrency(v) }}}, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.dataset.label}: ${formatCurrency(c.raw)}`}}}}});
        renderCard(container, 'Faturamento Diário no Período', canvas, 'full-width-card');
    }

    function renderItemPerformanceTable(container, pedidos) {
        const content = document.createElement('div'); content.className = 'table-container';
        const faturamentoTotalPeriodo = pedidos.reduce((sum, p) => sum + p.totalItem, 0);
        const itemData = {};
        pedidos.forEach(p => { if (!itemData[p.item]) itemData[p.item] = { qtd: 0, faturamento: 0 }; itemData[p.item].qtd += p.quantidade; itemData[p.item].faturamento += p.totalItem; });
        const sorted = Object.entries(itemData).sort(([,a],[,b]) => b.faturamento - a.faturamento).slice(0, 15);
        if(sorted.length === 0) { content.appendChild(createEmptyMessage('Sem dados para a tabela.')); }
        else {
            let tableHtml = `<thead><tr><th>Produto</th><th>Qtd.</th><th>Faturamento</th><th>% Total</th></tr></thead><tbody>`;
            sorted.forEach(([name, data]) => { const percentTotal = faturamentoTotalPeriodo > 0 ? (data.faturamento / faturamentoTotalPeriodo) * 100 : 0; tableHtml += `<tr><td>${name}</td><td>${data.qtd}</td><td>${formatCurrency(data.faturamento)}</td><td>${percentTotal.toFixed(1)}%</td></tr>`; });
            tableHtml += `</tbody>`;
            const table = document.createElement('table'); table.className = 'detailed-table'; table.innerHTML = tableHtml; content.appendChild(table);
        }
        renderCard(container, "Performance Detalhada de Itens", content, 'full-width-card');
    }
    
    function renderSalesByDayOfWeekTable(container, pedidos) {
        const content = document.createElement('div'); content.className = 'table-container';
        const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const dayData = Array(7).fill(null).map(() => ({ faturamento: 0, comandas: new Set() }));
        pedidos.forEach(p => { const dayIndex = p.dataObj.getDay(); dayData[dayIndex].faturamento += p.totalItem; dayData[dayIndex].comandas.add(p.comandaChave); });
        let tableHtml = `<thead><tr><th>Dia da Semana</th><th>Faturamento</th><th>Nº Comandas</th><th>Ticket Médio</th></tr></thead><tbody>`;
        weekDays.forEach((name, i) => { const data = dayData[i]; const numComandas = data.comandas.size; const ticketMedio = numComandas > 0 ? data.faturamento / numComandas : 0; tableHtml += `<tr><td>${name}</td><td>${formatCurrency(data.faturamento)}</td><td>${numComandas}</td><td>${formatCurrency(ticketMedio)}</td></tr>`; });
        tableHtml += `</tbody>`;
        const table = document.createElement('table'); table.className = 'detailed-table'; table.innerHTML = tableHtml; content.appendChild(table);
        renderCard(container, "Análise Detalhada por Dia da Semana", content, 'full-width-card');
    }

    function renderProductHeatmap(container, pedidos) {
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']; const salesData = {};
        pedidos.forEach(p => { if (!salesData[p.item]) salesData[p.item] = Array(7).fill(0); salesData[p.item][p.dataObj.getDay()] += p.quantidade; });
        if (Object.keys(salesData).length === 0) { renderCard(container, 'Mapa de Calor (Vendas por Dia)', createEmptyMessage('Sem dados para este período.'), 'full-width-card'); return; }
        const maxSale = Math.max(...Object.values(salesData).flat());
        const getHeatClass = v => { if (v === 0) return 'heat-0'; const p = v / maxSale; if (p <= 0.25) return 'heat-1'; if (p <= 0.50) return 'heat-2'; if (p <= 0.75) return 'heat-3'; return 'heat-4'; };
        let tableHtml = `<thead><tr><th>Produto</th>${weekDays.map(d => `<th>${d}</th>`).join('')}</tr></thead><tbody>`;
        Object.entries(salesData).forEach(([item, sales]) => { tableHtml += `<tr><td>${item}</td>${sales.map(qty => `<td class="heat-cell ${getHeatClass(qty)}">${qty}</td>`).join('')}</tr>`; });
        tableHtml += `</tbody>`;
        const containerDiv = document.createElement('div'); containerDiv.className = 'heatmap-container'; const table = document.createElement('table'); table.className = 'heatmap-table'; table.innerHTML = tableHtml; containerDiv.appendChild(table);
        renderCard(container, 'Mapa de Calor (Vendas por Dia)', containerDiv, 'full-width-card');
    }
    
    function renderMonthlyComparison(container) {
        const canvas = document.createElement('canvas');
        const allPedidos = getProcessedPedidos(null, null);
        const currentYear = new Date().getFullYear();
        const salesByMonth = Array(12).fill(0);
        allPedidos.filter(p => p.dataObj.getFullYear() === currentYear).forEach(p => { salesByMonth[p.dataObj.getMonth()] += p.totalItem; });
        new Chart(canvas, { type: 'line', data: { labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'], datasets: [{ label: 'Faturamento', data: salesByMonth, borderColor: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.2)', fill: true }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { callback: v => formatCurrency(v) }}}, plugins: { legend: { display: false } } } });
        renderCard(container, `Faturamento Mensal (${currentYear})`, canvas, 'full-width-card');
    }
    
    /* ---------- Renderização Principal e Filtros ---------- */

    function renderFilters() {
        const container = document.getElementById('container-filtros');
        if (!container) {
            const dashboardContainer = document.getElementById('container-dashboard');
            if (dashboardContainer) dashboardContainer.innerHTML = '<div class="dashboard-card full-width-card"><p class="empty-message">Erro Crítico: Container de filtros não encontrado. Verifique o HTML.</p></div>';
            return;
        }
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 29);

        container.innerHTML = `<div class="filter-group"><label for="start-date">Data de Início</label><input type="date" id="start-date" value="${startDate.toISOString().split('T')[0]}"></div><div class="filter-group"><label for="end-date">Data de Fim</label><input type="date" id="end-date" value="${endDate.toISOString().split('T')[0]}"></div><button id="btn-filtrar">Analisar Período</button>`;
        document.getElementById('btn-filtrar').addEventListener('click', renderDashboard);
    }
    
    function renderDashboard() {
        const container = document.getElementById('container-dashboard');
        if (!container) return;
        container.innerHTML = '<div class="dashboard-card full-width-card"><p class="empty-message">Gerando relatórios...</p></div>';

        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        setTimeout(() => {
            const pedidos = getProcessedPedidos(startDate, endDate);
            container.innerHTML = '';

            if (pedidos.length === 0) {
                container.innerHTML = '<div class="dashboard-card full-width-card"><p class="empty-message">Nenhum dado de histórico encontrado para o período selecionado.</p></div>';
                return;
            }
            
            // --- CHAMANDO TODOS OS DASHBOARDS ---
            
            renderMetricCards(container, pedidos);
            renderPeriodSummary(container, startDate, endDate, pedidos);
            renderTicketMedioPorComanda(container, pedidos);
            renderItensPorComanda(container, pedidos);
            
            renderTopItemsByQuantity(container, pedidos);
            renderTopItemsByRevenue(container, pedidos);
            renderLeastSoldItems(container, pedidos);
            renderComboAnalysis(container, pedidos);
            
            renderPeriodComparison(container, startDate, endDate);
            renderSalesByDayOfWeek(container, pedidos);
            renderHourlySales(container, pedidos);
            renderPeakHoursByOrders(container, pedidos);
            renderSalesVolatility(container, pedidos);
            
            renderDailyRevenueDistribution(container, pedidos);
            renderSalesByDayOfWeekTable(container, pedidos);

            // Os cards de tabela larga ficam melhores no final
            renderItemPerformanceTable(container, pedidos);
            renderProductHeatmap(container, pedidos);
            renderMonthlyComparison(container);

        }, 50);
    }
    
    // --- Lógica de Inicialização ---
    renderFilters();
    if (document.getElementById('container-filtros')) {
        renderDashboard();
    }
}