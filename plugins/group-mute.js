/*
   Archivo: /plugins/group-mute.js
   Comando: MUTE por etiqueta o respuesta
*/

// Función auxiliar para normalizar JID
function normalizeJid(jid) {
    return jid.replace(/[\u202A-\u202E]/g, '').split(':')[0]
}

let handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat]
    if (!chat.mutedUsers) chat.mutedUsers = {}

    // Obtener usuario
    let who = m.quoted?.sender
        || m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || m.chat

    if (!who) return m.reply('💡 Usa: mute @usuario o responde un mensaje.')

    // Verificar admin
    let groupMetadata = await conn.groupMetadata(m.chat)
    let participant = groupMetadata.participants.find(u => u.id === who)
    if (participant?.admin) return m.reply('[ ! ] No puedo mutear a un administrador.')

    // Normalizar JID
    let normWho = normalizeJid(who)
    let key = Object.keys(chat.mutedUsers).find(jid => normalizeJid(jid) === normWho)
    if (key) return m.reply(`[ ! ] @${normWho} ya está muteado.`, null, { mentions: [who] })

    chat.mutedUsers[who] = { count: 0, warned: false, jid: who }

    return m.reply(`[ 🔇 ] *USUARIO MUTEADO*\n\n@${normWho} fue silenciado.`, null, { mentions: [who] })
}

// Configuración
handler.command = /^mute$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler