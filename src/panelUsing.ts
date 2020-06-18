import { Emoji, GuildMember, Message } from 'discord.js'

import { Role as dbRole } from './model'

export const grantRole = async (
  member: GuildMember,
  message: Message,
  emoji: Emoji
): Promise<void> => {
  const roleFromDb = await dbRole.findOne({
    attributes: ['roleId'],
    where: {
      isOnPanel: true,
      emoji: emoji.toString(),
      panelMessageId: message.id,
    },
  })
  if (!roleFromDb || !message.guild) return
  const role = await message.guild.roles.fetch(roleFromDb.roleId)
  if (role) await member.roles.add(role)
}

export const depriveRole = async (
  member: GuildMember,
  message: Message,
  emoji: Emoji
): Promise<void> => {
  const roleFromDb = await dbRole.findOne({
    attributes: ['roleId'],
    where: {
      isOnPanel: true,
      emoji: emoji.toString(),
      panelMessageId: message.id,
    },
  })
  if (!roleFromDb || !message.guild) return
  const role = await message.guild.roles.fetch(roleFromDb.roleId)
  if (role) await member.roles.remove(role)
}
