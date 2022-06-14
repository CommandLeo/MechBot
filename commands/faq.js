import fs from 'fs/promises';

export const command = {
	data: {
		name: 'faq',
		description: 'FAQ',
		options: [{ type: 'STRING', name: 'question', description: 'The question', autocomplete: true, required: true }]
	},
	async execute(interaction) {
		const questions = JSON.parse(await fs.readFile('./faq.json'));

		const question = interaction.options.getString('question');
		await interaction.reply(questions[question]);
	}
};
