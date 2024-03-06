import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import { AboutEmbed } from "../embeds/AboutEmbed"

export const about = {
  data: new SlashCommandBuilder()
    .setName("about")
    .setDescription("About this bot")
    .setDMPermission(true)
    .setNSFW(false),
  execute: async (interaction: ChatInputCommandInteraction) => {
    interaction.reply({ embeds: [AboutEmbed()], ephemeral: true }).catch(console.error)
  }
}
