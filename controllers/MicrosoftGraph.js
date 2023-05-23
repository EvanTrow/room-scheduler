const graph = require('./graph');

module.exports = function (e, db) {
	var module = {};

	//  /api/getRooms
	module.getRooms = async (request, response, next) => {
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
	};

	//  /api/getEvents/:room
	module.getEvents = async (request, response, next) => {
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
	};

	//  /api/getEvents/:room
	module.createEvent = async (request, response, next) => {
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
	};
	return module;
};
