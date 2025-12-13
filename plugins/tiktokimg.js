import fetch from "node-fetch"

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(
            `❌ Ingresa el link del TikTok\n\n` +
            `📌 Ejemplo:\n${usedPrefix + command} https://www.tiktok.com/@user/photo/xxxx`
        )
    }

    await m.react("🖼️")

    try {
        const API_KEY_TED = "tedzinho"
        const url = args[0]

        const api = `https://tedzinho.com.br/api/download/tiktok_photo?apikey=${API_KEY_TED}&url=${encodeURIComponent(url)}`
        const res = await fetch(api)
        const json = await res.json()

        if (!json || json.status !== "OK" || !json.resultado) {
            throw "No se pudo obtener información"
        }

        const {
            title,
            author,
            images,
            likes,
            comments,
            shares
        } = json.resultado

        if (!images || images.length === 0) {
            return m.reply("❌ Este TikTok no contiene imágenes.")
        }

        let caption =
            `🖼️ *TIKTOK IMÁGENES*\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `👤 *Autor:* ${author || "Desconocido"}\n` +
            `📝 *Descripción:* ${title || "Sin descripción"}\n` +
            `❤️ *Likes:* ${likes || 0}\n` +
            `💬 *Comentarios:* ${comments || 0}\n` +
            `🔁 *Compartidos:* ${shares || 0}\n` +
            `━━━━━━━━━━━━━━━━━━`

        // Primera imagen con texto
        await conn.sendMessage(
            m.chat,
            { image: { url: images[0] }, caption },
            { quoted: m }
        )

        // Resto de imágenes
        for (let i = 1; i < images.length; i++) {
            await conn.sendMessage(
                m.chat,
                { image: { url: images[i] } },
                { quoted: m }
            )
        }

        await m.react("✅")

    } catch (e) {
        console.error(e)
        await m.react("❌")
        m.reply("❌ Error al descargar imágenes del TikTok.")
    }
}

handler.command = ["tiktokimg", "ttimg", "ttfoto"]
handler.tags = ["downloader"]
handler.help = ["tiktokimg <link>"]

export default handler