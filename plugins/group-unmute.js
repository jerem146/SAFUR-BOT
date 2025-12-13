/* 
   Guarda o actualiza este archivo en: /plugins/group-mute.js
*/

let handler = async (m, { conn, args, text, usedPrefix, command, participants, isBotAdmin, isAdmin }) => {
    let chat = global.db.data.chats[m.chat]
    
    // 1. Inicializar la base de datos de muteados si no existe en este chat
    if (!chat.mutedUsers) chat.mutedUsers = {}

    // 2. Identificar al usuario objetivo (etiquetado o respondiendo mensaje)
    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    else who = m.chat

    // Validación: Si no etiqueta a nadie
    if (!who) return m.reply(`[ ! ] Debes etiquetar a alguien o responder a un mensaje.\n\n*Ejemplo:* ${usedPrefix + command} @usuario`)

    // Validación: No afectar a administradores
    let groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat) : {}
    let participantsGroup = groupMetadata.participants || []
    let userGroup = participantsGroup.find(u => u.id === who) || {}
    if (userGroup.admin === 'admin' || userGroup.admin === 'superadmin') {
        return m.reply('[ ! ] No puedo gestionar el mute en un administrador del grupo.')
    }

    // --- COMANDO MUTE ---
    if (command === 'mute') {
        if (chat.mutedUsers[who]) {
            return m.reply(`[ ! ] El usuario @${who.split('@')[0]} ya se encuentra silenciado.`, null, { mentions: [who] })
        }
        
        // Agregamos al usuario a la lista con sus contadores en 0
        chat.mutedUsers[who] = {
            count: 0,       // Mensajes eliminados
            warned: false,  // Si ya se le advirtió
            jid: who
        }
        
        await m.reply(`[ 🔇 ] *USUARIO SILENCIADO*\n\n👤 @${who.split('@')[0]} ha sido muteado.\n\n📋 *Reglas:*\n1. Sus mensajes serán borrados.\n2. A los 6 intentos: Advertencia.\n3. A los 9 intentos: Expulsión.`, null, { mentions: [who] })
    } 
    
    // --- COMANDO UNMUTE ---
    else if (command === 'unmute') {
        // Verificar si el usuario realmente estaba muteado
        if (!chat.mutedUsers[who]) {
            return m.reply(`[ ! ] El usuario @${who.split('@')[0]} no estaba muteado.`, null, { mentions: [who] })
        }
        
        // Eliminamos la entrada del usuario de la lista (esto reinicia todo)
        delete chat.mutedUsers[who]
        
        await m.reply(`[ 🔊 ] *USUARIO DESMUTEADO*\n\n👤 @${who.split('@')[0]} ha sido liberado del silencio. Ya puede enviar mensajes.`, null, { mentions: [who] })
    }
}

// Configuración de los comandos
handler.command = /^(mute|unmute)$/i
handler.group = true       // Solo funciona en grupos
handler.admin = true       // Solo admins pueden usarlo
handler.botAdmin = true    // El bot necesita ser admin para borrar/echar

// --------------------------------------------------------------------------------
// LÓGICA AUTOMÁTICA (Listener)
// Se ejecuta cada vez que alguien envía un mensaje
// --------------------------------------------------------------------------------

handler.before = async function (m, { conn, isBotAdmin }) {
    // Validaciones básicas: debe ser grupo, bot debe ser admin, y no debe ser el propio bot
    if (!m.isGroup || m.fromMe || !isBotAdmin) return 
    
    let chat = global.db.data.chats[m.chat]
    
    // Si no hay lista de muteados o el que escribe no está en la lista, no hacemos nada
    if (!chat || !chat.mutedUsers || !chat.mutedUsers[m.sender]) return

    let userMuteData = chat.mutedUsers[m.sender]

    // 1. ELIMINAR EL MENSAJE
    try {
        await conn.sendMessage(m.chat, { delete: m.key })
        userMuteData.count += 1 // Sumamos 1 al contador de infracciones
    } catch (e) {
        console.error("No pude borrar el mensaje, verifica que sea admin.", e)
        return
    }

    // 2. SISTEMA DE ADVERTENCIA (A los 6 mensajes)
    if (userMuteData.count === 6 && !userMuteData.warned) {
        userMuteData.warned = true
        let aviso = `⚠️ *ADVERTENCIA* ⚠️\n\n👤 @${m.sender.split('@')[0]}, estás muteado.\nYa has intentado hablar 6 veces.\n\n⛔ *3 intentos más y serás eliminado del grupo.*`
        await conn.sendMessage(m.chat, { text: aviso, mentions: [m.sender] })
    }

    // 3. SISTEMA DE EXPULSIÓN (A los 9 mensajes: 6 previos + 3 post-advertencia)
    if (userMuteData.count >= 9) {
        let adios = `⛔ *EXPULSIÓN POR MUTE* ⛔\n\n👤 @${m.sender.split('@')[0]} ignoró la advertencia y el silencio.`
        
        // Avisar
        await conn.sendMessage(m.chat, { text: adios, mentions: [m.sender] })
        
        // Eliminar del grupo
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        
        // Limpiar registro (opcional, para que si vuelve a entrar no esté muteado automáticamente, o puedes quitar esta línea si quieres que siga muteado al volver)
        delete chat.mutedUsers[m.sender]
    }
}

export default handler