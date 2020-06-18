import { Emoji, Message, Role } from 'discord.js'

import { Manager, Role as dbRole } from './model'
import { ALPHABET, MAX_REACTION, OK } from './utils'

const split = (roles: Map<string, Role>): Map<string, Role>[] => {
  let count = 0
  const result: Map<string, Role>[] = []
  roles.forEach((role, id) => {
    if (result[count] === undefined) result.push(new Map<string, Role>())
    result[count].set(id, role)
    if (result[count].size >= MAX_REACTION) count++
  })
  return result
}

export const creatingPanel = async (message: Message): Promise<void> => {
  const { guild, channel, member } = message
  if (!guild || !member) return

  const botRole = guild.roles.cache
    .filter((role) => role.name === 'ロール管理くん')
    .map((role) => role)[0]
  const roleMap = guild.roles.cache
    .filter(
      (role, id) =>
        id !== guild.roles.everyone.id && role.position < botRole.position
    )
    .sort((role0, role1) => role1.position - role0.position)

  const manager = await Manager.create({
    guildId: guild.id,
    channelId: channel.id,
    memberId: member.id,
  })

  const startMessage = await channel.send('ロールを選んでください。')
  const botMessages = []
  const promises = []
  const splitRoleMaps = split(roleMap)
  for (let i = 0; i < splitRoleMaps.length; i++) {
    const roles = Array.from(splitRoleMaps[i].values())
    const embed = {
      title: `ロール候補:${i + 1}`,
      color: 0xf8e71c,
      description: roles
        .map((role, i) => `${ALPHABET[i]} ${role.name}`)
        .join('\n'),
    }
    const botMessage = await channel.send({ embed })
    botMessages.push(botMessage)
    promises.push(
      Promise.all(roles.map((_, i) => botMessage.react(ALPHABET[i])))
    )
    promises.push(
      dbRole.bulkCreate(
        roles.map((role, i) => ({
          guildId: message.guild.id,
          channelId: message.channel.id,
          memberId: message.member.id,
          roleId: role.id,
          name: role.name,
          position: role.position,
          hexColor: role.hexColor,
          ManagerId: manager.id,
          creatingMessageId: botMessage.id,
          emojiCreating: ALPHABET[i],
        }))
      )
    )
  }
  await Promise.all(promises)

  const finishMessage = await channel.send(
    `選び終わったら、${OK}を押してください`
  )
  await manager.update({
    startMessageId: startMessage.id,
    creatingMessageIds: botMessages.map((message) => message.id).join(','),
    finishMessageId: finishMessage.id,
  })
  await finishMessage.react(OK)
}

export const addRole = async (
  message: Message,
  emoji: Emoji
): Promise<void> => {
  if (!message.guild) return
  await dbRole.update(
    { isOnPanel: true },
    {
      where: {
        creatingMessageId: message.id,
        emojiCreating: emoji.toString(),
      },
    }
  )
}

export const removeRole = async (
  message: Message,
  emoji: Emoji
): Promise<void> => {
  if (!message.guild) return
  await dbRole.update(
    { isOnPanel: false },
    {
      where: { creatingMessageId: message.id, emojiCreating: emoji.toString() },
    }
  )
}
