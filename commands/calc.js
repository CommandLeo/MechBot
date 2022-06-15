import { evaluate } from 'mathjs';

export const command = {
	data: {
		name: 'calc',
		description: 'Evaluates an expression',
		options: [{ type: 'STRING', name: 'expression', description: 'The expression to evaluate', required: true }]
	},
	async execute(interaction) {
		const expression = interaction.options.getString('expression');

		try {
			const result = evaluate(expression);

			await interaction.reply(result.toString());
		} catch {
			await interaction.reply({ content: 'Invalid expression!', ephemeral: true });
		}
	}
};
