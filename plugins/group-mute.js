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

  // 🔑 obtener usuario (100% compatible con tu handler)
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

  // NORMALIZAR JID (CLAVE)
  who = conn.decodeJid(who)

  // no admins
  let target = participants.find(p => conn.decodeJid(p.id) === who)
  if (target?.admin) {
    return m.reply('[ ! ] No puedo mutear a un administrador.')
  }

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

/* 🔍 MONITOR (MISMO ARCHIVO, NO ES OTRO) */
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