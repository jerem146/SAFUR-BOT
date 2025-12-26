/*
  Archivo: /plugins/group-unmute.js
  Comando: .unmute
*/

let handler = async (m, {
  conn,
  chat,
  participants,
  usedPrefix,
  command
}) => {

  if (!chat.mutedUsers) chat.mutedUsers = {}

  let who =
    m.quoted?.sender ||
    m.mentionedJid?.[0]

  if (!who) {
    return m.reply(
      `💡 *Uso correcto:*\n${usedPrefix + command} @usuario\nO responde a su mensaje.`
    )
  }

  who = conn.decodeJid(who)

  if (!chat.mutedUsers[who]) {
    return m.reply(
      `[ ! ] @${who.split('@')[0]} no está silenciado.`,
      null,
      { mentions: [who] }
    )
  }

  delete chat.mutedUsers[who]

  return m.reply(
    `[ 🔊 ] *USUARIO DESMUTEADO*\n\n@${who.split('@')[0]} puede escribir nuevamente.`,
    null,
    { mentions: [who] }
  )
}

handler.command = /^unmute$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler