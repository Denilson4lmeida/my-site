console.log("Script carregado!");

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM carregado!");

    const loginForm = document.getElementById("login-form");
    const messageContainer = document.getElementById("message-container");

    // Função para exibir mensagens
    function showMessage(type, message) {
        // Limpa mensagens anteriores
        messageContainer.innerHTML = "";

        // Cria a mensagem
        const messageElement = document.createElement("div");
        messageElement.className = `${type}-message`;
        messageElement.textContent = message;

        // Adiciona a mensagem ao container
        messageContainer.appendChild(messageElement);

        // Esconde a mensagem após 5 segundos
        setTimeout(() => {
            messageElement.style.display = "none";
        }, 5000);
    }

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showMessage('error', data.error);
            } else {
                showMessage('success', data.message);

                // Redireciona para o painel
                window.location.href = data.redirect; // Redireciona para painel.html

                // Fecha a janela após o redirecionamento
                setTimeout(() => {
                    window.close(); // Tenta fechar a janela, mas só funciona se a página foi aberta com window.open()
                }, 500);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
        });
    });
});
