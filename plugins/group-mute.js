/*
   Archivo: /plugins/group-mute.js
   Comando: .mute
   Lógica: Borrado, conteo y expulsión.
*/

let handler = async (m, { conn, usedPrefix, command, isBotAdmin, chat, args }) => {
    if (!chat.mutedUsers) chat.mutedUsers = {}

    // Obtener usuario por respuesta, etiqueta o número
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : args[0] ? args[0].replace(/[@ .+-]/g, '') + '@s.whatsapp.net' : ''

    if (!who) return m.reply(`💡 *Modo de uso:*\n${usedPrefix + command} @usuario o responde a un mensaje.`)

    // Verificar si es administrador
    let groupMetadata = await conn.groupMetadata(m.chat)
    let participant = groupMetadata.participants.find(u => u.id === who)

    if (participant?.admin) return m.reply('[ ! ] No puedo mutear a un administrador.')

    if (chat.mutedUsers[who]) return m.reply(`[ ! ] El usuario @${who.split('@')[0]} ya está muteado.`, null, { mentions: [who] })

    // Registrar en la base de datos
    chat.mutedUsers[who] = {
        count: 0,
        warned: false,
        jid: who
    }

    return m.reply(
        `[ 🔇 ] *USUARIO MUTEADO*\n\n` +
        `@${who.split('@')[0]} fue silenciado.\n\n` +
        `⚠️ *Reglas:*\n` +
        `• Mensajes eliminados automáticamente.\n` +
        `• 6 mensajes → Advertencia.\n` +
        `• 9 mensajes → Expulsión automática.`,
        null,
        { mentions: [who] }
    )
}

// MONITOR DE MENSAJES (Se ejecuta siempre)
handler.before = async function (m, { conn, isBotAdmin, chat, isAdmin }) {
    if (!m.isGroup || m.fromMe || !isBotAdmin || !chat?.mutedUsers?.[m.sender]) return

    // Si el usuario es admin (por si lo ascendieron), no aplicamos el mute
    if (isAdmin) return

    let user = chat.mutedUsers[m.sender]

    try {
        // Borrar el mensaje enviado por el muteado
        await conn.sendMessage(m.chat, { delete: m.key })
        user.count++
    } catch {
        return
    }

    // Advertencia al llegar a 6 mensajes
    if (user.count === 6 && !user.warned) {
        user.warned = true
        await conn.sendMessage(m.chat, {
            text: `⚠️ *ADVERTENCIA*\n\n@${m.sender.split('@')[0]}, estás muteado. Si envías 3 mensajes más, serás expulsado.`,
            mentions: [m.sender]
        })
    }

    // Expulsión al llegar a 9 mensajes
    if (user.count >= 9) {
        await conn.sendMessage(m.chat, {
            text: `⛔ *EXPULSIÓN AUTOMÁTICA*\n\n@${m.sender.split('@')[0]} fue eliminado por ignorar repetidamente el mute.`,
            mentions: [m.sender]
        })

        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        delete chat.mutedUsers[m.sender] // Limpiar registro tras expulsar
    }
    
    return // No permitimos que el handler siga procesando este mensaje
}

handler.command = /^mute$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler