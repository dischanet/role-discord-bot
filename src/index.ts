import { Client, Permissions, User } from 'discord.js'
import { config } from 'dotenv'

import { addRole, creatingPanel, removeRole } from './panelCreating'
import { finish } from './panelCreatingFinish'
import { depriveRole, grantRole } from './panelUsing'
import { BOT_ID } from './utils'

const client = new Client()

// ready
/* Emitted when the client becomes ready to start working.    */
client.on('ready', function () {
  if (client.user) client.user.setActivity('!role')
})

// message
/* Emitted whenever a message is created.
PARAMETER      TYPE           DESCRIPTION
message        Message        The created message    */
client.on('message', async (message) => {
  if (!message.toString().startsWith('!role')) return
  if (
    !message.member ||
    !message.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)
  )
    return
  creatingPanel(message)
})

// messageReactionAdd
/* Emitted whenever a reaction is added to a message.
PARAMETER              TYPE                   DESCRIPTION
messageReaction        MessageReaction        The reaction object
user                   User                   The user that applied the emoji or reaction emoji     */
client.on('messageReactionAdd', async (messageReaction, user) => {
  const message = messageReaction.message
  if (
    message.author.id !== BOT_ID ||
    user.id === BOT_ID ||
    !message.guild ||
    user.partial
  )
    return
  const member = message.guild.member(user as User)
  if (!member) return
  const emoji = messageReaction.emoji

  // パネル作成中
  addRole(message, emoji)
  finish(message, emoji)

  // パネル作成後
  grantRole(member, message, emoji)
})

// messageReactionRemove
/* Emitted whenever a reaction is removed from a message.
PARAMETER              TYPE                   DESCRIPTION
messageReaction        MessageReaction        The reaction object
user                   User                   The user that removed the emoji or reaction emoji     */
client.on('messageReactionRemove', (messageReaction, user) => {
  const message = messageReaction.message
  if (
    message.author.id !== BOT_ID ||
    user.id === BOT_ID ||
    !message.guild ||
    user.partial
  )
    return
  const member = message.guild.member(user as User)
  if (!member) return
  const emoji = messageReaction.emoji

  // パネル作成中
  removeRole(message, emoji)

  // パネル作成後
  depriveRole(member, message, emoji)
})

config()
client.login(process.env.DISCORD_BOT_TOKEN)
