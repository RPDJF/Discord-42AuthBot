const { SlashCommandBuilder } = require("discord.js");
const db = require("../utils/db");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("logout")
		.setDescription("Logout from 42 network"),
	async execute(interaction) {
		const guildDoc = await db.getData("guilds", interaction.guild.id);
		if (!guildDoc.users) {
			interaction.reply({
				content: "You are not logged in.",
				ephemeral: true,
			});
		}
		let userDoc = guildDoc.users.find(u => u.id === interaction.user.id);
		if (!userDoc || !userDoc.state) {
			interaction.reply({
				content: "You are not logged in.",
				ephemeral: true,
			});
		}
		db.deleteData("states", userDoc.state);
		delete userDoc.state;
		await db.writeData("guilds", interaction.guild.id, guildDoc);
		interaction.reply({
			content: "You have been logged out.",
			ephemeral: true,
		});
	},
}