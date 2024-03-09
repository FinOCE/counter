import { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import { PrismaClient } from "@prisma/client"
import { modes } from "../utils/count"

export const set = {
  data: new SlashCommandBuilder()
    .setName("set")
    .setDescription("Configure how Counter behaves in your server")
    .setDMPermission(false)
    .setNSFW(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName("channel")
        .setDescription("Set the channel where Counter will count messages")
        .addChannelOption(option =>
          option.setName("channel").setDescription("The channel where Counter will count messages").setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("role")
        .setDescription("Set the role to give users that mess up counting")
        .addRoleOption(option =>
          option.setName("role").setDescription("The role to give users that mess up counting").setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("mode")
        .setDescription("Set the gamemode to play")
        .addStringOption(option =>
          option
            .setName("mode")
            .setDescription("The gamemode to play")
            .setRequired(true)
            .setChoices(...modes.map(([name, value]) => ({ name, value })))
        )
    ),
  execute: async (prisma: PrismaClient, interaction: ChatInputCommandInteraction) => {
    const id = interaction.guild!.id

    switch (interaction.options.getSubcommand()) {
      case "channel": {
        const channel = interaction.options.getChannel("channel")!
        const channelId = channel.id

        prisma.guild.upsert({
          where: { id },
          update: { channelId },
          create: { id, channelId }
        })

        const embed = new EmbedBuilder().setDescription(`✅ Counter will now watch for counting in <#${channelId}>`)
        await interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error)
        break
      }

      case "role": {
        const role = interaction.options.getRole("role")!
        const roleId = role.id

        prisma.guild.upsert({
          where: { id },
          update: { roleId },
          create: { id, roleId }
        })

        const embed = new EmbedBuilder().setDescription(
          `✅ Counter will now give <@&${roleId}> to users that count wrong`
        )
        await interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error)
        break
      }

      case "mode": {
        const mode = interaction.options.getString("mode")!

        prisma.guild.upsert({
          where: { id },
          update: { mode },
          create: { id, mode }
        })

        const embed = new EmbedBuilder().setDescription(`✅ Counter will now play in ${mode} mode`)
        await interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error)
        break
      }
    }
  }
}
