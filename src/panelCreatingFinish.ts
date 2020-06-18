import { Emoji, Message } from 'discord.js'

import { Manager, Role as dbRole } from './model'
import { ALPHABET, MAX_REACTION, OK } from './utils'

type dbManager = {
  id: string
  startMessageId: string
  creatingMessageIds: string
}

const split = <T>(array: T[], n = MAX_REACTION): T[][] => {
  const length = Math.ceil(array.length / n)
  return [...new Array(length)].map((_, i) => array.slice(i * n, (i + 1) * n))
}

const deleteCreatingMessages = (manager: dbManager, message: Message) => {
  const messageIdsToDelete = [
    ...manager.creatingMessageIds.split(','),
    manager.startMessageId,
    message.id,
  ]
  return Promise.all([
    ...messageIdsToDelete.map((messageId: string) =>
      message.channel.messages.fetch(messageId).then((m) => m.delete())
    ),
    Manager.update({ isCreating: false }, { where: { id: manager.id } }),
  ])
}

const createPanel = async (
  manager: dbManager,
  message: Message
): Promise<void> => {
  const botMessages = []
  let promises: Promise<void>[] = []
  const roles = (await dbRole.findAll({
    attributes: ['roleId', 'name'],
    where: { isOnPanel: true },
    include: [{ model: Manager, where: { finishMessageId: message.id } }],
  })) as { roleId: string; name: string }[]
  const splitRoles = split(roles)
  for (let i = 0; i < splitRoles.length; i++) {
    const splitRole = splitRoles[i]
    const embed = {
      title: `ロール一覧:${i + 1}`,
      color: 0xf8e71c,
      description: splitRole
        .map((role, i) => `${ALPHABET[i]} ${role.name}`)
        .join('\n'),
    }
    const botMessage = await message.channel.send({ embed })
    botMessages.push(botMessage)
    promises = [
      ...promises,
      ...splitRole.map((_, i) => botMessage.react(ALPHABET[i])),
      ...splitRole.map((role, i) =>
        dbRole.update(
          { panelMessageId: botMessage.id, emoji: ALPHABET[i] },
          { where: { ManagerId: manager.id, roleId: role.roleId } }
        )
      ),
    ]
  }
  await Promise.all(promises)
}

export const finish = async (message: Message, emoji: Emoji): Promise<void> => {
  if (emoji.toString() !== OK) return
  const manager = (await Manager.findOne({
    attributes: ['id', 'startMessageId', 'creatingMessageIds'],
    where: { finishMessageId: message.id },
  })) as dbManager
  await deleteCreatingMessages(manager, message)
  await createPanel(manager, message)
}
