/*
  Comando: mute
  Compatible con tu handler (user.muto + deleteCount)
*/

let handler = async (m, { conn, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin && !isOwner) return
  if (!isBotAdmin) return

  // usuario objetivo
  let who =
    m.quoted?.sender ||
    m.mentionedJid?.[0]

  if (!who) {
    return conn.reply(
      m.chat,
      '✦ Responde o menciona al usuario que deseas mutear.',
      m
    )
  }

  let user = global.db.data.users[who]
  if (!user) return

  // ya muteado
  if (user.muto) {
    return conn.reply(
      m.chat,
      `✦ @${who.split('@')[0]} ya está muteado.`,
      m,
      { mentions: [who] }
    )
  }

  // activar mute
  user.muto = true
  user.deleteCount = 0

  await conn.reply(
    m.chat,
    `🔇 @${who.split('@')[0]} fue muteado.`,
    m,
    { mentions: [who] }
  )
}

handler.command = ['mute']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler