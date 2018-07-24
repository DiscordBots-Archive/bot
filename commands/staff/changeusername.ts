import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import * as Logger from '../../util/Logger'
import * as moment from 'moment'
import { Message, TextChannel, GuildChannel } from 'discord.js';
import { ownerId } from "../../config";

module.exports = class ChangeUsernameCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'changeusername',
      aliases: ['changename', 'changebotname'],
      group: 'staff',
      memberName: 'changeusername',
      description: 'Changes the username of the bot.',
      details: oneLine`
				This is an incredibly useful command that changes the username of the bot.
				Only usable by the owner, JasonHaxStuff.
			`,
      examples: ['changeusername ILikeDogs', 'changename KillMeNow'],

      args: [{
        key: 'name',
        label: 'name',
        prompt: 'What would you like to name the bot?',
        type: 'string',
        infinite: false
      }]
    })
  }

  async run(msg: commando.CommandMessage, { name }: { name: string }): Promise<Message | Message[]> {
    if (msg.author.id !== ownerId) {
      await msg.reply("Sorry, but you can't do that.")

      if (msg.channel.type == 'text') {
        return msg.delete()
      }

      return
    }

    const channel = msg.guild.channels.find((channel: GuildChannel) => channel.name === 'machobot-audit') as TextChannel

    this.client.user.setUsername(name)

    if (channel) {
      channel.send(`${msg.author.username} has changed ${this.client.user.username}'s name to ${name}.`)
    }

    let time = moment().format('YYYY-MM-DD HH:mm:ss Z')
    Logger.log(`\r\n[${time}] ${msg.author.username} has changed ${this.client.user.username}'s name to ${name}.`)

    await msg.reply(`Succesfully changed my username to ${name}!`)

    if (msg.channel.type == 'text') {
      return msg.delete()
    }
  }
}
