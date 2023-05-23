const axios = require('axios');

module.exports = {
	getToken: async function () {
		const params = new URLSearchParams();
		params.append('grant_type', 'client_credentials');
		params.append('client_id', '');
		params.append('client_secret', '');
		params.append('resource', 'https://graph.microsoft.com');
		const res = await axios.post('https://login.microsoftonline.com/{{tenant_id}}/oauth2/token', params);
		return res.data.access_token;
	},
	getRooms: async function (token) {
		return axios
			.get('https://graph.microsoft.com/v1.0/places/microsoft.graph.room?$select=id,displayName,emailAddress', {
				headers: { Authorization: 'Bearer '.concat(token) },
			})
			.then((response) => {
				return response;
			})
			.catch((error) => {
				return error;
			});
	},
	getEvents: async function (token, room, start, stop) {
		return axios
			.get(
				'https://graph.microsoft.com/v1.0/users/' +
					room +
					'/calendar/calendarView?$top=250&$select=subject,start,end,attendees,organizer,location&startDateTime=' +
					start +
					'T00:00:00.000Z&endDateTime=' +
					stop +
					'T23:59:59.000Z&$orderby=start/dateTime',
				{
					headers: {
						Authorization: 'Bearer '.concat(token),
						Prefer: `outlook.timezone="Eastern Standard Time"`,
					},
				}
			)
			.then((response) => {
				return response;
			})
			.catch((error) => {
				return error;
			});
	},
	createEvent: async function (token, room, data) {
		return axios
			.post('https://graph.microsoft.com/v1.0/users/' + room + '/events', data, {
				headers: { Authorization: 'Bearer '.concat(token) },
				'Content-Type': 'application/json',
			})
			.then((response) => {
				return response;
			})
			.catch((error) => {
				return error;
			});
	},
};
