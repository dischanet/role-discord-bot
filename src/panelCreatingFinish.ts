import { Emoji, Message } from 'discord.js'

import { Manager, Role as dbRole } from './model'
import { ALPHABET, MAX_REACTION, OK } from './utils'

const split = <T>(array: T[], n = MAX_REACTION): T[][] =>
  array.reduce(
    (a, c, i) =>
      i % n == 0 ? [...a, [c]] : [...a.slice(0, -1), [...a[a.length - 1], c]],
    []
  )

const deleteCreatingMessages = (manager, message: Message) => {
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

const createPanel = async (manager, message: Message): Promise<void> => {
  const botMessages = []
  let promises = []
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
  const manager = await Manager.findOne({
    attributes: ['id', 'startMessageId', 'creatingMessageIds'],
    where: { finishMessageId: message.id },
  })
  await deleteCreatingMessages(manager, message)
  await createPanel(manager, message)
}
