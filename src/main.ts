import * as discord from 'discord.js';
import * as argparse from 'argparse';
import * as utils from './utils';

async function main(): Promise<void> {
  let parser = new argparse.ArgumentParser();
  parser.add_argument('--guild-id', {
    required: true,
  });
  parser.add_argument('--bot-token', {
    required: true,
  });
  let cliArgs = parser.parse_args();

  let client = new discord.Client();

  client.on('ready', async () => {
    try {
      console.warn(`Logged in as ${client.user!.tag}`);

      let guild = await client.guilds.fetch(cliArgs.guild_id);
      let textChannels = guild.channels.cache.filter(
        (c) => c instanceof discord.TextChannel && c.viewable,
      );

      let collectedMessages = 0;
      let interval = setInterval(() => {
        console.warn(new Date().toISOString(), `Collected ${collectedMessages} messages`);
      }, 3000).unref();

      for (let channel of textChannels.values()) {
        let options: discord.ChannelLogsQueryOptions = { limit: 100 };
        while (true) {
          let messages = await (channel as discord.TextChannel).messages.fetch(options);
          if (messages.size === 0) break;

          for (let msg of messages.values()) {
            options.before = msg.id;
            console.log(JSON.stringify(msg.toJSON()));
            collectedMessages++;
          }

          // rate limit is 5 requests per 5 seconds
          await utils.wait(1000);
        }
      }

      clearInterval(interval);
    } finally {
      client.destroy();
    }
  });

  await client.login(cliArgs.bot_token);
}

void main();
