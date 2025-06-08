import { mesas } from "./mesas.js";
import { menu } from "./menu.js";
import { inicio } from "./inicio.js";
import { historico } from "./historico.js";
import { dashboard } from './dashboard.js';

inicio();
menu()
mesas();
historico();
dashboard();





// function construirCardapioInternoNoInput() {
//         console.log('atualizar input')
//         if (!cardapioContentElGlobal) return;
//         cardapioContentElGlobal.innerHTML = "";

//         if (Object.keys(cardapioDataGlobal).length === 0) {
//             cardapioContentElGlobal.innerHTML = "<p>Cardápio não disponível.</p>";
//             return;
//         }

//         for (const secaoNome in cardapioDataGlobal) {
//             const itens = cardapioDataGlobal[secaoNome]?.itens || [];
//             const secaoIdSafe = `secao-${secaoNome.replace(/\s+/g, '-').toLowerCase()}`;
//             const secaoDiv = document.createElement('div');
//             secaoDiv.className = 'secao';
//             const headerDiv = document.createElement('div');
//             headerDiv.className = 'secao-header';
//             headerDiv.dataset.secaoId = secaoIdSafe;
//             headerDiv.innerHTML = `<span class="arrow">▶</span> ${secaoNome.toUpperCase()}`;
//             secaoDiv.appendChild(headerDiv);
//             const itensContainerDiv = document.createElement('div');
//             itensContainerDiv.className = 'secao-itens-container';
//             itensContainerDiv.style.display = 'none';
//             itensContainerDiv.dataset.containerFor = secaoIdSafe;
//             itens.forEach(item => {
//                 const itemDiv = document.createElement('div');
//                 itemDiv.className = 'item';
//                 itemDiv.textContent = item.nome;
//                 itemDiv.dataset.value = item.nome;
//                 itensContainerDiv.appendChild(itemDiv);
//             });
//             secaoDiv.appendChild(itensContainerDiv);
//             cardapioContentElGlobal.appendChild(secaoDiv);
//         }

//         cardapioConstruidoNoInput = true;
//     }








