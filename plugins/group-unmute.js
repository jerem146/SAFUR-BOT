// ───────── COMANDO UNMUTE ─────────
if (command === 'unmute') {

    // Buscar el JID exacto existente
    let userKey = Object.keys(chat.mutedUsers).find(j => j === who)

    if (!userKey) {
        return m.reply(
            `[ ! ] El usuario @${who.split('@')[0]} no está muteado.`,
            null,
            { mentions: [who] }
        )
    }

    delete chat.mutedUsers[userKey]

    return m.reply(
        `[ 🔊 ] *USUARIO DESMUTEADO*\n\n@${who.split('@')[0]} ya puede hablar.`,
        null,
        { mentions: [who] }
    )
}