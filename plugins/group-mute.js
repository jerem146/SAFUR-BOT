/*
   Archivo: /plugins/group-mute.js
   Comando: MUTE por etiqueta o respuesta
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
    if (participant?.admin) return m.reply('[ ! ] No puedo mutear a un administrador.')

    // ───────── COMANDO MUTE ─────────
    let key = Object.keys(chat.mutedUsers).find(jid => jid.split(':')[0] === who.split(':')[0])
    if (key) {
        return m.reply(`[ ! ] @${who.split('@')[0]} ya está muteado.`, null, { mentions: [who] })
    }

    chat.mutedUsers[who] = { count: 0, warned: false, jid: who }

    return m.reply(
        `[ 🔇 ] *USUARIO MUTEADO*\n\n@${who.split('@')[0]} fue silenciado.\n⚠️ Reglas:\n• Mensajes eliminados\n• 6 mensajes → advertencia\n• 3 más → expulsión`,
        null,
        { mentions: [who] }
    )
}

// ───────── CONFIGURACIÓN ─────────
handler.command = /^mute$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler