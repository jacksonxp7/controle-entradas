import { mesas } from "./mesas.js";

const mesasimportada = mesas();

export function inicio() {

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
            gerarCardapio(cardapioAtual);

            return true; // Indicates that changes were made and cardapio re-rendered
        }
        return false; // Indicates no changes were made

    }



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
                mesasimportada.construirCardapioInternoNoInput();


                const secaoRemovida = removerSecoesVazias();
                if (!secaoRemovida) {
                    gerarCardapio(cardapioAtual);
                }
            }

            modal.style.display = "none";
            produtoClicado = null;

        });
    }





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
            // 
            mesas()
        });
        form.querySelector("#cancelAddItem").addEventListener("click", () => form.remove());
    }


    slider();
    inicializarCardapio();
    carregarCardapio();
    removerSecoesVazias();
    editarPreco();
    habilitarExclusaoItem();

    const botaoAdicionar = document.getElementById("botaoclickeaqui");
    if (botaoAdicionar) {
        botaoAdicionar.addEventListener("click", mostrarFormulario);
    }
}
