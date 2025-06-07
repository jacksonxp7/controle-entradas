/* dashboard.js */

export function dashboard() {

    /* ---------- helpers ---------- */
    // Converte data "dd/mm/aaaa" para "aaaa-mm-dd" para ser compatível com o construtor Date
    const BRtoISO = br => {
        if (!br || typeof br !== 'string' || !br.includes('/')) return null;
        const [d, m, y] = br.split('/');
        if (d && m && y) {
            return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        return null;
    };

    // Formata um número como moeda brasileira (R$)
    const formatCurrency = value => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    /**
     * Extrai e processa todos os pedidos do localStorage em um único array plano.
     * Cada item do array é um objeto com informações calculadas e prontas para uso.
     * @returns {Array} Array de objetos de pedido processados ou um array vazio.
     */
    function getProcessedPedidos() {
        const histRaw = JSON.parse(localStorage.getItem('historico')) || {};
        if (typeof histRaw !== 'object' || histRaw === null || Object.keys(histRaw).length === 0) {
            return [];
        }

        // Pega todos os arrays de pedidos e os achata em um único array
        const todosPedidos = Object.values(histRaw).flat();

        return todosPedidos
            .map(p => {
                // Validação e limpeza dos dados de cada pedido
                const quantidade = p.quantidade || 0;
                const valorItem = parseFloat(p.valorItem) || 0;
                const dataISO = BRtoISO(p.data);

                if (!p.item || !dataISO) {
                    return null; // Descarta pedidos com dados inválidos
                }

                return {
                    item: p.item,
                    quantidade: quantidade,
                    valor: valorItem,
                    totalItem: quantidade * valorItem,
                    dataObj: new Date(`${dataISO}T00:00:00`), // Adiciona T00:00:00 para evitar problemas de fuso horário
                };
            })
            .filter(p => p !== null); // Remove os nulos
    }

    /* ---------- Funções de Renderização dos Dashboards ---------- */

    /**
     * Renderiza os cards de métricas principais (Faturamento Total, Pedidos, Ticket Médio).
     * @param {HTMLElement} container - O elemento onde os cards serão inseridos.
     * @param {Array} pedidos - O array de pedidos processados.
     */
    function renderMetricCards(container, pedidos) {
        const faturamentoTotal = pedidos.reduce((sum, p) => sum + p.totalItem, 0);
        const totalPedidos = pedidos.reduce((sum, p) => sum + p.quantidade, 0);
        
        // Para Ticket Médio, precisamos contar o número de "comandas" (chaves originais)
        const histRaw = JSON.parse(localStorage.getItem('historico')) || {};
        const totalComandas = Object.keys(histRaw).length;
        const ticketMedio = totalComandas > 0 ? faturamentoTotal / totalComandas : 0;
        
        const metricsContainer = document.createElement('div');
        metricsContainer.className = 'metric-cards';
        
        metricsContainer.innerHTML = `
            <div class="metric-card">
                <h3>Faturamento Total</h3>
                <p>${formatCurrency(faturamentoTotal)}</p>
            </div>
            <div class="metric-card">
                <h3>Itens Vendidos</h3>
                <p>${totalPedidos.toLocaleString('pt-BR')}</p>
            </div>
            <div class="metric-card">
                <h3>Ticket Médio</h3>
                <p>${formatCurrency(ticketMedio)}</p>
            </div>
        `;
        container.appendChild(metricsContainer);
    }
    
    /**
     * Renderiza o gráfico de vendas dos últimos 7 dias.
     * @param {HTMLElement} container - O elemento onde o card do gráfico será inserido.
     * @param {Array} pedidos - O array de pedidos processados.
     */
    function renderWeeklySales(container, pedidos) {
        const card = document.createElement('div');
        card.className = 'dashboard-card';
        card.innerHTML = `<h2>Vendas (Últimos 7 dias)</h2>`;
        const canvas = document.createElement('canvas');
        card.appendChild(canvas);
        container.appendChild(card);

        const labels = [];
        const data = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            labels.push(`${day}/${month}`);

            const salesOnDay = pedidos
                .filter(p => p.dataObj.getTime() === date.getTime())
                .reduce((sum, p) => sum + p.totalItem, 0);
            
            data.push(salesOnDay);
        }

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Faturamento',
                    data,
                    backgroundColor: 'rgba(30, 58, 138, 0.7)',
                    borderColor: 'rgba(30, 58, 138, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => formatCurrency(value)
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: context => `${context.dataset.label}: ${formatCurrency(context.raw)}`
                        }
                    }
                }
            }
        });
    }

    /**
     * Renderiza o gráfico de vendas mensais do ano atual.
     * @param {HTMLElement} container - O elemento onde o card do gráfico será inserido.
     * @param {Array} pedidos - O array de pedidos processados.
     */
    function renderMonthlySales(container, pedidos) {
        const card = document.createElement('div');
        card.className = 'dashboard-card';
        card.innerHTML = `<h2>Vendas Mensais (Ano Atual)</h2>`;
        const canvas = document.createElement('canvas');
        card.appendChild(canvas);
        container.appendChild(card);
        
        const currentYear = new Date().getFullYear();
        const salesByMonth = Array(12).fill(0);

        pedidos
            .filter(p => p.dataObj.getFullYear() === currentYear)
            .forEach(p => {
                const month = p.dataObj.getMonth(); // 0 = Janeiro, 11 = Dezembro
                salesByMonth[month] += p.totalItem;
            });
            
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                datasets: [{
                    label: 'Faturamento',
                    data: salesByMonth,
                    fill: true,
                    backgroundColor: 'rgba(30, 58, 138, 0.2)',
                    borderColor: 'rgba(30, 58, 138, 1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true, ticks: { callback: value => formatCurrency(value) } } },
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: context => `${context.dataset.label}: ${formatCurrency(context.raw)}` } }
                }
            }
        });
    }

    /**
     * Renderiza a lista dos 10 itens mais vendidos.
     * @param {HTMLElement} container - O elemento onde o card será inserido.
     * @param {Array} pedidos - O array de pedidos processados.
     */
    function renderTopItems(container, pedidos) {
        const card = document.createElement('div');
        card.className = 'dashboard-card';
        card.innerHTML = `<h2>Top 10 Itens Mais Vendidos</h2>`;
        
        const itemCounts = pedidos.reduce((acc, p) => {
            acc[p.item] = (acc[p.item] || 0) + p.quantidade;
            return acc;
        }, {});

        const sortedItems = Object.entries(itemCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        if (sortedItems.length === 0) {
            card.innerHTML += `<p class="empty-message">Nenhum item vendido ainda.</p>`;
        } else {
            const list = document.createElement('ol');
            list.className = 'top-items-list';
            sortedItems.forEach(([name, quantity]) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="item-name" title="${name}">${name}</span>
                    <span class="item-quantity">${quantity}x</span>
                `;
                list.appendChild(li);
            });
            card.appendChild(list);
        }
        
        container.appendChild(card);
    }
    
    /**
     * Renderiza o gráfico de vendas por dia da semana.
     * @param {HTMLElement} container - O elemento onde o card do gráfico será inserido.
     * @param {Array} pedidos - O array de pedidos processados.
     */
    function renderSalesByDayOfWeek(container, pedidos) {
        const card = document.createElement('div');
        card.className = 'dashboard-card';
        card.innerHTML = `<h2>Vendas por Dia da Semana</h2>`;
        const canvas = document.createElement('canvas');
        card.appendChild(canvas);
        container.appendChild(card);
        
        const salesByDay = Array(7).fill(0); // 0 = Domingo, 1 = Segunda, ...
        const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

        pedidos.forEach(p => {
            const dayOfWeek = p.dataObj.getDay();
            salesByDay[dayOfWeek] += p.totalItem;
        });

        new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: weekDays,
                datasets: [{
                    label: 'Faturamento',
                    data: salesByDay,
                    backgroundColor: [
                        '#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#6366f1', '#a855f7'
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: { callbacks: { label: context => `${context.label}: ${formatCurrency(context.raw)}` } }
                }
            }
        });
    }

    /* ---------- Função Principal de Renderização ---------- */

    function renderDashboard() {
        const container = document.getElementById('container-dashboard');
        if (!container) {
            console.error("Elemento 'container-dashboard' não encontrado.");
            return;
        }
        container.innerHTML = ''; // Limpa o container

        const pedidos = getProcessedPedidos();

        if (pedidos.length === 0) {
            container.innerHTML = '<div class="dashboard-card"><p class="empty-message">Nenhum dado de histórico encontrado para gerar o dashboard.</p></div>';
            return;
        }

        // Renderiza cada componente do dashboard
        // renderMetricCards(container, pedidos);
        renderWeeklySales(container, pedidos);
        renderMonthlySales(container, pedidos);
        renderTopItems(container, pedidos);
        renderSalesByDayOfWeek(container, pedidos);
        renderAnnualSales(container, pedidos); // Bônus: Vendas Anuais
    }
    
    
    /* ---------- Ideias para Mais Dashboards (Bônus) ---------- */

    /**
     * Bônus: Renderiza um gráfico de vendas anuais.
     * @param {HTMLElement} container - O elemento onde o card do gráfico será inserido.
     * @param {Array} pedidos - O array de pedidos processados.
     */
    function renderAnnualSales(container, pedidos) {
        const card = document.createElement('div');
        card.className = 'dashboard-card';
        card.innerHTML = `<h2>Faturamento Anual</h2>`;
        const canvas = document.createElement('canvas');
        card.appendChild(canvas);
        container.appendChild(card);

        const salesByYear = pedidos.reduce((acc, p) => {
            const year = p.dataObj.getFullYear();
            acc[year] = (acc[year] || 0) + p.totalItem;
            return acc;
        }, {});

        const sortedYears = Object.keys(salesByYear).sort();
        const labels = sortedYears;
        const data = sortedYears.map(year => salesByYear[year]);

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Faturamento',
                    data,
                    backgroundColor: 'rgba(22, 163, 74, 0.7)',
                    borderColor: 'rgba(22, 163, 74, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true, ticks: { callback: value => formatCurrency(value) } } },
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => `${context.dataset.label}: ${formatCurrency(context.raw)}` } } }
            }
        });
    }

    // Inicia a renderização do dashboard
    renderDashboard();
}