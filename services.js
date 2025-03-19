function gerarCodigoAcompanhamento() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let codigo = '';
    for (let i = 0; i < 6; i++) {
        const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
        codigo += caracteres.charAt(indiceAleatorio);
    }
    document.getElementById("codigo_acompanhamento").value = codigo;
}


// Gera o código automaticamente ao carregar a página
window.onload = gerarCodigoAcompanhamento;

document.getElementById('enviar-mensagem').addEventListener('click', async function(event) {
    event.preventDefault();  // Impede o envio tradicional do formulário

    const telefone = document.getElementById('telefone').value;
    const codigo_acompanhamento = document.getElementById('codigo_acompanhamento').value;
    const nome = document.getElementById('nome').value;

    if (!telefone || !codigo_acompanhamento || !nome) {
        alert('Todos os campos obrigatórios para o envio da mensagem devem ser preenchidos.');
        return;
    }

    try {
        const response = await fetch('/salvar-servico', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                telefone,
                codigo_acompanhamento,
                nome
            })
        });

        const data = await response.json();

        // Verifica se a resposta contém a propriedade 'message'
        if (data.message) {
            // Exibe a mensagem de sucesso
            alert(data.message);  // Aqui exibe o alerta com a mensagem de sucesso

            // Limpa os campos do formulário
            document.getElementById('codigo_acompanhamento').value = '';
            document.getElementById('nome').value = '';
            document.getElementById('telefone').value = '';
            document.getElementById('computador').value = '';
            document.getElementById('endereco').value = '';
            document.getElementById('problema').value = '';
            document.getElementById('status').value = 'agendado';
            document.getElementById('tecnico').value = '';
            document.getElementById('observacoes').value = '';
            document.getElementById('imagem').value = '';
        } else {
            // Se a resposta não contiver 'message', exibe um erro
            alert('Erro ao salvar os dados: ' + (data.error || 'Desconhecido'));
        }
    } catch (error) {
        alert('Erro ao salvar os dados: ' + error.message);
    }
});


// Função para mostrar a mensagem de sucesso ou erro
function showMessage(message, type) {
    const messageElement = document.getElementById('mensagem');
    messageElement.style.display = 'block';  // Torna a mensagem visível
    messageElement.textContent = message;

    // Define as cores conforme o tipo de mensagem
    if (type === 'success') {
        messageElement.style.backgroundColor = 'green';
        messageElement.style.color = 'white';
    } else {
        messageElement.style.backgroundColor = 'red';
        messageElement.style.color = 'white';
    }
}

