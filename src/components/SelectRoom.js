import React, { Component } from 'react';

import { withCookies, Cookies } from 'react-cookie';
import { Link } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

import Divider from '@material-ui/core/Divider';

import LocationOnIcon from '@material-ui/icons/LocationOn';

import CircularProgress from '@material-ui/core/CircularProgress';

class SelectRoom extends Component {
	constructor(props) {
		super(props);
		this.state = {
			apiUrl: window.location.hostname === 'localhost' || window.location.hostname === 'blade' ? 'http://blade:8080' : '',
			rooms: [],
			loading: true,
		};
	}

	componentDidMount() {
		this.getRooms();

		console.log();

		if (this.props.cookies.get('room')) {
			if (this.props.cookies.get('room').length > 5) {
				this.props.history.push('/room/' + this.props.cookies.get('room'));
			}
		}
	}

	getRooms = () => {
		fetch(this.state.apiUrl + '/api/getRooms', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		}).then((response) => {
			if (!response.ok) {
				response.json().then((text) => {
					console.log(text);
					// this.handleSnackbarOpen('Error getting printer list!', 'error');
				});
			} else {
				return response.json().then((data) => {
					this.setState({ rooms: data, loading: false });
				});
			}
		});
	};

	render() {
		const { cookies } = this.props;

		return this.state.loading === true ? (
			<div>
				<CircularProgress style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, margin: 'auto' }} />
			</div>
		) : (
			<div>
				<AppBar position='static'>
					<Toolbar>
						<Typography variant='h6'>Select Room</Typography>
					</Toolbar>
				</AppBar>

				<List>
					{this.state.rooms.map((room) => (
						<>
							<ListItem
								button
								onClick={() => {
									cookies.set('room', room.emailAddress, { path: '/' });
									this.props.history.push('/room/' + room.emailAddress);
								}}
								key={Math.random()}
								style={{ textDecoration: 'none', color: 'inherit' }}
							>
								<ListItemAvatar>
									<Avatar>
										<LocationOnIcon />
									</Avatar>
								</ListItemAvatar>
								<ListItemText primary={room.displayName} />
							</ListItem>
							<Divider variant='inset' component='li' />
						</>
					))}
				</List>
			</div>
		);
	}
}

export default withCookies(SelectRoom);
