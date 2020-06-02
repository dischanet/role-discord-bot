import Discord from 'discord.js'
import dotenv from 'dotenv'

const client = new Discord.Client()

// ready
/* Emitted when the client becomes ready to start working.    */
client.on('ready', function () {
  console.log(`the client becomes ready to start`)
  console.log(`I am ready! Logged in as ${client.user.tag}!`)
  console.log(
    `Bot has started, with ${client.users} users, in ${client.channels} channels of ${client.guilds} guilds.`
  )

  client.user.setActivity('製作中・・・')
})

const alphabet = [
  '🇦',
  '🇧',
  '🇨',
  '🇩',
  '🇪',
  '🇫',
  '🇬',
  '🇭',
  '🇮',
  '🇯',
  '🇰',
  '🇱',
  '🇲',
  '🇳',
  '🇴',
  '🇵',
  '🇶',
  '🇷',
  '🇸',
  '🇹',
  '🇺',
  '🇻',
  '🇼',
  '🇽',
  '🇾',
  '🇿',
]

// message
/* Emitted whenever a message is created.
PARAMETER      TYPE           DESCRIPTION
message        Message        The created message    */
client.on('message', async (message) => {
  const roles = Array.from(message.guild.roles.cache)
  const roleDictionary: Map<string, Discord.Role> = new Map<
    string,
    Discord.Role
  >()
  roles.forEach((role, index) => {
    roleDictionary.set(alphabet[index], role[1])
  })
  const embed = {
    title: 'プロジェクト一覧',
    color: 0xf8e71c,
    description: Array.from(roleDictionary)
      .map(([emoji, role]) => `${emoji} ${role.name}`)
      .join('\n'),
  }
  const botMessage = await message.channel.send({ embed })
  roleDictionary.forEach(async (role, emoji) => {
    await botMessage.react(emoji)
  })
})

// messageReactionAdd
/* Emitted whenever a reaction is added to a message.
PARAMETER              TYPE                   DESCRIPTION
messageReaction        MessageReaction        The reaction object
user                   User                   The user that applied the emoji or reaction emoji     */
client.on('messageReactionAdd', async (messageReaction, user: Discord.User) => {
  console.log(messageReaction, user)
})

// messageReactionRemove
/* Emitted whenever a reaction is removed from a message.
PARAMETER              TYPE                   DESCRIPTION
messageReaction        MessageReaction        The reaction object
user                   User                   The user that removed the emoji or reaction emoji     */
client.on('messageReactionRemove', function (
  messageReaction,
  user: Discord.User
) {
  console.log(messageReaction, user)
})

dotenv.config()
client.login(process.env.DISCORD_BOT_TOKEN)
