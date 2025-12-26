/*
  Archivo: /plugins/group-mute.js
  Comando: .mute
*/

const normalize = jid => jid?.split(':')[0]

let handler = async (m, {
  conn,
  chat,
  participants,
  usedPrefix,
  command
}) => {

  if (!chat.mutedUsers) chat.mutedUsers = {}

  const context =
    m.msg?.contextInfo ||
    m.message?.extendedTextMessage?.contextInfo ||
    {}

  let who =
    m.quoted?.sender ||
    context.mentionedJid?.[0]

  if (!who) {
    return m.reply(
      `💡 *Uso correcto:*\n${usedPrefix + command} @usuario\nO responde a su mensaje.`
    )
  }

  who = normalize(conn.decodeJid(who))
  const num = who.split('@')[0]

  let target = participants.find(p =>
    normalize(conn.decodeJid(p.id)) === who
  )
  if (target?.admin) return m.reply('[ ! ] No puedo mutear a un administrador.')

  chat.mutedUsers[who] = { count: 0 }

  return m.reply(
    `[ 🔇 ] *USUARIO MUTEADO*\n\n@${num} fue silenciado.`,
    null,
    { mentions: [who] }
  )
}

/* 🔥 MONITOR REAL */
handler.before = async function (m, {
  conn,
  chat,
  isBotAdmin
}) {
  if (!m.isGroup || m.fromMe || !isBotAdmin) return false
  if (!chat?.mutedUsers) return false

  const sender = normalize(m.sender)
  if (!chat.mutedUsers[sender]) return false

  const key = {
    remoteJid: m.chat,
    fromMe: false,
    id: m.key.id,
    participant: m.key.participant || m.sender
  }

  try {
    await conn.sendMessage(m.chat, { delete: key })
  } catch {}

  return false
}

handler.command = /^mute$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler