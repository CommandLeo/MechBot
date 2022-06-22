import { client } from './index.js';

const urlRegex = /((\w+:\/\/)[-a-zA-Z0-9:@;?&=\/%\+\.\*!'\(\),\$_\{\}\^~\[\]`#|]+)/;

export default async function automod(message) {
	// Automatically delete messages in #memes that don't have any attachment or link
	const MEMES_CHANNEL = client.CHANNELS.MEMES;

	if (message.channel.id === MEMES_CHANNEL.id && !message.author.bot && !message.attachments.size && !urlRegex.test(message.content)) {
		await message.delete();
	}
}
