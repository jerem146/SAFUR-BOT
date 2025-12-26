/*
  Comando: mute
  - Responder ✅
  - Mención real ✅
  - Escribir @51999999999 (sin metadata) ✅
*/

async function getTargetJid(m, conn) {
  // 1) responder
  if (m.quoted?.sender) return m.quoted.sender

  // 2) mentionedJid normalizado en smsg (a veces)
  if (m.mentionedJid?.length) return m.mentionedJid[0]

  // 3) contextInfo (extendedTextMessage)
  const ctx1 = m.message?.extendedTextMessage?.contextInfo?.mentionedJid
  if (ctx1?.length) return ctx1[0]

  // 4) contextInfo (en otros wrappers)
  const ctx2 = m.msg?.contextInfo?.mentionedJid
  if (ctx2?.length) return ctx2[0]

  // 5) fallback: parsear @numero del texto
  const text = (m.text || "")
  const match = text.match(/@(\d{5,20})/i)
  if (!match) return null

  const jid = match[1] + "@s.whatsapp.net"

  // opcional: validar que exista en WhatsApp (si falla, igual devolvemos jid)
  try {
    const exists = await conn.onWhatsApp(jid)
    if (Array.isArray(exists) && exists[0]?.jid) return exists[0].jid
  } catch {}
  return jid
}

let handler = async (m, { conn, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin && !isOwner) return
  if (!isBotAdmin) return

  const who = await getTargetJid(m, conn)
  if (!who) return conn.reply(m.chat, "✦ Responde o etiqueta (o escribe @numero) al usuario a mutear.", m)

  const user = global.db.data.users[who]
  if (!user) return conn.reply(m.chat, "✦ Ese usuario no existe en mi base de datos aún.", m)

  if (user.muto) {
    return conn.reply(m.chat, `✦ @${who.split("@")[0]} ya está muteado.`, m, { mentions: [who] })
  }

  user.muto = true
  user.deleteCount = 0

  await conn.reply(m.chat, `🔇 @${who.split("@")[0]} fue muteado.`, m, { mentions: [who] })
}

handler.command = ["mute"]
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler