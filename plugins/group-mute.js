/*
   Archivo: /plugins/group-mute.js
   Comando: .mute
*/

let handler = async (m, { conn, usedPrefix, command, chat, args }) => {
  if (!chat.mutedUsers) chat.mutedUsers = {}

  const text = m.text || m.message?.conversation || ""

  // saca menciones desde TODOS los lugares posibles
  const ctx =
    m.msg?.contextInfo ||
    m.message?.extendedTextMessage?.contextInfo ||
    m.message?.imageMessage?.contextInfo ||
    m.message?.videoMessage?.contextInfo ||
    m.message?.documentMessage?.contextInfo ||
    null

  const mentionedFromCtx = ctx?.mentionedJid || []
  const mentionedFromM = m.mentionedJid || []

  // parsea @12345 del texto (por si tu smsg no llena mentionedJid)
  const parsedFromText = (text.match(/@(\d{5,16})/g) || [])
    .map(v => v.replace("@", "") + "@s.whatsapp.net")

  // acepta número directo: .mute 51999999999
  const numArg = (args?.[0] || "").replace(/\D/g, "")
  const fromNumberArg = numArg.length >= 8 ? (numArg + "@s.whatsapp.net") : null

  // prioridad: quoted > mentioned > contextInfo > parsedFromText > numero
  let who =
    (m.quoted && m.quoted.sender) ||
    mentionedFromM[0] ||
    mentionedFromCtx[0] ||
    parsedFromText[0] ||
    fromNumberArg

  if (!who) {
    return m.reply(
      `💡 *Uso correcto:*\n${usedPrefix + command} @usuario\n${usedPrefix + command} 519XXXXXXXX\nO responde a su mensaje.`
    )
  }

  who = conn.decodeJid(who)

  // Verificar administradores
  const groupMetadata = await conn.groupMetadata(m.chat)
  const participants = groupMetadata.participants || []
  const target = participants.find(p => conn.decodeJid(p.id) === who)
  if (target?.admin) return m.reply('[ ! ] No puedo mutear a un administrador.')

  if (chat.mutedUsers[who]) {
    return m.reply(`[ ! ] @${who.split('@')[0]} ya está silenciado.`, null, { mentions: [who] })
  }

  chat.mutedUsers[who] = { count: 0, warned: false }

  return m.reply(
    `[ 🔇 ] *USUARIO MUTEADO*\n\n@${who.split('@')[0]} fue silenciado.\nReglas: 6 mensajes = Advertencia / 9 = Expulsión.`,
    null,
    { mentions: [who] }
  )
}

// MONITOR: Borrado de mensajes
handler.before = async function (m, { conn, isBotAdmin, chat }) {
  if (!m.isGroup || m.fromMe || !isBotAdmin || !chat?.mutedUsers) return false

  const sender = conn.decodeJid(m.sender)
  if (!chat.mutedUsers[sender]) return false

  const user = chat.mutedUsers[sender]

  try {
    await conn.sendMessage(m.chat, { delete: m.key })
    user.count++
  } catch {
    return false
  }

  if (user.count === 6 && !user.warned) {
    user.warned = true
    await conn.reply(m.chat, `⚠️ @${sender.split('@')[0]}, estás muteado. Evita escribir o serás expulsado.`, null, { mentions: [sender] })
  }

  if (user.count >= 9) {
    await conn.reply(m.chat, `⛔ @${sender.split('@')[0]} eliminado por ignorar el mute.`, null, { mentions: [sender] })
    await conn.groupParticipantsUpdate(m.chat, [sender], 'remove')
    delete chat.mutedUsers[sender]
  }

  return true
}

handler.command = /^mute$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler