/* 
   Guarda este archivo en la carpeta: /plugins/group-mute.js
*/

let handler = async (m, { conn, args, text, usedPrefix, command, participants, isBotAdmin, isAdmin }) => {
    let chat = global.db.data.chats[m.chat]
    
    // Inicializar el objeto de usuarios muteados si no existe
    if (!chat.mutedUsers) chat.mutedUsers = {}

    // Identificar al usuario (etiquetado o respondiendo mensaje)
    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    else who = m.chat

    if (!who) return m.reply(`[ ! ] Debes etiquetar a alguien o responder a su mensaje para usar este comando.\n\n*Ejemplo:* ${usedPrefix + command} @usuario`)

    // Verificar si el objetivo es admin (no se puede mutear/eliminar a un admin)
    let groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat) : {}
    let participantsGroup = groupMetadata.participants || []
    let userGroup = participantsGroup.find(u => u.id === who) || {}
    if (userGroup.admin === 'admin' || userGroup.admin === 'superadmin') {
        return m.reply('[ ! ] No puedo mutear a un administrador del grupo.')
    }

    if (command === 'mute') {
        if (chat.mutedUsers[who]) return m.reply(`[ ! ] El usuario @${who.split('@')[0]} ya está muteado.`, null, { mentions: [who] })
        
        // Agregar usuario a la lista de muteados con contadores en 0
        chat.mutedUsers[who] = {
            count: 0,      // Contador de mensajes eliminados
            warned: false, // Si ya recibió la advertencia
            jid: who
        }
        
        await m.reply(`[ 🔇 ] *USUARIO MUTEADO*\n\nEl usuario @${who.split('@')[0]} ha sido silenciado.\n\n⚠️ *Reglas del Mute:*\n- Sus mensajes serán eliminados.\n- A los 6 mensajes: Recibirá una advertencia.\n- 3 mensajes después de la advertencia: Será eliminado del grupo.`, null, { mentions: [who] })
    } 
    
    else if (command === 'unmute') {
        if (!chat.mutedUsers[who]) return m.reply(`[ ! ] El usuario @${who.split('@')[0]} no estaba muteado.`, null, { mentions: [who] })
        
        delete chat.mutedUsers[who]
        await m.reply(`[ 🔊 ] *USUARIO DESMUTEADO*\n\nEl usuario @${who.split('@')[0]} ya puede hablar libremente.`, null, { mentions: [who] })
    }
}

// Configuración del comando principal
handler.command = /^(mute|unmute)$/i
handler.group = true       // Solo en grupos
handler.admin = true       // Solo admins pueden usarlo
handler.botAdmin = true    // El bot debe ser admin para borrar mensajes y echar gente

// --------------------------------------------------------------------------------
// FUNCIÓN ESPECIAL 'BEFORE': Se ejecuta en cada mensaje que llega
// --------------------------------------------------------------------------------

handler.before = async function (m, { conn, isBotAdmin }) {
    // Si no es un grupo, o el bot no es admin, o el mensaje es del propio bot, ignoramos
    if (!m.isGroup || m.fromMe || !isBotAdmin) return 
    
    let chat = global.db.data.chats[m.chat]
    
    // Verificar si existe la lista y si el que envía el mensaje está en ella
    if (!chat || !chat.mutedUsers || !chat.mutedUsers[m.sender]) return

    let userMuteData = chat.mutedUsers[m.sender]

    // 1. ELIMINAR EL MENSAJE
    try {
        await conn.sendMessage(m.chat, { delete: m.key })
        userMuteData.count += 1 // Aumentar contador
    } catch (e) {
        console.error("Error eliminando mensaje de usuario muteado:", e)
        return // Si falla borrar, no contamos (quizás el bot perdió admin)
    }

    // 2. LÓGICA DE CONTADORES (6 eliminados -> Advertencia -> 3 más -> Kick)

    // Caso: 6 mensajes eliminados (Lanzar advertencia)
    if (userMuteData.count === 6 && !userMuteData.warned) {
        userMuteData.warned = true
        let aviso = `⚠️ *ADVERTENCIA DE MUTE* ⚠️\n\n@${m.sender.split('@')[0]}, has insistido en hablar estando muteado.\nSe han eliminado 6 de tus mensajes.\n\n⛔ *Si envías 3 mensajes más, serás expulsado del grupo.*`
        await conn.sendMessage(m.chat, { text: aviso, mentions: [m.sender] })
    }

    // Caso: 9 mensajes totales (6 + 3 después de advertencia) -> EXPULSIÓN
    if (userMuteData.count >= 9) {
        let adios = `⛔ *EXPULSIÓN AUTOMÁTICA* ⛔\n\n@${m.sender.split('@')[0]} fue eliminado por ignorar el mute y la advertencia.`
        
        // Enviamos el mensaje de despedida
        await conn.sendMessage(m.chat, { text: adios, mentions: [m.sender] })
        
        // Eliminamos al usuario
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        
        // Opcional: Removerlo de la lista de muteados (porque ya no está)
        delete chat.mutedUsers[m.sender]
    }
}

export default handler