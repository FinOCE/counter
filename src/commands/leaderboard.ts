import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

export const leaderboard = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View counting leaderboards")
    .setDMPermission(false)
    .setNSFW(false)
    .addSubcommand(subcommand =>
      subcommand.setName("server").setDescription("View the user leaderboard for this server")
    )
    .addSubcommandGroup(group =>
      group
        .setName("global")
        .setDescription("View counting leaderboards across all of Discord")
        .addSubcommand(subcommand =>
          subcommand.setName("servers").setDescription("View the highest current server counts")
        )
        .addSubcommand(subcommand =>
          subcommand.setName("users").setDescription("View the highest rated individual users")
        )
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {}
}
