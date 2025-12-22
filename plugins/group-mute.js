/*
   Archivo: /plugins/group-mute.js
   Mute / Unmute por etiqueta o respuesta (FIXED)
*/

let handler = async (m, { conn, command }) => {
    let chat = global.db.data.chats[m.chat]
    if (!chat.mutedUsers) chat.mutedUsers = {}

    // ───────── OBTENER USUARIO (RESPUESTA O ETIQUETA) ─────────
    let who = null
    if (m.isGroup) {
        if (m.quoted?.sender) who = m.quoted.sender
        else if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
            who = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
        }
    } else who = m.chat

    if (!who) return m.reply(`💡 Usa: ${command} @usuario o responde un mensaje.`)

    // ───────── VERIFICAR SI ES ADMIN ─────────
    let groupMetadata = await conn.groupMetadata(m.chat)
    let participant = groupMetadata.participants.find(u => u.id === who)
    if (participant?.admin && command === 'mute') {
        return m.reply('[ ! ] No puedo mutear a un administrador.')
    }

    // ───────── COMANDO MUTE ─────────
    if (command === 'mute') {
        if (chat.mutedUsers[who]) {
            return m.reply(`[ ! ] @${who.split('@')[0]} ya está muteado.`, null, { mentions: [who] })
        }
        chat.mutedUsers[who] = { count: 0, warned: false, jid: who }
        return m.reply(
            `[ 🔇 ] *USUARIO MUTEADO*\n\n@${who.split('@')[0]} fue silenciado.\n⚠️ Reglas: mensajes eliminados, 6 mensajes → advertencia, 3 más → expulsión.`,
            null,
            { mentions: [who] }
        )
    }

    // ───────── COMANDO UNMUTE ─────────
    if (command === 'unmute') {
        // Buscar clave exacta dentro de mutedUsers
        let key = Object.keys(chat.mutedUsers).find(jid => jid.split(':')[0] === who.split(':')[0])
        if (!key) {
            return m.reply(`[ ! ] @${who.split('@')[0]} no está muteado.`, null, { mentions: [who] })
        }
        delete chat.mutedUsers[key]
        return m.reply(`[ 🔊 ] *USUARIO DESMUTEADO*\n\n@${who.split('@')[0]} ya puede hablar.`, null, { mentions: [who] })
    }
}

// ───────── CONFIGURACIÓN ─────────
handler.command = /^(mute|unmute)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

// ───────── BEFORE (BORRADO AUTOMÁTICO) ─────────
handler.before = async function (m, { conn, isBotAdmin }) {
    if (!m.isGroup || m.fromMe || !isBotAdmin) return
    let chat = global.db.data.chats[m.chat]
    if (!chat?.mutedUsers) return

    // Buscar clave exacta que coincida con m.sender
    let key = Object.keys(chat.mutedUsers).find(jid => jid.split(':')[0] === m.sender.split(':')[0])
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

export default handler