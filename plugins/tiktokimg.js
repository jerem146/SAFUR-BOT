import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `❀ Ingresa un enlace de TikTok Slide (Imágenes).\n\nEjemplo:\n*${usedPrefix + command}* https://vm.tiktok.com/xEoq8F/`, m);
    
    // Regex para validar URL
    const isUrl = /(?:https:?\/{2})?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/([^\s&]+)/gi.test(text);
    if (!isUrl) return conn.reply(m.chat, 'ꕥ Enlace inválido. Ingresa un link de TikTok.', m);

    await m.react('🕒');

    let images = [];
    let title = 'TikTok Slide';
    let audio = null;
    let source = '';

    // --- INTENTO 1: API Tedzinho (V8) ---
    try {
        const API_KEY = "tedzinho";
        const apiUrl = `https://tedzinho.com.br/api/download/play_audio/v8?apikey=${API_KEY}&nome_url=${encodeURIComponent(text)}`;
        
        const { data } = await axios.get(apiUrl);
        
        // Verificamos si la API trajo imágenes en alguna parte común
        if (data && data.result) {
            // A veces vienen en result.images, otras en result.data.images
            const imgs = data.result.images || data.result.data?.images || [];
            
            if (imgs.length > 0) {
                images = imgs;
                title = data.result.title || title;
                audio = data.result.music;
                source = 'Tedzinho API';
            }
        }
    } catch (e) {
        console.log("Falló Tedzinho V8, pasando a respaldo...");
    }

    // --- INTENTO 2: Respaldo (TikWM - Pública) ---
    // Si la API de pago falló o no trajo imágenes, usamos esta gratis que funciona muy bien para slides.
    if (images.length === 0) {
        try {
            const { data } = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}?hd=1`);
            
            if (data && data.data && data.data.images) {
                images = data.data.images;
                title = data.data.title || title;
                audio = data.data.music;
                source = 'TikWM (Respaldo)';
            }
        } catch (e) {
            console.error(e);
        }
    }

    // --- RESULTADO FINAL ---
    if (images.length === 0) {
        await m.react('✖️');
        return conn.reply(m.chat, `❌ No se encontraron imágenes.\nVerifica que el enlace sea un *Slide de Fotos* y no un video normal.\nPara videos usa *${usedPrefix}tiktok*`, m);
    }

    // Enviar mensaje de éxito
    await conn.reply(m.chat, `✅ Se encontraron *${images.length}* imágenes.\n📡 Fuente: ${source}\nEnviando...`, m);

    try {
        // Enviar imágenes (Modo compatible con todos los bots)
        if (conn.sendSylphy) {
            // Si tienes el plugin de álbumes
            const medias = images.map(url => ({
                type: 'image',
                data: { url },
                caption: `📷 *${title}*`
            }));
            await conn.sendSylphy(m.chat, medias, { quoted: m });
        } else {
            // Modo manual (una por una)
            for (let i = 0; i < images.length; i++) {
                await conn.sendMessage(m.chat, { 
                    image: { url: images[i] }, 
                    caption: (i === 0) ? `❀ *${title}*\n> 📸 (${i + 1}/${images.length})` : null 
                }, { quoted: m });
                // Pequeña pausa para evitar spam
                await new Promise(r => setTimeout(r, 400));
            }
        }

        // Enviar Audio (Si existe)
        if (audio) {
            await conn.sendMessage(m.chat, { 
                audio: { url: audio }, 
                mimetype: 'audio/mp4', 
                fileName: 'slide_audio.mp3',
                ppt: true,
                contextInfo: {
                    externalAdReply: {
                        title: "🎵 Audio del Slide",
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
        conn.reply(m.chat, '⚠️ Ocurrió un error al enviar los archivos.', m);
    }
};

handler.help = ['ttimg', 'tiktokimg', 'ttslide'];
handler.tags = ['downloader'];
handler.command = /^(ttimg|tiktokimg|ttslide)$/i;
handler.limit = 1;

export default handler;