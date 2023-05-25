require('dotenv').config();

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import fs from 'fs';
import path from 'path';

import { spawn, exec } from 'child_process';

import * as MicrosoftGraph from './controllers/MicrosoftGraph';

if (!fs.existsSync('./config/config.json')) {
	try {
		fs.mkdirSync('./config');
	} catch (error) {}

	fs.writeFileSync('./config/config.json', '[]');
} else {
	try {
		JSON.parse(fs.readFileSync('./config/config.json', 'utf8'));
	} catch (error) {
		console.log('Config file is corrupted. Recreating config.json.', error);
		fs.writeFileSync('./config/config.json', '[]');
	}
}

const app = express();
const port = process.env.PORT || 8080;

app.use(
	cors({
		origin: '*',
		optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
	})
);

app.use(bodyParser.json({ limit: '50mb' }));

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api/rooms', MicrosoftGraph.getRooms);
app.get('/api/room/:room', MicrosoftGraph.getRoom);
app.post('/api/room/:room', MicrosoftGraph.setRoom);

app.get('/api/events/:room', MicrosoftGraph.getEvents);
app.post('/api/events/:room', MicrosoftGraph.createEvent);

app.post('/api/checkPin', (req, res) => {
	try {
		if (req.body.pin === process.env.ADMIN_PIN) {
			res.send('Valid Pin');
		} else {
			res.status(401);
			res.send('Invalid Pin');
		}
	} catch (error) {
		console.log(error);
		res.status(500);
		res.send(String(error));
	}
});

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname + '/dist/index.html'));
});

app.listen(port, () => {
	return console.log(`Server is listening on port ${port}`);
});
