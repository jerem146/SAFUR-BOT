import fetch from "node-fetch"

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(
            `❌ Ingresa un link de TikTok\n\n` +
            `Ejemplo:\n${usedPrefix + command} https://vt.tiktok.com/xxxx`
        )
    }

    await m.react("📦")

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

        if (data.type !== "image" || !Array.isArray(data.images)) {
            return m.reply("❌ Este TikTok no es un post de imágenes.")
        }

        const autor = data.author?.nickname || data.author?.uniqueId || "Desconocido"
        const descripcion = data.desc || "Sin descripción"

        await m.reply(
            `🖼️ *TIKTOK IMÁGENES*\n\n` +
            `👤 Autor: ${autor}\n` +
            `📝 ${descripcion}\n\n` +
            `📦 Enviando imágenes como archivos descargables...`
        )

        // 🔥 ENVIAR COMO DOCUMENTO (NO COMO IMAGE)
        for (let i = 0; i < data.images.length; i++) {
            const imgRes = await fetch(data.images[i], {
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Referer": "https://www.tiktok.com/"
                }
            })

            const buffer = await imgRes.buffer()

            await conn.sendMessage(
                m.chat,
                {
                    document: buffer,
                    mimetype: "image/webp",
                    fileName: `tiktok_img_${i + 1}.webp`
                },
                { quoted: m }
            )
        }

        await m.react("✅")

    } catch (e) {
        console.error("TIKTOK IMG ERROR:", e)
        await m.react("❌")
        m.reply("❌ Error al descargar las imágenes de TikTok.")
    }
}

handler.command = ["tiktokimg", "ttimg"]
handler.tags = ["downloader"]
handler.help = ["tiktokimg <link>"]

export default handler