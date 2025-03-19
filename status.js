// Função para carregar os serviços da API
function carregarServicos() {
    fetch('/servico')  // A URL da rota no backend
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar os serviços: ' + response.statusText);
            }
            return response.json();
        })
        .then(servicos => {
            const lista = document.getElementById("lista-servicos");

            // Verifica se a lista existe
            if (!lista) {
                console.error('Elemento #lista-servicos não encontrado no HTML.');
                return;
            }

            // Limpa a lista antes de adicionar novos itens
            lista.innerHTML = '';

            // Verifica se há serviços retornados
            if (servicos.length === 0) {
                lista.innerHTML = '<p>Nenhum serviço encontrado.</p>';
                return;
            }

            // Itera sobre os serviços e cria os elementos
            servicos.forEach(servico => {
                // Criar o elemento do serviço
                const li = document.createElement("li");
                li.classList.add("servico");  // Adicionando a classe servico

                // Criar os elementos internos para mostrar o nome, computador, problema, etc.
                const h3 = document.createElement("h3");
                h3.textContent = servico.nome || 'Nome não disponível'; // Nome do serviço

                const pComputador = document.createElement("p");
                pComputador.textContent = `Computador: ${servico.computador || 'Não informado'}`;

                const pProblema = document.createElement("p");
                pProblema.textContent = `Problema: ${servico.problema || 'Não informado'}`;

                const pTecnico = document.createElement("p");
                pTecnico.textContent = `Técnico: ${servico.tecnico || 'Não informado'}`;

                const pDataPrevista = document.createElement("p");
                pDataPrevista.textContent = `Data Prevista: ${servico.data_prevista || 'Não definida'}`;

                const pStatus = document.createElement("p");
                pStatus.textContent = `Status: ${servico.status || 'Não informado'}`;

                // Adicionar todos os detalhes dentro da li
                li.appendChild(h3);
                li.appendChild(pComputador);
                li.appendChild(pProblema);
                li.appendChild(pTecnico);
                li.appendChild(pDataPrevista);
                li.appendChild(pStatus);

                // Adicionar a li na lista
                lista.appendChild(li);

                // Adicionar evento de clique para expandir a informação
                li.addEventListener('click', () => {
                    li.classList.toggle('expandido');
                    // Criar/mostrar detalhes adicionais se necessário
                    if (!li.querySelector('.detalhes')) {
                        const detalhes = document.createElement('div');
                        detalhes.classList.add('detalhes');
                        detalhes.textContent = `Detalhes adicionais...`; // Insira os detalhes extras aqui
                        li.appendChild(detalhes);
                    }
                });
            });
        })
        .catch(error => {
            console.error('Erro ao carregar os serviços:', error);
            const lista = document.getElementById("lista-servicos");
            if (lista) {
                lista.innerHTML = '<p>Erro ao carregar os serviços. Tente novamente mais tarde.</p>';
            }
        });
}

// Carregar os serviços assim que a página for carregada
window.onload = carregarServicos;