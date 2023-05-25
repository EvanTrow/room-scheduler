import * as graph from './graph';
import fs, { readFileSync } from 'fs';

export async function getRooms(request, response, next) {
	try {
		var token = await graph.getToken();
		var rooms = await graph.getRooms(token);

		if (rooms.data) {
			response.send(rooms.data.value);
		} else {
			response.status(rooms.response.status).send('no data');
		}
	} catch (error) {
		console.log(error);
		response.status(500).send(error);
	}
}

export async function getRoom(request, response, next) {
	try {
		var token = await graph.getToken();
		var room = await graph.getRoom(token, request.params.room);

		var config = {
			allowWalkup: true,
			image: '',
		};
		try {
			config = JSON.parse(readFileSync('./config/config.json', 'utf8')).find((c) => c.userPrincipalName == request.params.room);
		} catch (err) {}

		if (room.data) {
			response.send({ ...config, ...room.data });
		} else {
			response.status(room.response.status).send('no data');
		}
	} catch (error) {
		console.log(error);
		response.status(500).send(error);
	}
}

export async function setRoom(request, response, next) {
	try {
		fs.readFile('./config/config.json', 'utf8', (error, data) => {
			if (!error) {
				var config = [...JSON.parse(data)];
				let index = JSON.parse(data)
					.map((c) => c.userPrincipalName)
					.indexOf(request.params.room);
				if (index > -1) {
					config[index] = {
						...request.body,
					};
				} else {
					config.push({ ...request.body });
				}

				fs.writeFile('./config/config.json', JSON.stringify(config, null, 4), (error) => {
					if (error) {
						console.log(error);
						response.status(500);
						response.send(String(error));
					} else {
						response.send('ok');
					}
				});
			} else {
				console.log(error);
				response.status(500).send(error);
			}
		});
	} catch (error) {
		console.log(error);
		response.status(500).send(error);
	}
}

//  /api/getEvents/:room
export async function getEvents(request, response, next) {
	try {
		var start = request.query.start || '';
		var end = request.query.end || '';

		var token = await graph.getToken();
		var events = await graph.getEvents(token, request.params.room, start, end);

		if (events.data) {
			response.send(events.data.value);
		} else {
			console.log(events.response);
			response.status(events.response.status).send('no data');
		}
	} catch (error) {
		console.log(error);
		response.status(500).send(error);
	}
}

//  /api/getEvents/:room
export async function createEvent(request, response, next) {
	try {
		var subject = request.body.subject || 'Walk-up Book';
		var location = request.body.location || '';
		var locationAddress = request.body.locationAddress || '';
		var start = request.body.start || '';
		var end = request.body.end || '';

		var data = {
			subject: subject,
			start: {
				dateTime: start,
				timeZone: 'Eastern Standard Time',
			},
			end: {
				dateTime: end,
				timeZone: 'Eastern Standard Time',
			},
			location: {
				displayName: location,
			},
			attendees: [
				{
					emailAddress: {
						address: locationAddress,
						name: location,
					},
					type: 'required',
				},
			],
		};

		var token = await graph.getToken();
		var event = await graph.createEvent(token, request.params.room, data);

		if (event.data) {
			response.send(event.data);
		} else {
			console.log(event.response);
			response.status(event.response.status).send('no data');
		}
	} catch (error) {
		console.log(error);
		response.status(500).send(error);
	}
}

export async function getPhoto(request, response, next) {
	try {
		var size = request.params.size;
		var email = request.params.email || '';

		if (email === '') {
			response.status(404).send('missing email');
		} else {
			var availableSizes = ['48', '64', '96', '120', '240', '360', '432'];
			if (size) {
				if (availableSizes.includes(size)) {
					size = 's/' + size + 'x' + size;
				}
			}

			var token = await graph.getToken();
			var photo = await graph.getPhoto(email, size, token);

			if (photo) {
				response.set('Content-Type', 'image/png');
				response.set('Content-Length', photo.length);
				response.end(photo);
			} else {
				response.status(404).send('photo not found');
			}
		}
	} catch (error) {
		console.log(error);
		response.status(500).send(error);
	}
}
