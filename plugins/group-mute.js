/*
  Archivo: /plugins/group-mute.js
  Comando: .mute
*/

let handler = async (m, {
  conn,
  chat,
  participants,
  usedPrefix,
  command
}) => {

  if (!chat.mutedUsers) chat.mutedUsers = {}

  // 🔎 obtener usuario (TU smsg ya llena esto bien)
  let who =
    m.quoted?.sender ||
    m.mentionedJid?.[0]

  if (!who) {
    return m.reply(
      `💡 *Uso correcto:*\n${usedPrefix + command} @usuario\nO responde a su mensaje.`
    )
  }

  // 🔑 normalización ÚNICA
  who = conn.decodeJid(who)

  // 🛑 no admins
  let target = participants.find(p => conn.decodeJid(p.id) === who)
  if (target?.admin) {
    return m.reply('[ ! ] No puedo mutear a un administrador.')
  }

  // 🧹 limpiar mutes rotos (evita "ya está muteado" falso)
  if (chat.mutedUsers[who]) {
    delete chat.mutedUsers[who]
  }

  // registrar mute
  chat.mutedUsers[who] = {
    count: 0,
    warned: false
  }

  return m.reply(
    `[ 🔇 ] *USUARIO MUTEADO*\n\n@${who.split('@')[0]} fue silenciado.`,
    null,
    { mentions: [who] }
  )
}