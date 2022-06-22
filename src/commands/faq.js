import {FAQ, readJson} from "../io.js";

export const command = {
	data: {
		name: 'faq',
		description: 'FAQ',
		options: [{ type: 'STRING', name: 'question', description: 'The question to answer', autocomplete: true, required: true }]
	},
	async execute(interaction) {
		const questions = readJson(FAQ)

		const question = interaction.options.getString('question');
		await interaction.reply(questions[question]);
	}
};
