import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `❀ Ingresa un enlace de TikTok de imágenes.\n\nEjemplo:\n*${usedPrefix + command}* https://vm.tiktok.com/xEoq8F/`, m);
    
    const isUrl = /(?:https:?\/{2})?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/([^\s&]+)/gi.test(text);
    if (!isUrl) return conn.reply(m.chat, 'ꕥ Enlace inválido. Asegúrate de que sea un link de TikTok.', m);

    await m.react('🕒');

    const API_KEY = "tedzinho";
    
    // ⬇️ SOLUCIÓN: Usamos la ruta específica 'tiktok_slide' primero
    // Si la API falla, intentamos con V8 en el catch
    let data;
    
    try {
        // INTENTO 1: Ruta específica para Slides
        const apiUrlSlide = `https://tedzinho.com.br/api/download/tiktok_slide?apikey=${API_KEY}&nome_url=${encodeURIComponent(text)}`;
        const res = await axios.get(apiUrlSlide);
        data = res.data;

    } catch (e) {
        console.log("Fallo ruta slide, intentando ruta V8...");
        try {
            // INTENTO 2: Ruta V8 (Suele ser más robusta que la V5)
            const apiUrlV8 = `https://tedzinho.com.br/api/download/play_audio/v8?apikey=${API_KEY}&nome_url=${encodeURIComponent(text)}`;
            const resBackup = await axios.get(apiUrlV8);
            data = resBackup.data;
        } catch (err2) {
            await m.react('✖️');
            return conn.reply(m.chat, '❌ La API falló (Error 500). El servidor de Tedzinho puede estar caído o el enlace es incompatible.', m);
        }
    }

    try {
        // Validar respuesta
        if (!data || !data.result) {
            return conn.reply(m.chat, '❌ No se encontraron resultados.', m);
        }

        const result = data.result;
        
        // Normalizamos la respuesta (algunas rutas devuelven 'images', otras una lista directa)
        let images = result.images || [];
        
        // Si no detectó imágenes pero devolvió éxito, revisamos si es un video
        if (images.length === 0) {
            return conn.reply(m.chat, `⚠️ No encontré imágenes en este enlace.\n¿Es posible que sea un video?\nUsa el comando *${usedPrefix}tiktok*`, m);
        }

        const title = result.title || 'TikTok Images';
        
        await conn.reply(m.chat, `✅ Se encontraron *${images.length}* imágenes. Enviando...`, m);

        // --- ENVIAR IMÁGENES ---
        
        // Método A: Si tienes sendSylphy (Recomendado)
        if (conn.sendSylphy) {
            const medias = images.map(url => ({
                type: 'image',
                data: { url },
                caption: `📷 *${title}*`
            }));
            await conn.sendSylphy(m.chat, medias, { quoted: m });
        } 
        // Método B: Enviar una por una (Más seguro si no tienes sendSylphy)
        else {
            for (let i = 0; i < images.length; i++) {
                // Pequeña pausa para no saturar
                await new Promise(resolve => setTimeout(resolve, 500)); 
                
                await conn.sendMessage(m.chat, { 
                    image: { url: images[i] }, 
                    caption: i === 0 ? `❀ *${title}*` : '' 
                }, { quoted: m });
            }
        }

        // --- ENVIAR AUDIO ---
        if (result.music) {
            await conn.sendMessage(m.chat, { 
                audio: { url: result.music }, 
                mimetype: 'audio/mp4', 
                fileName: 'audio.mp3',
                ppt: true,
                contextInfo: {
                    externalAdReply: {
                        title: "🎵 Sonido de fondo",
                        body: title,
                        thumbnailUrl: images[0],
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
        conn.reply(m.chat, `Error al procesar los datos: ${e.message}`, m);
    }
};

handler.help = ['ttimg', 'tiktokimg'];
handler.tags = ['downloader'];
handler.command = /^(ttimg|tiktokimg|ttslide)$/i;
handler.limit = 1;

export default handler;