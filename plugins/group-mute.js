/*
  Archivo: /plugins/group-mute.js
  Comando: .mute
*/

let handler = async (m, {
  conn,
  chat,
  participants,
  usedPrefix,
  command
}) => {

  if (!chat.mutedUsers) chat.mutedUsers = {}

  // obtener usuario
  let who =
    m.quoted?.sender ||
    m.mentionedJid?.[0]

  if (!who) {
    return m.reply(
      `💡 *Uso correcto:*\n${usedPrefix + command} @usuario\nO responde a su mensaje.`
    )
  }

  // normalizar JID (CLAVE)
  who = conn.decodeJid(who)

  // no admins
  let target = participants.find(p => conn.decodeJid(p.id) === who)
  if (target?.admin) {
    return m.reply('[ ! ] No puedo mutear a un administrador.')
  }

  // evitar mutes fantasmas
  if (chat.mutedUsers[who]) {
    return m.reply(
      `[ ! ] @${who.split('@')[0]} ya está silenciado.`,
      null,
      { mentions: [who] }
    )
  }

  chat.mutedUsers[who] = {
    count: 0,
    warned: false
  }

  return m.reply(
    `[ 🔇 ] *USUARIO MUTEADO*\n\n@${who.split('@')[0]} fue silenciado.`,
    null,
    { mentions: [who] }
  )
}

// monitor
handler.before = async function (m, {
  conn,
  chat,
  isBotAdmin
}) {
  if (!m.isGroup || m.fromMe || !isBotAdmin) return false
  if (!chat?.mutedUsers) return false

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

handler.command = /^mute$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler