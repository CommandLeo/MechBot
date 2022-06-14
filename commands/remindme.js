import { TextInputComponent, Modal, MessageActionRow, Formatters } from 'discord.js';
import ms from 'ms';
import { createReminder } from '../utilities/reminders.js';

const textInput = new TextInputComponent({ customId: 'reminder', label: 'Reminder', style: 'PARAGRAPH', required: true });
const row = new MessageActionRow({ components: [textInput] });
const modal = new Modal({ customId: 'reminder-modal', title: 'Write the reminder', components: [row] });

export const command = {
	data: {
		name: 'remindme',
		description: 'Sets a reminder',
		defaultPermission: false,
		options: [
			{ type: 'STRING', name: 'time', description: 'The amount of time you will be reminded in', required: true },
			{ type: 'STRING', name: 'message', description: 'The message to remind' }
		]
	},
	async execute(interaction) {
		const time = ms(interaction.options.getString('time'));
		let msg = interaction.options.getString('message');

		if (!time) return interaction.reply({ content: 'Invalid time', ephemeral: true });

		if (!msg) {
			await interaction.showModal(modal);
			const modalInteraction = await interaction.awaitModalSubmit({ filter: interaction => interaction.customId == 'reminder-modal', time: 60 * 1000 }).catch(() => null);
			if (!modalInteraction) return interaction.followUp({ content: "You didn't reply in time", ephemeral: true });
			msg = modalInteraction.fields.getTextInputValue('reminder');
			interaction = modalInteraction;
		}

		await createReminder(interaction.member, interaction.channel, msg, time);

		await interaction.reply(`Reminder set for ${ms(time, {long: true})} from now`);
	}
};
