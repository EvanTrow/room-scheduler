const path = require('path');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');

var api = express();

api.use(
	cors({
		origin: '*',
		optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
	})
);

api.use(express.static(path.join(__dirname, '/build')));

// Body Parser Middleware
api.use(bodyParser.json());

//Setting up server and SQL Connection
(async function () {
	// client auth

	start(null);
})();

async function start(db) {
	try {
		var server = api.listen(process.env.PORT || 8080, function () {
			var port = server.address().port;
			console.log('App now running on port', port);
		});

		// Microsoft Graph
		var MicrosoftGraph = require('./controllers/MicrosoftGraph')(null, db);
		api.get('/api/getRooms', MicrosoftGraph.getRooms);
		api.get('/api/getEvents/:room', MicrosoftGraph.getEvents);
		api.post('/api/createEvent/:room', MicrosoftGraph.createEvent);
		//
		//
		//
		//
		//
		//
		// Handles any requests that don't match the ones above
		api.get('*', async (req, res) => {
			try {
				res.sendFile(path.join(__dirname + '/build/index.html'));
				console;
			} catch (error) {
				console.error(error.message);
				response.status(500).send(error);
			}
		});
	} catch (error) {
		console.log(error);
	}
}
