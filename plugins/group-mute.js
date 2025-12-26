/*
  Comando: mute
  Funciona con responder y etiquetar (handler-compatible)
*/

let handler = async (m, { conn, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin && !isOwner) return
  if (!isBotAdmin) return

  let who = null

  // 1️⃣ responder mensaje
  if (m.quoted?.sender) {
    who = m.quoted.sender
  }

  // 2️⃣ mencionar normal
  else if (m.mentionedJid && m.mentionedJid.length) {
    who = m.mentionedJid[0]
  }

  // 3️⃣ mención desde contextInfo (FIX REAL)
  else if (
    m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length
  ) {
    who = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  }

  if (!who) {
    return conn.reply(
      m.chat,
      '✦ Responde o etiqueta al usuario que deseas mutear.',
      m
    )
  }

  let user = global.db.data.users[who]
  if (!user) return

  if (user.muto) {
    return conn.reply(
      m.chat,
      `✦ @${who.split('@')[0]} ya está muteado.`,
      m,
      { mentions: [who] }
    )
  }

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