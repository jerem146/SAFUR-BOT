/*
  MUTE compatible con TU handler
  Funciona con:
  - Responder ✅
  - Etiquetar contacto ✅
  - Escribir @51999999999 ✅
*/

function getTarget(m) {
  // 1) responder
  if (m.quoted?.sender) return m.quoted.sender

  // 2) mención real
  if (m.mentionedJid && m.mentionedJid.length) {
    return m.mentionedJid[0]
  }

  // 3) parsear @numero del texto
  let text = m.text || ""
  let match = text.match(/@(\d{5,20})/)
  if (match) return match[1] + "@s.whatsapp.net"

  return null
}

let handler = async (m, { conn, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin && !isOwner) return
  if (!isBotAdmin) return

  let who = getTarget(m)
  if (!who) {
    return conn.reply(
      m.chat,
      "✦ Responde al mensaje o etiqueta al usuario (@numero).",
      m
    )
  }

  let user = global.db.data.users[who]
  if (!user) return conn.reply(m.chat, "✦ Usuario no encontrado.", m)

  if (user.muto) {
    return conn.reply(
      m.chat,
      `✦ @${who.split("@")[0]} ya está muteado.`,
      m,
      { mentions: [who] }
    )
  }

  user.muto = true
  user.deleteCount = 0

  await conn.reply(
    m.chat,
    `🔇 @${who.split("@")[0]} fue muteado.`,
    m,
    { mentions: [who] }
  )
}

handler.command = ["mute"]
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler