const express = require('express');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql2');
const multer = require('multer');
const bcrypt = require('bcrypt');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json()); 

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT // Se estiver usando uma porta diferente
});


connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return res.status(500).json({ error: 'Erro ao conectar ao banco de dados', details: err.message });
    }
    console.log('Conectado ao banco de dados');
});


// Configuração de sessão usando MySQL
const sessionStore = new MySQLStore({}, connection);

app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-key', // Use uma chave secreta definida no ambiente ou uma chave padrão
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Definido como true em produção, requer HTTPS
        maxAge: 1000 * 60 * 60 * 24 // Define o tempo de expiração do cookie (1 dia)
    }
}));

// Serve arquivos estáticos diretamente da raiz
app.use(express.static(path.join(__dirname)));

// Rota para o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para a página de painel (painel.html) - Redirecionamento após login bem-sucedido
app.get('/painel.html', (req, res) => {
    if (!req.session.authenticated) {
        return res.redirect('/index.html'); // Se não estiver autenticado, vai para o login
    }
    res.sendFile(path.join(__dirname, 'painel.html')); // Serve a página do painel
});

// Rota para consultar serviços
app.get('/consultar', (req, res) => {
    res.sendFile(path.join(__dirname, 'consultar.html'));
});

// Configuração do Multer para uploads de arquivos
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir); // Cria a pasta uploads se não existir
}

// Configuração do multer para salvar as imagens com validação de tipo de arquivo
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Pasta onde as imagens serão salvas
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nome do arquivo com timestamp
    }
});

// Função para verificar o tipo de arquivo
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Erro: Arquivo não permitido. Somente imagens .jpeg, .jpg, .png, .gif são permitidas!');
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Rota para salvar serviço com duas imagens
app.post('/salvar-servico', upload.fields([
    { name: 'imagem1', maxCount: 1 },
    { name: 'imagem2', maxCount: 1 }
]), (req, res) => {
    console.log(req.body, req.files);

    const { nome, computador, telefone, endereco, problema, codigo_acompanhamento, status, tecnico, observacoes } = req.body;

    // Obtém os nomes dos arquivos de imagem
    const imagem1 = req.files['imagem1'] ? req.files['imagem1'][0].filename : null;
    const imagem2 = req.files['imagem2'] ? req.files['imagem2'][0].filename : null;

    // Verifica campos obrigatórios
    if (!nome || !computador || !telefone || !endereco || !problema || !codigo_acompanhamento) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    // Define valores padrão para status e atendente
    const statusFinal = status || 'pendente'; // Valor padrão para status
    const tecnicoFinal = tecnico || null; // Valor padrão para atendente

    // Query SQL corrigida para incluir imagem1 e imagem2
    const query = `
        INSERT INTO bancada (
            codigo_acompanhamento, nome_cliente, computador, telefone, endereco, 
            problema, status, atendente, observacoes, imagem1, imagem2
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Executa a query
    connection.query(query, [
        codigo_acompanhamento, nome, computador, telefone, endereco, problema,
        statusFinal, tecnicoFinal, observacoes || null, imagem1, imagem2
    ], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao salvar o serviço.', details: err.message });
        }
        res.status(201).json({ message: 'Serviço salvo com sucesso!' });
    });
});

// Consulta de serviços
app.get('/servicos', (req, res) => {
    const { codigo_acompanhamento, nome } = req.query;
    
    let query = `
        SELECT 
            nome_cliente AS nome, 
            computador, 
            problema, 
            status, 
            data_prevista, 
            valor_estimado, 
            pecas_utilizadas, 
            TO_BASE64(imagem1) AS imagem_antes, 
            TO_BASE64(imagem2) AS imagem_depois
        FROM bancada 
        WHERE codigo_acompanhamento = ? AND nome_cliente = ?
    `;

    connection.query(query, [codigo_acompanhamento, nome], (error, results) => {
        if (error) {
            console.error("Erro ao buscar serviço:", error);
            res.status(500).json({ error: "Erro ao buscar serviço." });
        } else {
            res.json(results);
        }
    });
});

// Rota para obter todos os serviços
app.get('/servico', (req, res) => {
    const query = `
        SELECT 
            nome_cliente AS nome, 
            computador, 
            problema, 
            status, 
            data_prevista, 
            atendente, 
            observacoes
        FROM bancada
    `;

    connection.query(query, (error, results) => {
        if (error) {
            console.error("Erro ao buscar serviços:", error);
            return res.status(500).json({ error: "Erro ao buscar serviços." });
        }
        res.json(results);
    });
});

// Rota de login
app.post('/login', (req, res) => {
    // Verificar se o corpo da requisição contém os dados necessários
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({ error: 'Nome de usuário e senha são obrigatórios.' });
    }

    const { username, password } = req.body;

    // 1. Busca o usuário no banco de dados
    const query = `SELECT * FROM empresa WHERE atendente_nome = ?`;
    connection.query(query, [username], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao autenticar o usuário.', details: err.message });
        }

        if (results.length > 0) {
            const user = results[0]; // Obtém o primeiro resultado
            const hashedPassword = user.atendente_senha; // Senha criptografada no banco de dados

            // 2. Compara a senha fornecida com a senha criptografada
            const isPasswordValid = await bcrypt.compare(password, hashedPassword);
            if (isPasswordValid) {
                // 3. Autenticação bem-sucedida
                req.session.authenticated = true; // Define a sessão como autenticada
                req.session.username = username; // Armazena o nome do usuário na sessão
                return res.json({ message: 'Login bem-sucedido!', redirect: '/painel.html' });
            } else {
                // 4. Senha incorreta
                return res.status(401).json({ error: 'Nome de usuário ou senha incorretos.' });
            }
        } else {
            // 5. Usuário não encontrado
            return res.status(401).json({ error: 'Nome de usuário ou senha incorretos.' });
        }
    });
});


// Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
