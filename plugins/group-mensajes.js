import fs from 'fs'

const dbPath = './database/msg-count.json'

var handler = async (m, { conn, isAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return conn.reply(m.chat, '❌ Solo los administradores pueden usar este comando.', m)

  if (!fs.existsSync(dbPath)) {
    return conn.reply(m.chat, '❌ No hay datos de mensajes aún.', m)
  }

  let data = JSON.parse(fs.readFileSync(dbPath))
  let chatData = data[m.chat]

  if (!chatData) {
    return conn.reply(m.chat, '❌ No hay mensajes registrados en este grupo.', m)
  }

  // 🔥 MISMA LÓGICA QUE TU PROMOTE (FUNCIONA)
  let mentionedJid = await m.mentionedJid
  let user =
    mentionedJid && mentionedJid.length
      ? mentionedJid[0]
      : m.quoted && m.quoted.sender
      ? m.quoted.sender
      : null

  // ───── SI HAY USUARIO → SOLO ÉL ─────
  if (user) {
    let count = chatData[user] || 0
    let name = await conn.getName(user)

    return conn.reply(
      m.chat,
      `📊 *Mensajes del participante*\n\n` +
        `👤 ${name}\n` +
        `💬 ${count} mensajes`,
      m
    )
  }

  // ───── SI NO HAY USUARIO → TODOS ─────
  let text = `📊 *Mensajes del grupo*\n\n`
  let i = 1

  for (let jid in chatData) {
    let name = await conn.getName(jid)
    text += `${i}. ${name} — *${chatData[jid]}* mensajes\n`
    i++
  }

  conn.reply(m.chat, text, m)
}

handler.help = ['mensajes', 'msg']
handler.tags = ['grupo']
handler.command = ['mensajes', 'msg']
handler.group = true
handler.admin = true   // 🔐 SOLO ADMINS

export default handler