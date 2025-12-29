import fs from 'fs'

const dbPath = './database/msg-count.json'

let handler = async (m, { conn }) => {
  if (!m.isGroup) return

  if (!fs.existsSync(dbPath)) return m.reply('❌ No hay datos aún')

  let data = JSON.parse(fs.readFileSync(dbPath))
  let chatData = data[m.chat]
  if (!chatData) return m.reply('❌ No hay registros en este grupo')

  let target = null

  // ✅ 1. RESPONDER MENSAJE
  if (m.quoted?.sender) {
    target = m.quoted.sender
  }

  // ✅ 2. ETIQUETAR (@usuario) — ESTA ES LA CLAVE
  else if (m.mentionedJid && m.mentionedJid.length > 0) {
    target = m.mentionedJid[0]
  }

  // ───── MOSTRAR SOLO UN USUARIO ─────
  if (target) {
    let count = chatData[target] || 0
    let name = await conn.getName(target)

    return m.reply(
      `📊 *Mensajes del participante*\n\n` +
      `👤 ${name}\n` +
      `💬 ${count} mensajes`
    )
  }

  // ───── MOSTRAR TODOS ─────
  let text = `📊 *Mensajes del grupo*\n\n`
  let i = 1

  for (let user in chatData) {
    let name = await conn.getName(user)
    text += `${i}. ${name} — *${chatData[user]}* mensajes\n`
    i++
  }

  m.reply(text)
}

handler.command = ['mensajes', 'msg']
handler.group = true

export default handler