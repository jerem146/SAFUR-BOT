const axios = require('axios');

// Suas configurações
const API_KEY_TED = "tedzinho";

// Função do comando (exemplo genérico para bots de WhatsApp)
async function downloadTikTokSlide(conn, from, query) {
    try {
        if (!query) return console.log("Faltou o link!");

        // 1. Monta a URL da API para Slides
        const apiUrl = `https://tedzinho.com.br/api/download/tiktok_slide?apikey=${API_KEY_TED}&nome_url=${encodeURIComponent(query)}`;

        // 2. Faz a requisição
        const { data } = await axios.get(apiUrl);

        // 3. Verifica se a API retornou sucesso
        if (!data || !data.status) {
            return conn.sendMessage(from, { text: '❌ Erro ao buscar imagens. Verifique se o link é um slide válido.' });
        }

        // 4. Envia as imagens
        // A API geralmente retorna as imagens dentro de 'result' ou 'data' como um array
        // Ajuste 'data.result' conforme o retorno exato da API do Tedzinho para slides
        const imagens = data.result || data.images; 

        if (imagens && imagens.length > 0) {
            conn.sendMessage(from, { text: `✅ Encontrei ${imagens.length} imagens. Enviando...` });

            for (let imgUrl of imagens) {
                // Envia cada imagem
                await conn.sendMessage(from, { 
                    image: { url: imgUrl }, 
                    caption: 'Downloaded by Tedzinho API' 
                });
            }
        } else {
            conn.sendMessage(from, { text: '❌ Nenhuma imagem encontrada neste link.' });
        }

    } catch (error) {
        console.error(error);
        conn.sendMessage(from, { text: '❌ Ocorreu um erro na API.' });
    }
}