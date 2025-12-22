/*
   Archivo: /plugins/group-unmute.js
   Comando: .unmute
*/

let handler = async (m, { conn, usedPrefix, command, chat, args }) => {
    if (!chat.mutedUsers) chat.mutedUsers = {}

    // Obtener y normalizar el ID de la MISMA FORMA que el mute
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : args[0] ? args[0].replace(/[@ .+-]/g, '') + '@s.whatsapp.net' : ''
    
    if (!who) return m.reply(`💡 *Modo de uso:*\n${usedPrefix + command} @usuario o responde a un mensaje.`)

    // LIMPIEZA TOTAL DEL ID (Muy importante para que coincida con el monitor)
    who = conn.decodeJid(who)

    if (!chat.mutedUsers[who]) {
        return m.reply(`[ ! ] @${who.split('@')[0]} no está en la lista de silenciados.`, null, { mentions: [who] })
    }

    // ELIMINAR DE LA LISTA
    delete chat.mutedUsers[who]

    return m.reply(`[ 🔊 ] *USUARIO DESSILENCIADO*\n\n@${who.split('@')[0]} ya puede hablar libremente.`, null, { mentions: [who] })
}

handler.command = /^unmute$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler