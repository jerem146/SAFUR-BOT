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

  // 🔑 NORMALIZAR REAL
  who = normalize(conn.decodeJid(who))

  // limpiar mutes viejos del mismo número
  const num = who.split('@')[0]
  for (let jid in chat.mutedUsers) {
    if (jid.startsWith(num)) delete chat.mutedUsers[jid]
  }

  // no admins
  let target = participants.find(p => normalize(conn.decodeJid(p.id)) === who)
  if (target?.admin) return m.reply('[ ! ] No puedo mutear a un administrador.')

  chat.mutedUsers[who] = {
    count: 0,
    warned: false
  }

  return m.reply(
    `[ 🔇 ] *USUARIO MUTEADO*\n\n@${num} fue silenciado.`,
    null,
    { mentions: [who] }
  )
}

/* 🔍 MONITOR */
handler.before = async function (m, {
  conn,
  chat,
  isBotAdmin
}) {
  if (!m.isGroup || m.fromMe || !isBotAdmin) return false
  if (!chat?.mutedUsers) return false

  const sender = normalize(conn.decodeJid(m.sender))
  if (!chat.mutedUsers[sender]) return false

  try {
    await conn.sendMessage(m.chat, { delete: m.key })
    chat.mutedUsers[sender].count++
  } catch {
    return false
  }

  return false
}

handler.command = /^mute$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler