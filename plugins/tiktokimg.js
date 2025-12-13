// TikTok Image Downloader
// API: Tedzinho
// Sin registro / sin coins

const axios = require("axios");

module.exports = {
    name: 'tiktokimg',
    aliases: ['ttimg'],
    description: 'Descarga imágenes de TikTok (Photo Mode)',

    execute: async (sock, m, args) => {
        const from = m.key.remoteJid;
        const reply = (txt) => sock.sendMessage(from, { text: txt }, { quoted: m });

        if (!args[0]) return reply('❌ Ingresa el link del TikTok.\nEjemplo:\n.tiktokimg https://vt.tiktok.com/xxxxx');

        const url = args[0];
        const isTikTok = /(tiktok\.com|vt\.tiktok\.com)/i.test(url);
        if (!isTikTok) return reply('❌ Enlace de TikTok no válido.');

        try {
            await sock.sendMessage(from, { react: { text: '🕓', key: m.key } });

            // 🔹 API Tedzinho (TikTok download)
            const api = `https://tedzinho.com.br/api/download/tiktok?apikey=tedzinho&url=${encodeURIComponent(url)}`;
            const res = await axios.get(api);
            const data = res.data;

            if (!data || data.status !== "OK" || !data.resultado) {
                throw new Error("Respuesta inválida de la API");
            }

            const r = data.resultado;

            if (r.type !== "image" || !Array.isArray(r.images) || r.images.length === 0) {
                return reply('❌ Este TikTok no contiene imágenes.');
            }

            // 📌 Info opcional
            const captionInfo =
                `📸 *TikTok Images*\n` +
                `👤 ${r.author?.nickname || 'Desconocido'}\n` +
                `❤️ ${r.statistics?.likeCount || 0} | 💬 ${r.statistics?.commentCount || 0}`;

            await reply(`📥 Encontradas *${r.images.length}* imágenes. Enviando...`);

            // 🔽 Enviar imágenes UNA POR UNA
            for (let i = 0; i < r.images.length; i++) {
                const img = r.images[i];

                await sock.sendMessage(
                    from,
                    {
                        image: { url: img },
                        caption: i === 0 ? captionInfo : undefined
                    },
                    { quoted: m }
                );
            }

            await sock.sendMessage(from, { react: { text: '✅', key: m.key } });

        } catch (err) {
            console.error('TIKTOK IMG ERROR:', err.message);
            await sock.sendMessage(from, { react: { text: '❌', key: m.key } });
            reply('❌ Error al descargar las imágenes del TikTok.');
        }
    }
};

// 🔓 SIN BLOQUEOS
// NO handler.register
// NO handler.coin
// NO handler.group