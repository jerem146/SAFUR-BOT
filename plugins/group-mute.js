/*
   Archivo: /plugins/group-mute.js
   Comando: .mute
*/

let handler = async (m, { conn, usedPrefix, command, chat }) => {
    if (!chat.mutedUsers) chat.mutedUsers = {}

    let who

    // 1️⃣ RESPONDER MENSAJE
    if (m.quoted) {
        who = m.quoted.sender
    }
    // 2️⃣ ETIQUETAR @usuario
    else if (m.mentionedJid && m.mentionedJid.length) {
        who = m.mentionedJid[0]
    }

    if (!who) {
        return m.reply(`💡 *Uso correcto:*\n${usedPrefix + command} @usuario\nO responde a su mensaje.`)
    }

    // LIMPIEZA REAL
    who = conn.decodeJid(who)

    // METADATA
    let groupMetadata = await conn.groupMetadata(m.chat)
    let participants = groupMetadata.participants

    // NO ADMIN
    let isAdmin = participants.find(p => p.id === who)?.admin
    if (isAdmin) return m.reply('[ ! ] No puedo mutear a un administrador.')

    if (chat.mutedUsers[who]) {
        return m.reply(`[ ! ] @${who.split('@')[0]} ya está silenciado.`, null, { mentions: [who] })
    }

    // REGISTRAR MUTE
    chat.mutedUsers[who] = {
        count: 0,
        warned: false
    }

    return m.reply(
        `[ 🔇 ] *USUARIO MUTEADO*\n\n@${who.split('@')[0]} fue silenciado.\nReglas: 6 mensajes = Advertencia / 9 = Expulsión.`,
        null,
        { mentions: [who] }
    )
}

// 🔍 MONITOR
handler.before = async function (m, { conn, isBotAdmin, chat }) {
    if (!m.isGroup || m.fromMe || !isBotAdmin || !chat?.mutedUsers) return false

    let sender = conn.decodeJid(m.sender)

    if (!chat.mutedUsers[sender]) return false

    let user = chat.mutedUsers[sender]

    try {
        await conn.sendMessage(m.chat, { delete: m.key })
        user.count++
    } catch {
        return false
    }

    if (user.count === 6 && !user.warned) {
        user.warned = true
        await conn.reply(
            m.chat,
            `⚠️ @${sender.split('@')[0]}, estás muteado. Última advertencia.`,
            null,
            { mentions: [sender] }
        )
    }

    if (user.count >= 9) {
        await conn.reply(
            m.chat,
            `⛔ @${sender.split('@')[0]} eliminado por ignorar el mute.`,
            null,
            { mentions: [sender] }
        )
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