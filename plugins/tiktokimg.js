import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validar que haya texto/link
    if (!text) return conn.reply(m.chat, `❀ Ingresa un enlace de TikTok Slide (Imágenes).\n\nEjemplo:\n*${usedPrefix + command}* https://vm.tiktok.com/xEmq8F/`, m);
    
    // Regex para validar URL de TikTok
    const isUrl = /(?:https:?\/{2})?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/([^\s&]+)/gi.test(text);
    if (!isUrl) return conn.reply(m.chat, 'ꕥ Enlace inválido. Asegúrate de que sea un link de TikTok.', m);

    // Tu API Key y URL (Usamos la V5 que soporta slides)
    const API_KEY_TED = "tedzinho";
    const apiUrl = `https://tedzinho.com.br/api/download/play_audio/v5?apikey=${API_KEY_TED}&nome_url=${encodeURIComponent(text)}`;

    try {
        await m.react('🕒'); // Reacción de espera
        
        // 2. Petición a la API
        const { data } = await axios.get(apiUrl);

        // Validar respuesta exitosa
        if (!data || !data.result) {
            return conn.reply(m.chat, '❌ No se pudo obtener el contenido. Intenta con otro enlace.', m);
        }

        const result = data.result;
        
        // 3. Verificar si existen imágenes (Slideshow)
        // La API suele devolver un array en 'images' si es un slide
        if (!result.images || result.images.length === 0) {
            await m.react('✖️');
            return conn.reply(m.chat, `⚠️ Este enlace parece ser un **VIDEO**, no imágenes.\n> Usa el comando *${usedPrefix}tiktok* para videos.`, m);
        }

        // Datos del post
        const title = result.title || 'TikTok Slide';
        const author = 'Tedzinho API';
        const images = result.images;
        
        await conn.reply(m.chat, `✅ Se encontraron *${images.length}* imágenes. Enviando...`, m);

        // 4. Enviar imágenes
        // Opción A: Si tu bot tiene función para álbumes (sendSylphy, etc)
        if (conn.sendSylphy) {
            const medias = images.map(url => ({
                type: 'image',
                data: { url },
                caption: `📷 *${title}*`
            }));
            await conn.sendSylphy(m.chat, medias, { quoted: m });
        } 
        // Opción B: Método clásico (una por una para evitar errores en Baileys puro)
        else {
            for (let i = 0; i < images.length; i++) {
                await conn.sendMessage(m.chat, { 
                    image: { url: images[i] }, 
                    caption: (i === 0) ? `❀ *${title}*\n> 📸 (${i + 1}/${images.length})` : null // Solo pone caption en la primera
                }, { quoted: m });
            }
        }

        // 5. Enviar el audio de fondo si existe
        if (result.music) {
            await conn.sendMessage(m.chat, { 
                audio: { url: result.music }, 
                mimetype: 'audio/mp4', 
                fileName: 'tiktok_slide_audio.mp3',
                ppt: true,
                contextInfo: {
                    externalAdReply: {
                        title: "🎵 Audio del Slide",
                        body: title,
                        thumbnailUrl: images[0], // Usa la primera imagen como portada
                        sourceUrl: text,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });
        }

        await m.react('🖼️');

    } catch (e) {
        console.error(e);
        await m.react('✖️');
        conn.reply(m.chat, `Error al descargar las imágenes.\n${e.message}`, m);
    }
};

handler.help = ['ttimg', 'tiktokimg', 'ttslide'];
handler.tags = ['downloader'];
handler.command = /^(ttimg|tiktokimg|ttslide|tiktoks)$/i;
handler.limit = 1; 

export default handler;