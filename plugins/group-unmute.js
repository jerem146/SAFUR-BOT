/*
   Archivo: /plugins/group-unmute.js
   Comando: UNMUTE por etiqueta o respuesta
*/

// Función auxiliar para normalizar JID
function normalizeJid(jid) {
    return jid.replace(/[\u202A-\u202E]/g, '').split(':')[0]
}

let handler = async (m) => {
    let chat = global.db.data.chats[m.chat]
    if (!chat.mutedUsers) chat.mutedUsers = {}

    // Obtener usuario
    let who = m.quoted?.sender
        || m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || m.chat

    if (!who) return m.reply('💡 Usa: unmute @usuario o responde un mensaje.')

    // Normalizar JID
    let normWho = normalizeJid(who)
    let key = Object.keys(chat.mutedUsers).find(jid => normalizeJid(jid) === normWho)
    if (!key) return m.reply(`[ ! ] @${normWho} no está muteado.`, null, { mentions: [who] })

    delete chat.mutedUsers[key]

    return m.reply(`[ 🔊 ] *USUARIO DESMUTEADO*\n\n@${normWho} ya puede hablar.`, null, { mentions: [who] })
}

// Configuración
handler.command = /^unmute$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler