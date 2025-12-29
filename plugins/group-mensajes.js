import fs from 'fs'

let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos')

  const dbPath = './database/msg-count.json'
  if (!fs.existsSync(dbPath)) return m.reply('❌ No hay datos aún')

  let data = JSON.parse(fs.readFileSync(dbPath))
  let chatId = m.chat

  if (!data[chatId]) return m.reply('❌ No hay mensajes registrados en este grupo')

  let userId = m.mentionedJid?.[0] || m.sender
  let count = data[chatId][userId] || 0

  let name = await conn.getName(userId)

  m.reply(`📊 *Mensajes en este grupo*\n\n👤 *Usuario:* ${name}\n💬 *Mensajes:* ${count}`)
}

handler.command = ['mensajes', 'msg']
handler.group = true

export default handler