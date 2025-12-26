/*
  Archivo: /plugins/mute.js
*/

let handler = async (m, { conn, usedPrefix, command }) => {

  let user = m.mentionedJid?.[0] || m.quoted?.sender
  if (!user) {
    return m.reply(
      `💡 *Uso correcto:*\n${usedPrefix + command} @usuario\nO responde a su mensaje.`
    )
  }

  if (!global.db.data.users[user])
    global.db.data.users[user] = {}

  if (global.db.data.users[user].muto) {
    return m.reply(
      `[ ! ] @${user.split('@')[0]} ya está silenciado.`,
      null,
      { mentions: [user] }
    )
  }

  global.db.data.users[user].muto = true

  await conn.reply(
    m.chat,
    `[ 🔇 ] @${user.split('@')[0]} fue silenciado.`,
    m,
    { mentions: [user] }
  )
}

/* 🔥 BLOQUEO REAL (smsg FIX) */
handler.before = async function (m, { conn, isBotAdmin }) {
  if (!m.isGroup || m.fromMe || !isBotAdmin) return false

  let user = global.db.data.users[m.sender]
  if (!user?.muto) return false

  try {
    // 🔴 ESTA ES LA CLAVE CON smsg
    await conn.sendMessage(m.chat, { delete: m.msg.key })
  } catch (e) {
    console.log('Error delete:', e)
  }

  return true
}

handler.command = /^mute$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler