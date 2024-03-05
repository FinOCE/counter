import { EmbedBuilder } from "discord.js"

export const AboutEmbed = () =>
  new EmbedBuilder()
    .setTitle("Counter")
    .setURL("http://5f.au/counter")
    .setDescription(
      "The iconic Discord counting game. Compete against other servers and your friends!\n\nSetup the bot in your server by using `/set channel` and `/set role` to set the channel to count in and the role to give anyone who fails to count correctly. It's recommended you prevent this role from being able to talk in the channel.\n\nCreated as part of [5f.au](https://discord.gg/deAfFeVY7u)."
    )
