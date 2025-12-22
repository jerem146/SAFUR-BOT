/*
   Archivo: /plugins/group-unmute.js
*/

let handler = async (m, { conn, usedPrefix, command, chat, args }) => {
    if (!chat.mutedUsers) chat.mutedUsers = {}

    // Obtener el ID de la misma forma que en el mute
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : args[0] ? args[0].replace(/[@ .+-]/g, '') + '@s.whatsapp.net' : ''
    
    if (!who && m.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
        who = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
    }

    if (!who) return m.reply(`💡 *Modo de uso:*\n${usedPrefix + command} @usuario o responde a un mensaje.`)

    who = conn.decodeJid(who) // IMPORTANTE: Normalizar para encontrar la clave en el objeto

    if (!chat.mutedUsers[who]) {
        return m.reply(`[ ! ] @${who.split('@')[0]} no está en la lista de silenciados.`, null, { mentions: [who] })
    }

    // Eliminar de la base de datos
    delete chat.mutedUsers[who]

    return m.reply(
        `[ 🔊 ] *USUARIO DESSILENCIADO*\n\n@${who.split('@')[0]} ya puede hablar nuevamente.`,
        null,
        { mentions: [who] }
    )
}

handler.command = /^unmute$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler