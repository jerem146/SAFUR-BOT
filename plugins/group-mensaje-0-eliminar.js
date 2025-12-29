import fs from 'fs'

const dbPath = './database/msg-count.json'

var handler = async (m, { conn, isAdmin, isBotAdmin, args, groupMetadata }) => {
  if (!m.isGroup) return
  if (!isAdmin)
    return conn.reply(m.chat, '❌ Solo los administradores pueden usar este comando.', m)

  if (!fs.existsSync(dbPath))
    return conn.reply(m.chat, '❌ No hay datos de mensajes aún.', m)

  let data = JSON.parse(fs.readFileSync(dbPath))
  let chatData = data[m.chat]

  if (!chatData)
    return conn.reply(m.chat, '❌ No hay mensajes registrados en este grupo.', m)

  let target = Number(args[0])
  let eliminar = args[1] === 'eliminar'

  if (isNaN(target))
    return conn.reply(
      m.chat,
      '❌ Usa un número válido.\nEjemplo: *.mensajes 0* o *.mensajes 0 eliminar*',
      m
    )

  // ───── ELIMINAR PARTICIPANTES ─────
  if (eliminar) {
    if (!isBotAdmin)
      return conn.reply(m.chat, '❌ Debo ser administrador para eliminar usuarios.', m)

    let expulsados = []
    let protegidos = []

    for (let p of groupMetadata.participants) {
      let jid = p.id
      let count = chatData[jid] || 0

      if (count === target) {
        if (p.admin) {
          protegidos.push(jid)
          continue
        }

        try {
          await conn.groupParticipantsUpdate(m.chat, [jid], 'remove')
          expulsados.push(jid)
          await new Promise(r => setTimeout(r, 1200)) // anti flood
        } catch {
          protegidos.push(jid)
        }
      }
    }

    let text = `🧹 *Limpieza por mensajes*\n\n`
    text += `📌 Mensajes: *${target}*\n`
    text += `👢 Eliminados: *${expulsados.length}*\n`
    text += `🛡 Protegidos: *${protegidos.length}*`

    return conn.reply(m.chat, text, m)
  }

  // ───── SOLO MOSTRAR ─────
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
    return conn.reply(m.chat, `❌ Nadie tiene *${target}* mensajes.`, m)

  conn.reply(m.chat, text, m, { mentions })
}

handler.help = ['mensajes <numero> [eliminar]']
handler.tags = ['grupo']
handler.command = ['mensajes', 'msg']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler