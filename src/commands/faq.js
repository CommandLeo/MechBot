import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';

import { client } from '../index.js';
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
	},
	async autocomplete(interaction) {
		const entries = client.faqEntries;
		const focusedValue = interaction.options.getFocused();

		await interaction.respond(
			Object.keys(entries)
				.filter(entry => entry.toLowerCase().includes(focusedValue.toLowerCase()))
				.map(entry => ({ name: entry, value: entry }))
		);
	}
};
