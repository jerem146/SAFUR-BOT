/*
   Archivo: /plugins/group-unmute.js
   Comando: UNMUTE por etiqueta o respuesta
*/

let handler = async (m, { command }) => {
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

    // ───────── COMANDO UNMUTE ─────────
    let key = Object.keys(chat.mutedUsers).find(jid => jid.split(':')[0] === who.split(':')[0])
    if (!key) return m.reply(`[ ! ] @${who.split('@')[0]} no está muteado.`, null, { mentions: [who] })

    delete chat.mutedUsers[key]

    return m.reply(`[ 🔊 ] *USUARIO DESMUTEADO*\n\n@${who.split('@')[0]} ya puede hablar.`, null, { mentions: [who] })
}

// ───────── CONFIGURACIÓN ─────────
handler.command = /^unmute$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler