import { Formatters } from 'discord.js';
import { client } from '../index.js';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function createReminder(member, channel, msg, time) {
	const date = Date.now();
	const endDate = date + time;

	const Reminders = client.sequelize.model('reminders');
	const reminder = await Reminders.create({ message: msg, endDate, date, memberId: member.id, channelId: channel.id });

	wait(time).then(() => remind(member, channel, msg, date, reminder));
}

async function remind(member, channel, msg, date, reminder) {
	await channel?.send({ content: `Reminder for ${member}: ${msg}\nSet: ${Formatters.time(Math.floor(date / 1000), 'R')}`, allowedMentions: { users: [member.id] } });
	await reminder.destroy();
}

export async function checkReminders(client) {
	const guild = client.GUILD;

	const Reminders = client.sequelize.model('reminders');
	const reminderList = await Reminders.findAll();

	await Promise.all(
		reminderList.map(async reminder => {
			const { message, endDate, date, memberId, channelId } = reminder;
			const member = await guild.members.fetch(memberId);
			const channel = await guild.channels.fetch(channelId);
			await wait(endDate - Date.now());
			await remind(member, channel, message, date, reminder);
		})
	);
}
