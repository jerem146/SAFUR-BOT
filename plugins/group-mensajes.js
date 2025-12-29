import fs from 'fs'

let handler = async (m, { conn }) => {
  if (!m.isGroup) return

  const dbPath = './database/msg-count.json'
  if (!fs.existsSync(dbPath)) return m.reply('❌ No hay datos')

  let data = JSON.parse(fs.readFileSync(dbPath))
  let chatData = data[m.chat]
  if (!chatData) return m.reply('❌ No hay mensajes')

  let userId = m.mentionedJid?.[0] || m.sender
  let count = chatData[userId] || 0
  let name = await conn.getName(userId)

  m.reply(`📊 *Mensajes del grupo*\n\n👤 ${name}\n💬 ${count} mensajes`)
}

handler.command = ['mensajes', 'msg']
handler.group = true

export default handler