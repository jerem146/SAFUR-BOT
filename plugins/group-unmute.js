/*
   Archivo: /plugins/group-unmute.js
   Comando: .unmute
*/

let handler = async (m, { conn, usedPrefix, command, chat, args }) => {
    // Inicializar la lista de mute si no existe
    if (!chat.mutedUsers) chat.mutedUsers = {}

    // Obtener el ID del usuario: responder, mencionar o por número
    let who = m.quoted?.sender 
        || m.mentionedJid?.[0] 
        || args[0] 
            ? args[0].replace(/[@ .+-]/g, '') + '@s.whatsapp.net' 
            : null

    if (!who) {
        return m.reply(`💡 *Modo de uso:*\n${usedPrefix + command} @usuario o responde a un mensaje.`)
    }

    // Normalizar ID
    who = conn.decodeJid(who)

    // Verificar si estaba muteado
    if (!chat.mutedUsers[who]) {
        return m.reply(`[ ! ] @${who.split('@')[0]} no está silenciado.`, null, { mentions: [who] })
    }

    // Eliminar de la lista de mute
    delete chat.mutedUsers[who]

    return m.reply(`[ 🔊 ] *USUARIO DESSILENCIADO*\n\n@${who.split('@')[0]} ya puede hablar libremente.`, null, { mentions: [who] })
}

handler.command = /^unmute$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler