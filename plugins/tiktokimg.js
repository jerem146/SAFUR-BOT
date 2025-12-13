import fetch from "node-fetch"

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(
            `❌ Ingresa un link de TikTok\n\n` +
            `Ejemplo:\n${usedPrefix + command} https://vm.tiktok.com/xxxx`
        )
    }

    await m.react("🕒")

    try {
        const API_KEY_TED = "tedzinho"
        const url = args[0]

        // 🔹 Ruta GENERAL (no solo fotos)
        const api = `https://tedzinho.com.br/api/download/tiktok?apikey=${API_KEY_TED}&url=${encodeURIComponent(url)}`
        const res = await fetch(api)
        const json = await res.json()

        // 🧪 DEBUG (muy importante)
        console.log("TIKTOK API RESPONSE:", JSON.stringify(json, null, 2))

        if (!json || json.status !== "OK" || !json.resultado) {
            return m.reply("❌ La API no devolvió resultados.")
        }

        const data = json.resultado

        // 🔹 Detectar imágenes
        const images =
            data.images ||
            data.photos ||
            data.image ||
            []

        if (!Array.isArray(images) || images.length === 0) {
            return m.reply("❌ Este TikTok no contiene imágenes (solo video).")
        }

        let caption =
            `🖼️ *TIKTOK IMÁGENES*\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `👤 *Autor:* ${data.author || data.autor || "Desconocido"}\n` +
            `📝 *Descripción:* ${data.title || data.desc || "Sin descripción"}\n` +
            `━━━━━━━━━━━━━━━━━━`

        // Primera imagen
        await conn.sendMessage(
            m.chat,
            { image: { url: images[0] }, caption },
            { quoted: m }
        )

        // Resto
        for (let i = 1; i < images.length; i++) {
            await conn.sendMessage(
                m.chat,
                { image: { url: images[i] } },
                { quoted: m }
            )
        }

        await m.react("✅")

    } catch (e) {
        console.error("ERROR TIKTOK IMG:", e)
        await m.react("❌")
        m.reply("❌ Error interno al procesar TikTok.")
    }
}

handler.command = ["tiktokimg", "ttimg"]
handler.tags = ["downloader"]
handler.help = ["tiktokimg <link>"]

export default handler