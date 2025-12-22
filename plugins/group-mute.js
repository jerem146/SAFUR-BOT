/*
   Archivo: /plugins/group-mute.js
*/

let handler = async (m, { conn, usedPrefix, command, chat, args }) => {
    if (!chat.mutedUsers) chat.mutedUsers = {}

    // Obtener el ID correctamente (Normalizado)
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : args[0] ? args[0].replace(/[@ .+-]/g, '') + '@s.whatsapp.net' : ''
    
    // Fallback por si el handler no procesó bien la etiqueta
    if (!who && m.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
        who = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
    }

    if (!who) return m.reply(`💡 *Modo de uso:*\n${usedPrefix + command} @usuario o responde a un mensaje.`)
    
    who = conn.decodeJid(who) // Normalizar ID (Quita el :1, :2 etc)

    // Verificar si es administrador
    let groupMetadata = await conn.groupMetadata(m.chat)
    let participants = groupMetadata.participants
    let isUserAdmin = participants.some(p => p.id === who && p.admin)

    if (isUserAdmin) return m.reply('[ ! ] No puedo mutear a un administrador.')

    if (chat.mutedUsers[who]) return m.reply(`[ ! ] @${who.split('@')[0]} ya está silenciado.`, null, { mentions: [who] })

    // Guardar en base de datos
    chat.mutedUsers[who] = {
        count: 0,
        warned: false,
        jid: who
    }

    return m.reply(
        `[ 🔇 ] *USUARIO MUTEADO*\n\n` +
        `👤 *Usuario:* @${who.split('@')[0]}\n` +
        `⚠️ *Reglas:*\n` +
        `• Mensajes eliminados automáticamente.\n` +
        `• 6 mensajes → Advertencia.\n` +
        `• 9 mensajes → Expulsión.`,
        null,
        { mentions: [who] }
    )
}

// MONITOR: Se ejecuta antes que los comandos
handler.before = async function (m, { conn, isBotAdmin, chat }) {
    if (!m.isGroup || m.fromMe || !isBotAdmin || !chat?.mutedUsers) return false

    const sender = conn.decodeJid(m.sender) // Normalizar el que envía el mensaje
    if (!chat.mutedUsers[sender]) return false

    // Si está en la lista de muteados, procedemos
    let user = chat.mutedUsers[sender]

    try {
        await conn.sendMessage(m.chat, { delete: m.key })
        user.count++
    } catch {
        return false
    }

    // Advertencia
    if (user.count === 6 && !user.warned) {
        user.warned = true
        await conn.reply(m.chat, `⚠️ @${sender.split('@')[0]}, estás muteado. Si envías 3 mensajes más serás expulsado.`, null, { mentions: [sender] })
    }

    // Expulsión
    if (user.count >= 9) {
        await conn.reply(m.chat, `⛔ @${sender.split('@')[0]} expulsado por ignorar el mute.`, null, { mentions: [sender] })
        await conn.groupParticipantsUpdate(m.chat, [sender], 'remove')
        delete chat.mutedUsers[sender]
    }

    return true // Detener el handler para este mensaje
}

handler.command = /^mute$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler