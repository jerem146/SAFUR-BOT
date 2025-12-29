import fs from 'fs'

const dbPath = './database/msg-count.json'

var handler = async (m, { conn, isAdmin, isBotAdmin, args, groupMetadata }) => {
  if (!m.isGroup) return
  if (!isAdmin)
    return conn.reply(m.chat, '❌ Solo administradores pueden usar este comando.', m)

  if (!isBotAdmin)
    return conn.reply(m.chat, '❌ Debo ser administrador para eliminar participantes.', m)

  // Sintaxis correcta
  // .eliminar mensajes 0
  if (args[0] !== 'mensajes' || isNaN(args[1]))
    return conn.reply(
      m.chat,
      '❌ Uso correcto:\n*.eliminar mensajes 0*',
      m
    )

  let target = Number(args[1])

  if (!fs.existsSync(dbPath))
    return conn.reply(m.chat, '❌ No hay datos de mensajes.', m)

  let data = JSON.parse(fs.readFileSync(dbPath))
  let chatData = data[m.chat] || {}

  let botJid = conn.user.jid
  let eliminados = []
  let protegidos = []

  for (let p of groupMetadata.participants) {
    let jid = p.id

    // ❌ NO tocar al bot
    if (jid === botJid) continue

    let count = chatData[jid] || 0

    if (count === target) {
      // ❌ NO admins ni owner
      if (p.admin) {
        protegidos.push(jid)
        continue
      }

      try {
        await conn.groupParticipantsUpdate(m.chat, [jid], 'remove')
        eliminados.push(jid)
        await new Promise(r => setTimeout(r, 1200)) // anti flood
      } catch {
        protegidos.push(jid)
      }
    }
  }

  let text =
    `🧹 *Limpieza de inactivos*\n\n` +
    `📌 Mensajes: *${target}*\n` +
    `👢 Eliminados: *${eliminados.length}*\n` +
    `🛡 Protegidos: *${protegidos.length}*`

  conn.reply(m.chat, text, m)
}

handler.help = ['eliminar mensajes <numero>']
handler.tags = ['grupo']
handler.command = ['eliminar']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler