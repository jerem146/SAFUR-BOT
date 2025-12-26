let handler = async (m, { conn, text, command }) => {
    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false
    else who = m.chat
    
    if (!who) throw `*⚠️ Etiqueta o responde al mensaje de alguien para usar .${command}*`
    
    // Inicializar si no existe
    if (!global.db.data.users[who]) global.db.data.users[who] = { muto: false, deleteCount: 0 }
    
    let user = global.db.data.users[who]

    if (command === 'mute') {
        if (user.muto) throw `*Este usuario ya está muteado.*`
        user.muto = true
        user.deleteCount = 0
        await conn.reply(m.chat, `✅ *@${who.split`@`[0]}* ha sido muteado.\n\nSus mensajes serán borrados automáticamente. Al mensaje 7 recibirá advertencia y al 11 será expulsado.`, m, { mentions: [who] })
    }

    if (command === 'unmute') {
        if (!user.muto) throw `*Este usuario no estaba muteado.*`
        user.muto = false
        user.deleteCount = 0
        await conn.reply(m.chat, `✅ *@${who.split`@`[0]}* ya puede hablar libremente.`, m, { mentions: [who] })
    }
}
handler.help = ['mute', 'unmute']
handler.tags = ['admin']
handler.command = ['mute', 'unmute']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler