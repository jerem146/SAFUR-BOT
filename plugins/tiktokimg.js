import fetch from "node-fetch"

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(
            `❌ Ingresa un link de TikTok\n\n` +
            `Ejemplo:\n${usedPrefix + command} https://vt.tiktok.com/xxxx`
        )
    }

    await m.react("🖼️")

    try {
        const API_KEY_TED = "tedzinho"
        const url = args[0]

        const api = `https://tedzinho.com.br/api/download/tiktok?apikey=${API_KEY_TED}&url=${encodeURIComponent(url)}`
        const res = await fetch(api)
        const json = await res.json()

        if (!json || json.status !== "OK" || !json.resultado) {
            return m.reply("❌ La API no devolvió resultados.")
        }

        const data = json.resultado

        // ✅ Validar que sea post de imágenes
        if (data.type !== "image" || !Array.isArray(data.images)) {
            return m.reply("❌ Este TikTok no es un post de imágenes.")
        }

        // ✅ Datos correctos
        const autor = data.author?.nickname || data.author?.uniqueId || "Desconocido"
        const descripcion = data.desc || "Sin descripción"
        const likes = data.statistics?.likeCount || 0
        const comentarios = data.statistics?.commentCount || 0
        const compartidos = data.statistics?.shareCount || 0
        const imagenes = data.images

        let caption =
            `🖼️ *TIKTOK IMÁGENES*\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `👤 *Autor:* ${autor}\n` +
            `📝 *Descripción:* ${descripcion}\n` +
            `❤️ *Likes:* ${likes}\n` +
            `💬 *Comentarios:* ${comentarios}\n` +
            `🔁 *Compartidos:* ${compartidos}\n` +
            `━━━━━━━━━━━━━━━━━━`

        // 🔹 Primera imagen con texto
        await conn.sendMessage(
            m.chat,
            { image: { url: imagenes[0] }, caption },
            { quoted: m }
        )

        // 🔹 Resto de imágenes
        for (let i = 1; i < imagenes.length; i++) {
            await conn.sendMessage(
                m.chat,
                { image: { url: imagenes[i] } },
                { quoted: m }
            )
        }

        await m.react("✅")

    } catch (e) {
        console.error("TIKTOK IMG ERROR:", e)
        await m.react("❌")
        m.reply("❌ Error al procesar las imágenes de TikTok.")
    }
}

handler.command = ["tiktokimg", "ttimg"]
handler.tags = ["downloader"]
handler.help = ["tiktokimg <link>"]

export default handler