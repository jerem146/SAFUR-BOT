// ───────── COMANDO UNMUTE ─────────
if (command === 'unmute') {
    // Buscar la clave exacta dentro de mutedUsers
    let userKey = Object.keys(chat.mutedUsers).find(jid => jid === who)
    
    if (!userKey) {
        return m.reply(
            `[ ! ] El usuario @${who.split('@')[0]} no está muteado.`,
            null,
            { mentions: [who] }
        )
    }

    // Eliminarlo correctamente
    delete chat.mutedUsers[userKey]

    return m.reply(
        `[ 🔊 ] *USUARIO DESMUTEADO*\n\n@${who.split('@')[0]} ya puede hablar.`,
        null,
        { mentions: [who] }
    )
}