/*
  Comando: mute
  Compatible 100% con tu handler
*/

function getTarget(m) {
  // 1️⃣ Responder mensaje
  if (m.quoted?.sender) return m.quoted.sender

  // 2️⃣ Mención real
  if (m.mentionedJid && m.mentionedJid.length) {
    return m.mentionedJid[0]
  }

  // 3️⃣ @numero escrito
  let match = (m.text || "").match(/@(\d{5,20})/)
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
      "✦ Responde al mensaje o etiqueta al usuario.",
      m
    )
  }

  // 🔥 CREAR USUARIO SI NO EXISTE
  let user = global.db.data.users[who]
  if (!user) {
    global.db.data.users[who] = {
      exp: 0,
      coin: 0,
      bank: 0,
      level: 0,
      health: 100,
      warn: 0,
      muto: false,
      deleteCount: 0
    }
    user = global.db.data.users[who]
  }

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