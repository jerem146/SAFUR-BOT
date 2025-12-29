import fs from 'fs'

let handler = async (m, { conn }) => {
  if (!m.isGroup) return

  const dbPath = './database/msg-count.json'
  if (!fs.existsSync(dbPath)) return m.reply('❌ No hay datos')

  let data = JSON.parse(fs.readFileSync(dbPath))
  let chatData = data[m.chat]
  if (!chatData) return m.reply('❌ No hay mensajes en este grupo')

  let sorted = Object.entries(chatData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  let text = '🏆 *TOP 10 MENSAJES DEL GRUPO*\n\n'
  let i = 1

  for (let [user, count] of sorted) {
    let name = await conn.getName(user)
    text += `${i}. ${name} — *${count}* mensajes\n`
    i++
  }

  m.reply(text)
}

handler.command = ['topmensajes', 'topmsg']
handler.group = true

export default handler