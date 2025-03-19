document.getElementById('search-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Impede o envio padrão do formulário

    const codigoAcompanhamento = document.getElementById('codigo_acompanhamento').value;
    const nomeCliente = document.getElementById('nome').value;
    const resultContent = document.getElementById('result-content');
    const imageContent = document.getElementById('image-content');

    // Limpa o conteúdo anterior
    resultContent.innerHTML = '<p>Carregando...</p>';
    imageContent.innerHTML = '<p>Carregando imagens...</p>';

    // Faz a requisição ao servidor
    fetch(`/servicos?codigo_acompanhamento=${codigoAcompanhamento}&nome=${nomeCliente}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const servico = data[0];

                // Mapeamento de status para porcentagem e cor
                const statusMap = {
                    'agendado': { porcentagem: 10, cor: 'agendado' },
                    'pendente': { porcentagem: 20, cor: 'pendente' },
                    'aprovacao cliente': { porcentagem: 30, cor: 'aprovacao-cliente' },
                    'em andamento': { porcentagem: 50, cor: 'em-andamento' },
                    'aguardando peças': { porcentagem: 70, cor: 'aguardando-pecas' },
                    'concluído': { porcentagem: 100, cor: 'concluido' },
                    'não resolvido': { porcentagem: 100, cor: 'nao-resolvido' },
                    'cancelado': { porcentagem: 0, cor: 'cancelado' }
                };

                const statusInfo = statusMap[servico.status.toLowerCase()] || { porcentagem: 0, cor: 'cancelado' };

                // Cria a barra de progresso com base no status
                const progressBar = `
                    <div class="progress-bar">
                        <div class="progress-bar-fill ${statusInfo.cor}" style="width: ${statusInfo.porcentagem}%;"></div>
                    </div>
                `;

                resultContent.innerHTML = `
                    <div class="result-field">
                        <strong>Nome:</strong>
                        <p>${servico.nome}</p>
                    </div>
                    <div class="result-field">
                        <strong>Equipamento:</strong>
                        <p>${servico.computador}</p>
                    </div>
                    <div class="result-field">
                        <strong>Problema:</strong>
                        <p>${servico.problema}</p>
                    </div>
                    <div class="result-field">
                        <strong>Status:</strong>
                        ${progressBar}
                    </div>
                    <div class="result-field">
                        <strong>Data prevista para entrega:</strong>
                        <p>${servico.data_prevista || 'Não definida'}</p>
                    </div>
                    <div class="result-field">
                        <strong>Valor:</strong>
                        <p>${servico.valor_estimado ? `R$ ${servico.valor_estimado}` : 'Não informado'}</p>
                    </div>
                    <div class="result-field">
                        <strong>Peças Utilizadas:</strong>
                        <p>${servico.pecas_utilizadas || 'Nenhuma'}</p>
                    </div>
                `;

                // Exibe imagens antes e depois, se existirem
                const imagemAntes = servico.imagem_antes 
                    ? `<div><h3>imagem 1</h3><img src="data:image/jpeg;base64,${servico.imagem_antes}" alt="Antes do serviço"></div>` 
                    : '<div><h3>imagem 1</h3><p>Sem imagem</p></div>';
                
                const imagemDepois = servico.imagem_depois 
                    ? `<div><h3>imagem 2</h3><img src="data:image/jpeg;base64,${servico.imagem_depois}" alt="Depois do serviço"></div>` 
                    : '<div><h3>imagem 2</h3><p>Sem imagem</p></div>';

                imageContent.innerHTML = `<div class="image-container">${imagemAntes}${imagemDepois}</div>`;
            } else {
                resultContent.innerHTML = '<p>Nada registrado.</p>';
                imageContent.innerHTML = '<p>Nenhuma imagem disponível.</p>';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
            resultContent.innerHTML = '<p>Erro ao buscar dados. Tente novamente.</p>';
            imageContent.innerHTML = '<p>Erro ao carregar imagens.</p>';
        });
});