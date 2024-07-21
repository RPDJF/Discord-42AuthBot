const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("login")
		.setDescription("Login into 42 network"),
	async execute(interaction) {
		await interaction.reply("Login command executed!");
	},
}