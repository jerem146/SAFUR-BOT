/*
   Archivo: /plugins/group-unmute.js
   Comando: .unmute
*/

let handler = async (m, { conn, usedPrefix, command, chat, args }) => {
    if (!chat.mutedUsers) chat.mutedUsers = {}

    // Obtener usuario por respuesta, etiqueta o número
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : args[0] ? args[0].replace(/[@ .+-]/g, '') + '@s.whatsapp.net' : ''

    if (!who) return m.reply(`💡 *Modo de uso:*\n${usedPrefix + command} @usuario o responde a un mensaje.`)

    if (!chat.mutedUsers[who]) {
        return m.reply(`[ ! ] El usuario @${who.split('@')[0]} no está en la lista de silenciados.`, null, { mentions: [who] })
    }

    // Eliminar de la lista de muteados
    delete chat.mutedUsers[who]

    return m.reply(
        `[ 🔊 ] *USUARIO DESMUTEADO*\n\n@${who.split('@')[0]} ya puede hablar normalmente.`,
        null,
        { mentions: [who] }
    )
}

handler.command = /^unmute$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler