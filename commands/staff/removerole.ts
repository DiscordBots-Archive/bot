import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import * as Logger from '../../util/Logger'
import * as moment from 'moment'
import { Message, TextChannel, GuildChannel, User, Role, RoleStore } from 'discord.js';

module.exports = class RemoveRoleCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'removerole',
      aliases: ['delrole', 'demote'],
      group: 'staff',
      memberName: 'removerole',
      description: 'Removes a mentioned role from a mentioned user.',
      details: oneLine`
        This command takes in a mentioned user and a mentioned role, 
        and removes that role from that user.
			`,
      examples: ['removerole @JasonHaxStuff @Owner', 'demote @JasonHaxStuff @Owner'],
      guildOnly: true,

      args: [{
        key: 'username',
        label: 'username',
        prompt: 'Who would you like to remove the role from?',
        type: 'user',
        infinite: false
      },
      {
        key: 'role',
        label: 'role',
        prompt: 'What role would you like to remove from the user?',
        type: 'role',
        infinite: false
      }
      ]
    })
  }

  async run(msg: commando.CommandMessage, { user, role }: { user: User, role: Role }): Promise<Message | Message[]> {
    if (!msg.member.hasPermission('MANAGE_ROLES')) {
      await msg.reply('You can\'t remove roles.')
      return msg.delete()
    }

    const member = msg.guild.member(user)

    if (msg.member.roles.highest.comparePositionTo(role) < 0) {
      await msg.reply('You can\'t remove roles that are higher than yours.')
      return msg.delete()
    }

    const channel = msg.guild.channels.find((channel: GuildChannel) => channel.name === 'machobot-audit') as TextChannel
    const removeRoleResponse = await member.roles.remove(role).catch(() => {
      return
    })

    if (!removeRoleResponse) {
      await msg.reply('I can\'t remove roles.')
      return msg.delete()
    }

    if (channel) {
      channel.send(`${msg.author.username} has removed role ${role.name} from ${member.displayName}.`)
    }

    const time = moment().format('YYYY-MM-DD HH:mm:ss Z')
    Logger.log(`\r\n[${time}] ${msg.author.username} has removed role ${role.name} from ${member.displayName}.`)

    await msg.reply(`Removed role ${role.name} from ${member.displayName}.`)
    return msg.delete()
  }
}
