import fs from 'fs'

const dbPath = './database/msg-count.json'

var handler = async (m, { conn, isAdmin, args, groupMetadata }) => {
  if (!m.isGroup) return
  if (!isAdmin)
    return conn.reply(
      m.chat,
      '❌ Solo los administradores pueden usar este comando.',
      m
    )

  if (!fs.existsSync(dbPath))
    return conn.reply(m.chat, '❌ No hay datos de mensajes aún.', m)

  let data = JSON.parse(fs.readFileSync(dbPath))
  let chatData = data[m.chat]

  if (!chatData)
    return conn.reply(
      m.chat,
      '❌ No hay mensajes registrados en este grupo.',
      m
    )

  // ───── FILTRO POR NÚMERO DE MENSAJES ─────
  if (args[0]) {
    let target = Number(args[0])
    if (isNaN(target))
      return conn.reply(
        m.chat,
        '❌ Usa un número válido.\nEjemplo: *.mensajes 1*',
        m
      )

    let text = `📊 *Participantes con ${target} mensajes*\n\n`
    let mentions = []
    let total = 0

    for (let p of groupMetadata.participants) {
      let jid = p.id
      let count = chatData[jid] || 0

      if (count === target) {
        mentions.push(jid)
        text += `• @${jid.split('@')[0]} — *${count}*\n`
        total++
      }
    }

    if (!total)
      return conn.reply(
        m.chat,
        `❌ Nadie tiene *${target}* mensajes.`,
        m
      )

    return conn.reply(m.chat, text, m, { mentions })
  }

  // ───── SIN ARGUMENTOS → TODOS ─────
  let text = `📊 *Mensajes del grupo*\n\n`
  let mentions = []

  for (let p of groupMetadata.participants) {
    let jid = p.id
    let count = chatData[jid] || 0
    mentions.push(jid)
    text += `• @${jid.split('@')[0]} — *${count}*\n`
  }

  conn.reply(m.chat, text, m, { mentions })
}

handler.help = ['mensajes [numero]']
handler.tags = ['grupo']
handler.command = ['mensajes', 'msg']
handler.group = true
handler.admin = true

export default handler