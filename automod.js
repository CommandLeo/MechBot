export default async function automod(client) {
	const urlRegex = /((\w+:\/\/)[-a-zA-Z0-9:@;?&=\/%\+\.\*!'\(\),\$_\{\}\^~\[\]`#|]+)/;
	const MEMES_CHANNEL = client.CHANNELS.MEMES;

	// Automatically delete messages in #memes that don't have any attachment or link
	client.on('messageCreate', message => {
		if (message.channel.id == MEMES_CHANNEL.id && !message.author.bot && !message.attachments.size && !urlRegex.test(message.content)) {
			message.delete();
		}
	});
}
