/*
  Comando: unmute
  Compatible con tu handler (user.muto)
*/

let handler = async (m, { conn, isAdmin, isOwner }) => {
  if (!m.isGroup) return
  if (!isAdmin && !isOwner) return

  // usuario objetivo
  let who =
    m.quoted?.sender ||
    m.mentionedJid?.[0]

  if (!who) {
    return conn.reply(
      m.chat,
      '✦ Responde o menciona al usuario que deseas desmutear.',
      m
    )
  }

  let user = global.db.data.users[who]
  if (!user) return

  // no está muteado
  if (!user.muto) {
    return conn.reply(
      m.chat,
      `✦ @${who.split('@')[0]} no está muteado.`,
      m,
      { mentions: [who] }
    )
  }

  // desactivar mute
  user.muto = false
  user.deleteCount = 0

  await conn.reply(
    m.chat,
    `🔊 @${who.split('@')[0]} fue desmuteado.`,
    m,
    { mentions: [who] }
  )
}

handler.command = ['unmute']
handler.group = true
handler.admin = true

export default handler