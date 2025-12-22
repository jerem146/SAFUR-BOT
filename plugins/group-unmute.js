/*  
   Archivo: /plugins/group-unmute.js
   Desmute por etiqueta o respuesta (FIXED)
*/

let handler = async (m, { conn, command }) => {

    let chat = global.db.data.chats[m.chat]
    if (!chat.mutedUsers) chat.mutedUsers = {}

    let who = null

    // Obtener usuario por respuesta o etiqueta
    if (m.isGroup) {

        // Respuesta
        if (m.quoted?.sender) {
            who = m.quoted.sender
        }

        // Etiquetado
        else if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
            who = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
        }

    } else {
        who = m.chat
    }

    if (!who) {
        return m.reply(
            `💡 *Usa:* unmute @usuario o responde un mensaje.`
        )
    }

    // verificar si está muteado
    if (!chat.mutedUsers[who]) {
        return m.reply(
            `[ ! ] El usuario @${who.split('@')[0]} no está muteado.`,
            null,
            { mentions: [who] }
        )
    }

    delete chat.mutedUsers[who]

    return m.reply(
        `[ 🔊 ] *USUARIO DESMUTEADO*\n\n@${who.split('@')[0]} ahora puede hablar.`,
        null,
        { mentions: [who] }
    )
}

handler.command = /^unmute$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler