let handler = async (m, { conn, text, command }) => {
    let who
    if (m.isGroup) {
        // Primero intentamos por mención o respuesta (esto captura el ID correcto ya sea LID o normal)
        who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
        
        // Si no hay mención ni respuesta, intentamos por texto
        if (!who && text) {
            let clean = text.replace(/[^0-9]/g, '')
            if (clean) who = clean + '@s.whatsapp.net'
        }
    } else {
        who = m.chat
    }
    
    if (!who) throw `*⚠️ Etiqueta o responde al mensaje de alguien para usar .${command}*`
    
    // Inicializar usuario si no existe en la base de datos (con LID o ID normal)
    if (!global.db.data.users[who]) global.db.data.users[who] = {
        name: await conn.getName(who),
        muto: false,
        deleteCount: 0
    }
    
    let user = global.db.data.users[who]

    if (command === 'mute') {
        if (user.muto) throw `*El usuario ya está muteado.*`
        user.muto = true
        user.deleteCount = 0
        await conn.reply(m.chat, `✅ *@${who.split('@')[0]}* ha sido muteado.\n\nSus mensajes serán borrados automáticamente.\nAdvertencia a los 7 y eliminación a los 11.`, m, { mentions: [who] })
    }

    if (command === 'unmute') {
        if (!user.muto) throw `*El usuario no está muteado.*`
        user.muto = false
        user.deleteCount = 0
        await conn.reply(m.chat, `✅ *@${who.split('@')[0]}* ha sido desmuteado.`, m, { mentions: [who] })
    }
}
handler.help = ['mute', 'unmute']
handler.tags = ['admin']
handler.command = ['mute', 'unmute']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler