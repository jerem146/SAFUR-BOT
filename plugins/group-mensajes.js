import fs from 'fs'

const dbPath = './database/msg-count.json'

var handler = async (m, { conn, args, isAdmin, isBotAdmin, groupMetadata }) => {
  if (!m.isGroup) return

  if (!fs.existsSync(dbPath))
    return conn.reply(m.chat, '❌ No hay datos de mensajes aún.', m)

  let data = JSON.parse(fs.readFileSync(dbPath))
  let chatData = data[m.chat] || {}

  let participants = groupMetadata.participants
  let botJid = conn.user.jid

  // ───── 1️⃣ .mensajes (SIN ARGUMENTOS) ─────
  if (!args[0]) {
    let text = `📊 *Mensajes del grupo*\n\n`
    let mentions = []

    for (let p of participants) {
      let jid = p.id
      if (jid === botJid) continue

      let count = chatData[jid] || 0
      text += `• @${jid.split('@')[0]} — *${count}*\n`
      mentions.push(jid)
    }

    return conn.sendMessage(
      m.chat,
      { text, mentions },
      { quoted: m }
    )
  }

  // ───── VALIDAR NÚMERO ─────
  if (isNaN(args[0]))
    return conn.reply(
      m.chat,
      '❌ Usa un número válido.\nEjemplo:\n.mensajes 0\n.mensajes 1',
      m
    )

  let target = Number(args[0])

  // ───── 2️⃣ .mensajes <numero> ─────
  if (!args[1]) {
    let text = `📊 *Participantes con ${target} mensajes*\n\n`
    let mentions = []
    let found = false

    for (let p of participants) {
      let jid = p.id
      if (jid === botJid) continue

      let count = chatData[jid] || 0
      if (count === target) {
        text += `• @${jid.split('@')[0]}\n`
        mentions.push(jid)
        found = true
      }
    }

    if (!found)
      return conn.reply(
        m.chat,
        `❌ Nadie tiene ${target} mensajes.`,
        m
      )

    return conn.sendMessage(
      m.chat,
      { text, mentions },
      { quoted: m }
    )
  }

  // ───── 3️⃣ .mensajes <numero> eliminar ─────
  if (args[1] === 'eliminar') {
    if (!isAdmin)
      return conn.reply(m.chat, '❌ Solo admins pueden eliminar.', m)

    if (!isBotAdmin)
      return conn.reply(m.chat, '❌ Debo ser admin.', m)

    let removed = 0

    for (let p of participants) {
      let jid = p.id
      if (jid === botJid) continue
      if (p.admin) continue

      let count = chatData[jid] || 0
      if (count === target) {
        await conn.groupParticipantsUpdate(m.chat, [jid], 'remove')
        removed++
        await new Promise(r => setTimeout(r, 1200))
      }
    }

    return conn.reply(
      m.chat,
      `🧹 Limpieza completa\n\n👢 Eliminados: *${removed}*\n📌 Mensajes: *${target}*`,
      m
    )
  }
}

handler.help = ['mensajes', 'mensajes <n>', 'mensajes <n> eliminar']
handler.tags = ['grupo']
handler.command = ['mensajes']
handler.group = true

export default handler