const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("logout")
		.setDescription("Logout from 42 network"),
	async execute(interaction) {
		await interaction.reply("Logout command executed!");
	},
}