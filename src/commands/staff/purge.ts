import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { log } from '../../util'
import { Message, TextChannel, GuildChannel } from 'discord.js'
import { MachoCommand } from '../../types'

export default class PurgeCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'purge',
      aliases: ['delete', 'purgemsg'],
      group: 'staff',
      memberName: 'purge',
      description: 'Deletes a defined number of messages.',
      details: oneLine`
        This command deletes [amount{2 ... 100}] messages from the channel
        it is executed in.
			`,
      examples: ['purge 2', 'delete 100'],
      guildOnly: true,

      args: [{
        key: 'deleteCount',
        label: 'deleteCount',
        prompt: 'How many messages would you like to delete?',
        type: 'integer',
        infinite: false
      }]
    })
  }

  async run (msg: CommandMessage, { deleteCount }: { deleteCount: number }): Promise<Message | Message[]> {
    if (!(msg.member.hasPermission('MANAGE_MESSAGES'))) {
      return msg.reply("You can't delete messages.").catch(() => {
        return null
      })
    }

    if (!deleteCount || deleteCount < 2 || deleteCount > 100) {
      await msg.reply('I need a number between 2 and 100. Try again.').catch(() => {
        return null
      })
    }

    const logChannel = msg.guild.channels.find((channel: GuildChannel) => channel.name === 'machobot-audit') as TextChannel
    const channel = msg.channel as TextChannel
    const deleteResponse = await msg.channel.bulkDelete(deleteCount + 1, true).catch(() => {
      return
    })

    if (!deleteResponse) {
      return msg.reply('I encountered an error whilst deleting messages. Do I have the Manage Messages permission?').catch(() => {
        return null
      })
    }

    if (deleteResponse.size === 0) {
      return msg.reply('There were no messages younger than two weeks that I could delete.').catch(() => {
        return null
      })
    }

    if (logChannel) {
      logChannel.send(`\`${msg.author.tag}\` (${msg.author.id}) has purged \`${deleteCount}\` messages from \`${channel.name}\` (${channel.id}).`).catch(() => {
        return null
      })
    }

    const time = new Date()
    log(`\r\n[${time}] ${msg.author.username} (${msg.author.id}) has purged ${deleteCount} messages from ${channel.name} (${channel.id}).`)
  }
}
