require('dotenv').config();

import axios from 'axios';

export async function getToken() {
	const params = new URLSearchParams();
	params.append('grant_type', 'client_credentials');
	params.append('client_id', process.env.AZURE_CLIENT_ID);
	params.append('client_secret', process.env.AZURE_CLIENT_SECRET);
	params.append('resource', 'https://graph.microsoft.com');
	const res = await axios.post(`https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/token`, params);
	return res.data.access_token;
}

export async function getRooms(token) {
	return axios
		.get(`https://graph.microsoft.com/v1.0/groups/${process.env.AZURE_GROUP_ID}/transitiveMembers?$select=id,displayName,userPrincipalName`, {
			headers: { Authorization: 'Bearer '.concat(token) },
		})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log(error);
			return error;
		});
}

export async function getRoom(token, room) {
	return axios
		.get(`https://graph.microsoft.com/v1.0/users/${room}?$select=id,displayName,userPrincipalName`, {
			headers: { Authorization: 'Bearer '.concat(token) },
		})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log(error);
			return error;
		});
}

export async function getEvents(token, room, start, stop) {
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
			console.log(error);
			return error;
		});
}
export async function createEvent(token, room, data) {
	return axios
		.post('https://graph.microsoft.com/v1.0/users/' + room + '/events', data, {
			headers: {
				Authorization: 'Bearer '.concat(token),
				'Content-Type': 'application/json',
			},
		})
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.log(error);
			return error;
		});
}
