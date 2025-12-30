const handler = async (m, { isOwner, isAdmin, conn, text, participants, args, command }) => {
const pesan = args.join` `
const oi = `*» INFO :* ${pesan}`

let teks = `*!  MENCION GENERAL  !*\n`
teks += `*PARA ${participants.length} MIEMBROS* 🗣️\n\n`
teks += `${oi}\n\n`
teks += `╭  ┄ 𝅄 ۪꒰ \`⡞᪲=͟͟͞${botname}≼᳞ׄ\` ꒱ ۟ 𝅄 ┄\n`

for (const mem of participants) {
teks += `┊ꕥ @${mem.id.split('@')[0]}\n`
}

teks += `╰⸼ ┄ ┄ ┄ ─  ꒰  ׅ୭ *${vs}* ୧ ׅ ꒱  ┄  ─ ┄⸼`

// 📸 Obtener foto del grupo
let pp = null
try {
pp = await conn.profilePictureUrl(m.chat, 'image')
} catch {
pp = 'https://i.imgur.com/8fK4h6q.png' // imagen por defecto si no hay foto
}

// 📤 Enviar con imagen del grupo
await conn.sendMessage(m.chat, {
image: { url: pp },
caption: teks,
mentions: participants.map(a => a.id)
}, { quoted: m })
}

handler.help = ['todos']
handler.tags = ['group']
handler.command = ['todos', 'invocar', 'tagall']
handler.admin = true
handler.group = true

export default handler