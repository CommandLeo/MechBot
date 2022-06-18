import { Collection } from 'discord.js';
import fs from 'fs/promises';

const COMMANDS_ROOT_PATH = './src/commands/';
const COMMANDS_PATH = './commands/';

export default async function reloadCommands(client) {
	client.commands = new Collection();
	const guild = client.GUILD;

	const dirents = await fs.readdir(COMMANDS_ROOT_PATH, { withFileTypes: true });
	if (!dirents) return;

	console.log('Reloading slash commands...');

	for (const dirent of dirents) {
		if (dirent.isDirectory()) {
			const category = dirent.name;
			const commandDir = await fs.readdir(`${COMMANDS_ROOT_PATH}${category}`);
			const commandFiles = commandDir.filter(file => file.endsWith('.js'));
			if (!commandFiles) continue;

			for (const file of commandFiles) {
				const { command } = await import(`${COMMANDS_PATH}${dirent.name}/${file}`);
				if (command) client.commands.set(command.data.name, command);
			}
		} else {
			const { command } = await import(`${COMMANDS_PATH}${dirent.name}`);
			if (command) client.commands.set(command.data.name, command);
		}
	}

	const commandData = client.commands.map(command => command.data);
	await guild.commands.set(commandData).catch(console.error);
	console.log('Successfully reloaded slash commands');
}
