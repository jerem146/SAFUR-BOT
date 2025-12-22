/*
   Archivo: /plugins/group-mute-before.js
   BEFORE: borrado automático de mensajes muteados, advertencias y expulsión
*/

// Función auxiliar para normalizar JID
function normalizeJid(jid) {
    return jid.replace(/[\u202A-\u202E]/g, '').split(':')[0]
}

let handler = async function (m, { conn, isBotAdmin }) {
    if (!m.isGroup || m.fromMe || !isBotAdmin) return
    let chat = global.db.data.chats[m.chat]
    if (!chat?.mutedUsers) return

    // Buscar clave exacta
    let key = Object.keys(chat.mutedUsers).find(jid => normalizeJid(jid) === normalizeJid(m.sender))
    if (!key) return
    let user = chat.mutedUsers[key]

    try {
        await conn.sendMessage(m.chat, { delete: m.key })
        user.count++
    } catch { return }

    // Advertencia
    if (user.count === 6 && !user.warned) {
        user.warned = true
        await conn.sendMessage(m.chat, {
            text: `⚠️ *ADVERTENCIA*\n\n@${m.sender.split('@')[0]}, sigues hablando estando muteado.\n⛔ 3 mensajes más = expulsión.`,
            mentions: [m.sender]
        })
    }

    // Expulsión
    if (user.count >= 9) {
        await conn.sendMessage(m.chat, {
            text: `⛔ *EXPULSIÓN AUTOMÁTICA*\n\n@${m.sender.split('@')[0]} fue eliminado por ignorar el mute.`,
            mentions: [m.sender]
        })
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        delete chat.mutedUsers[key]
    }
}

handler.before = true
export default handler