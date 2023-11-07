// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');


const file = fs.readFileSync('jest-report.json');
const json = JSON.parse(file);

dotenv.config();

const EMOJI_OK = ':white_check_mark:';
const EMOJI_FAIL = ':x:';
const NEWLINE = '\n';

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, () => {
	if (json.numFailedTests > 0) {
		sendMessage(makeJestMessage());
	}
});

function sendMessage(message) {
	client.channels.cache.each(channel => {
		if (channel.name == 'internal-alerts') {
			channel.send(message);
		}
	});
}

const describes = {};
function makeJestMessage() {
	let message = `${NEWLINE}`;
	json.testResults.forEach(result => {
		result.assertionResults.forEach(test => {
			const ancestor = test.ancestorTitles.join(' > ');
			if (describes[ancestor] === undefined) {
				describes[ancestor] = {
					status: test.status,
					title: ancestor,
					tests: [],
				};
			}
			if (test.status !== 'passed') {
				describes[ancestor].status = test.status;
			}

			describes[ancestor].tests.push(test);
		});
	});

	Object.values(describes).forEach(desc => {
		message += `**${desc.title}**`;
		message += desc.status === 'passed' ? ' - SUCESS' : ' - FAIL';
		message += `${NEWLINE}`;
		desc.tests.forEach(test => {
			message += test.status === 'passed' ? EMOJI_OK : EMOJI_FAIL;
			message += `  ${test.title} *(${test.duration}ms)*${NEWLINE}`;
		});

		message += `${NEWLINE}`;
	});

	return message;
}

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);

// console.log(makeJestMessage());

