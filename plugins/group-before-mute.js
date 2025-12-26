handler.before = async function (m, {
  conn,
  chat,
  isBotAdmin
}) {
  if (!m.isGroup || m.fromMe || !isBotAdmin) return false
  if (!chat?.mutedUsers) return false

  // 🔑 MISMA normalización
  const sender = conn.decodeJid(m.sender)

  if (!chat.mutedUsers[sender]) return false

  const user = chat.mutedUsers[sender]

  try {
    await conn.sendMessage(m.chat, { delete: m.key })
    user.count++
  } catch {
    return false
  }

  if (user.count === 6 && !user.warned) {
    user.warned = true
    await conn.reply(
      m.chat,
      `⚠️ @${sender.split('@')[0]} estás muteado.`,
      null,
      { mentions: [sender] }
    )
  }

  if (user.count >= 9) {
    await conn.reply(
      m.chat,
      `⛔ @${sender.split('@')[0]} eliminado por ignorar el mute.`,
      null,
      { mentions: [sender] }
    )
    await conn.groupParticipantsUpdate(m.chat, [sender], 'remove')
    delete chat.mutedUsers[sender]
  }

  return true
}