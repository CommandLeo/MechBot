import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';
import { FAQ, readJson } from '../io.js';

export const command = {
	data: {
		name: 'faq',
		description: 'FAQ',
		type: ApplicationCommandType.ChatInput,
		options: [{ type: ApplicationCommandOptionType.String, name: 'question', description: 'The question to answer', autocomplete: true, required: true }]
	},
	async execute(interaction) {
		const data = readJson(FAQ);

		const question = interaction.options.getString('question');
		const answer = data[question];

		await interaction.reply(answer || { content: 'Invalid question', ephemeral: true });
	}
};
