/*
   Archivo: /plugins/group-mute.js
   Comando: .mute
*/

let handler = async (m, { conn, usedPrefix, command, chat, args }) => {
    if (!chat.mutedUsers) chat.mutedUsers = {}

    // Obtener y normalizar el ID (JID)
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : args[0] ? args[0].replace(/[@ .+-]/g, '') + '@s.whatsapp.net' : ''
    
    if (!who) return m.reply(`💡 *Modo de uso:*\n${usedPrefix + command} @usuario o responde a un mensaje.`)

    // LIMPIEZA TOTAL DEL ID (Elimina :1, :2, etc.)
    who = conn.decodeJid(who)

    // Verificar administradores
    let groupMetadata = await conn.groupMetadata(m.chat)
    let participants = groupMetadata.participants
    let isUserAdmin = participants.some(p => p.id === who && p.admin)
    if (isUserAdmin) return m.reply('[ ! ] No puedo mutear a un administrador.')

    if (chat.mutedUsers[who]) return m.reply(`[ ! ] @${who.split('@')[0]} ya está silenciado.`, null, { mentions: [who] })

    // Registrar
    chat.mutedUsers[who] = {
        count: 0,
        warned: false
    }

    return m.reply(`[ 🔇 ] *USUARIO MUTEADO*\n\n@${who.split('@')[0]} fue silenciado.\nReglas: 6 mensajes = Advertencia / 9 = Expulsión.`, null, { mentions: [who] })
}

// MONITOR: Borrado de mensajes
handler.before = async function (m, { conn, isBotAdmin, chat }) {
    if (!m.isGroup || m.fromMe || !isBotAdmin || !chat?.mutedUsers) return false

    // Normalizar el ID de quien envía el mensaje para comparar correctamente
    const sender = conn.decodeJid(m.sender)
    
    if (!chat.mutedUsers[sender]) return false // Si no está en la lista, no hace nada

    let user = chat.mutedUsers[sender]

    try {
        await conn.sendMessage(m.chat, { delete: m.key })
        user.count++
    } catch {
        return false
    }

    if (user.count === 6 && !user.warned) {
        user.warned = true
        await conn.reply(m.chat, `⚠️ @${sender.split('@')[0]}, estás muteado. Evita escribir o serás expulsado.`, null, { mentions: [sender] })
    }

    if (user.count >= 9) {
        await conn.reply(m.chat, `⛔ @${sender.split('@')[0]} eliminado por ignorar el mute.`, null, { mentions: [sender] })
        await conn.groupParticipantsUpdate(m.chat, [sender], 'remove')
        delete chat.mutedUsers[sender]
    }

    return true 
}

handler.command = /^mute$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler