const axios = require("axios");

module.exports = {
    name: 'tiktokimg',
    aliases: ['ttimg'],
    description: 'Descarga imágenes de TikTok',

    execute: async (sock, m, args) => {
        const from = m.key.remoteJid;
        const reply = (text) =>
            sock.sendMessage(from, { text }, { quoted: m });

        if (!args.length)
            return reply('❀ Ingresa un enlace de TikTok.');

        const url = args[0];
        if (!/tiktok\.com/.test(url))
            return reply('❀ Enlace de TikTok inválido.');

        try {
            await sock.sendMessage(from, {
                react: { text: '🕒', key: m.key }
            });

            // ✅ URL CORRECTA
            const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
            const res = await axios.get(api);
            const data = res.data?.data;

            if (!data || !Array.isArray(data.images) || data.images.length === 0) {
                await sock.sendMessage(from, { react: { text: '❌', key: m.key } });
                return reply('❀ Este TikTok no contiene imágenes.');
            }

            await reply(`📸 Se encontraron *${data.images.length}* imágenes.`);

            // 🔥 Descargar y reenviar como BUFFER
            for (let i = 0; i < data.images.length; i++) {
                const img = await axios.get(data.images[i], {
                    responseType: "arraybuffer",
                    headers: {
                        "User-Agent": "Mozilla/5.0",
                        "Referer": "https://www.tiktok.com/"
                    }
                });

                await sock.sendMessage(
                    from,
                    {
                        image: img.data,
                        caption: `📸 Imagen ${i + 1}`
                    },
                    { quoted: m }
                );
            }

            await sock.sendMessage(from, {
                react: { text: '✔️', key: m.key }
            });

        } catch (err) {
            console.error("tiktokimg error:", err);
            await sock.sendMessage(from, {
                react: { text: '✖️', key: m.key }
            });
            reply('⚠️ Error al descargar las imágenes de TikTok.');
        }
    }
};