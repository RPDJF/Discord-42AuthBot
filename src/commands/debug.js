const { SlashCommandBuilder, Interaction } = require("discord.js");
const db = require("../utils/db");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("debug")
		.setDescription("Get debug information"),
	/**
	 * 
	 * @param {Interaction} interaction 
	 */
	async execute(interaction) {
		console.log("Guild ID: ", interaction.guild.id);
		const guildDoc = await db.getData("guilds", interaction.guild.id);
		console.log(guildDoc);
		console.log("User ID: ", interaction.user.id);
		if (guildDoc.users) {
			const member = guildDoc.users.find(u => u.id === interaction.user.id);
			console.log(member);
			if (member.state) {
				console.log("State: ", member.state);
				const stateDoc = await db.getData("states", member.state);
				console.log(stateDoc);
			}
		}
		interaction.reply("Debug information has been sent to the console.");
	},
}