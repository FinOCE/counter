import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import { about } from "./about"
import { set } from "./set"
import { leaderboard } from "./leaderboard"
import { stats } from "./stats"
import { vote } from "./vote"

export async function execute(interaction: ChatInputCommandInteraction) {
  switch (interaction.commandName) {
    case "about":
      return await about.execute(interaction)
    case "leaderboard":
      return await leaderboard.execute(interaction)
    case "set":
      return await set.execute(interaction)
    case "stats":
      return await stats.execute(interaction)
    case "vote":
      return await vote.execute(interaction)
    default:
      const embed = new EmbedBuilder().setDescription("Unknown command")
      await interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error)
  }
}

export function register() {
  return [about, leaderboard, set, stats, vote].map(command => command.data.toJSON())
}
