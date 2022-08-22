import { ApplicationCommandType } from 'discord.js';

export const command = {
	data: {
		name: 'membercount',
		description: 'Prints how many members are in the server',
		type: ApplicationCommandType.ChatInput
	},
	async execute(interaction) {
		await interaction.reply(interaction.guild.memberCount.toString());
	}
};
