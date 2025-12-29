import fs from 'fs'

let handler = async (m, { conn }) => {
  if (!m.isGroup) return

  const dbPath = './database/msg-count.json'
  if (!fs.existsSync(dbPath)) return m.reply('❌ No hay datos')

  let data = JSON.parse(fs.readFileSync(dbPath))
  let chatData = data[m.chat]
  if (!chatData) return m.reply('❌ Aún no hay registros')

  // ───── OBTENER USUARIO OBJETIVO ─────
  let target = null

  // 1️⃣ Responder mensaje
  if (m.quoted?.sender) {
    target = m.quoted.sender
  }

  // 2️⃣ Etiquetar (@usuario)
  else if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    target = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
  }

  // ───── SI HAY USUARIO → MOSTRAR SOLO ÉL ─────
  if (target) {
    let count = chatData[target] || 0
    let name = await conn.getName(target)

    return m.reply(
      `📊 *Mensajes del participante*\n\n` +
      `👤 ${name}\n` +
      `💬 ${count} mensajes`
    )
  }

  // ───── SIN ETIQUETA → TODOS ─────
  let text = `📊 *Mensajes del grupo*\n\n`
  let i = 1

  for (let user of Object.keys(chatData)) {
    let name = await conn.getName(user)
    let count = chatData[user]
    text += `${i}. ${name} — *${count}* mensajes\n`
    i++
  }

  m.reply(text)
}

handler.command = ['mensajes', 'msg']
handler.group = true

export default handler