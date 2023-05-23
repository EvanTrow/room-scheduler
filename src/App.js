import React, { Component } from 'react';

import { CookiesProvider } from 'react-cookie';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import './App.css';

import CssBaseline from '@material-ui/core/CssBaseline';

import { BrowserRouter, Route, Switch } from 'react-router-dom';

import SelectRoom from './components/SelectRoom';
import ViewEvents from './components/ViewEvents';

export default class App extends Component {
	constructor(props) {
		super(props);

		this.default = createMuiTheme({
			palette: {
				type: 'dark',
				primary: {
					light: '#15c4ff',
					main: '#00a9e2',
					dark: '#0088b6',
					contrastText: '#fff',
				},
			},
		});
	}

	render() {
		return (
			<CookiesProvider>
				<MuiThemeProvider theme={this.default}>
					<CssBaseline />
					<BrowserRouter>
						<Switch>
							<Route exact path='/' component={(props) => <SelectRoom {...props} />} />
							<Route exact path='/room/:room' component={(props) => <ViewEvents {...props} />} />
						</Switch>
					</BrowserRouter>
				</MuiThemeProvider>
			</CookiesProvider>
		);
	}
}
