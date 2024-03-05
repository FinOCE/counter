import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

export const vote = {
  data: new SlashCommandBuilder()
    .setName("vote")
    .setDescription("Vote for Counter to get lives to save your streak")
    .setDMPermission(false)
    .setNSFW(false),
  execute: async (interaction: ChatInputCommandInteraction) => {}
}
