export function menu() {
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