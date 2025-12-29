import fs from 'fs'

let handler = async (m, { conn }) => {
  if (!m.isGroup) return

  const dbPath = './database/msg-count.json'
  if (!fs.existsSync(dbPath)) return m.reply('❌ No hay datos de mensajes')

  let data = JSON.parse(fs.readFileSync(dbPath))
  let chatData = data[m.chat]

  if (!chatData) return m.reply('❌ Aún no hay mensajes contados en este grupo')

  // ───── CASO 1: RESPONDIENDO O ETIQUETANDO ─────
  let target =
    m.quoted?.sender ||
    m.mentionedJid?.[0]

  if (target) {
    let count = chatData[target] || 0
    let name = await conn.getName(target)

    return m.reply(
      `📊 *Mensajes del participante*\n\n` +
      `👤 ${name}\n` +
      `💬 ${count} mensajes`
    )
  }

  // ───── CASO 2: AL AIRE → TODOS ─────
  let text = `📊 *Mensajes del grupo*\n\n`
  let i = 1

  for (let userId of Object.keys(chatData)) {
    let name = await conn.getName(userId)
    let count = chatData[userId]
    text += `${i}. ${name} — *${count}* mensajes\n`
    i++
  }

  m.reply(text)
}

handler.command = ['mensajes', 'msg']
handler.group = true

export default handler