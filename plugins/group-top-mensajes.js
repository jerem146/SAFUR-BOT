import fs from 'fs'

const dbPath = './database/msg-count.json'

var handler = async (m, { conn, isAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return conn.reply(m.chat, '❌ Solo administradores.', m)

  if (!fs.existsSync(dbPath)) return conn.reply(m.chat, '❌ No hay datos.', m)

  let data = JSON.parse(fs.readFileSync(dbPath))
  let chatData = data[m.chat]
  if (!chatData) return conn.reply(m.chat, '❌ No hay registros.', m)

  let sorted = Object.entries(chatData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  let text = `🏆 *TOP MENSAJES DEL GRUPO*\n\n`
  let medals = ['🥇', '🥈', '🥉']

  for (let i = 0; i < sorted.length; i++) {
    let [jid, count] = sorted[i]
    let name = await conn.getName(jid)
    let medal = medals[i] || '🔹'
    text += `${medal} ${name} — *${count}* mensajes\n`
  }

  conn.reply(m.chat, text, m)
}

handler.help = ['topmensajes']
handler.tags = ['grupo']
handler.command = ['topmensajes', 'topmsg']
handler.group = true
handler.admin = true

export default handler