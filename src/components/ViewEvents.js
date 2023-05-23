import React, { Component } from 'react';
import moment from 'moment';

import CssBaseline from '@material-ui/core/CssBaseline';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import CircularProgress from '@material-ui/core/CircularProgress';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import Tooltip from '@material-ui/core/Tooltip';
import Badge from '@material-ui/core/Badge';

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import SyncIcon from '@material-ui/icons/Sync';

import Dialog from '@material-ui/core/Dialog';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';

import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';

class SelectRoom extends Component {
	constructor(props) {
		super(props);
		this.state = {
			apiUrl: window.location.hostname === 'localhost' || window.location.hostname === 'blade' ? 'http://blade:8080' : '',
			room: this.props.match.params.room,
			roomName: 'Room',
			events: [],
			datesWithEvents: [],
			loading: true,
			date: moment(),
			dateRange: [moment().startOf('month').format('YYYY-MM-DD'), moment().endOf('month').format('YYYY-MM-DD')],
			nextGetEvent: null,
			meetingNow: false,

			meetingFor15: true,
			meetingFor30: true,
			meetingFor60: true,
		};

		this.bookDialogTransition = React.forwardRef(function Transition(props, ref) {
			return <Slide direction='up' ref={ref} {...props} />;
		});

		this.timeout = null;
	}

	componentDidMount() {
		this.getEvents();

		setTimeout(function () {
			window.location.reload();
		}, 600000);
	}

	startSchedule = () => {
		clearTimeout(this.timeout);

		this.timeout = setTimeout(() => {
			this.getEvents();
		}, 60000);
	};

	getEvents = () => {
		fetch(this.state.apiUrl + '/api/getEvents/' + this.state.room + '?start=' + this.state.dateRange[0] + '&end=' + this.state.dateRange[1], {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		}).then((response) => {
			if (!response.ok) {
				response.json().then((text) => {
					this.startSchedule();
					console.log(text);
					// this.handleSnackbarOpen('Error getting printer list!', 'error');
				});
			} else {
				return response.json().then((data) => {
					try {
						console.log(data[1].attendees.filter((a) => a.type === 'resource')[0].emailAddress.name);

						this.setState({ events: data, loading: false, roomName: data.length > 0 ? data[1].attendees.filter((a) => a.type === 'resource')[0].emailAddress.name : 'Room' }, () => {
							data.filter((e) => moment(e.start.dateTime).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')).forEach((event) => {
								var meetingNowTemp = false;
								if (moment().isBetween(moment(event.start.dateTime), moment(event.end.dateTime))) {
									this.setState({ meetingNow: true });
									meetingNowTemp = true;
								} else {
									if (!meetingNowTemp) this.setState({ meetingNow: false });
								}

								if (moment(event.start.dateTime).isBetween(moment(), moment().add(15, 'minutes')) || moment(event.end.dateTime).isBetween(moment(), moment().add(15, 'minutes'))) {
									this.setState({ meetingFor15: false });
								} else {
									this.setState({ meetingFor15: true });
								}

								if (moment(event.start.dateTime).isBetween(moment(), moment().add(30, 'minutes')) || moment(event.end.dateTime).isBetween(moment(), moment().add(30, 'minutes'))) {
									this.setState({ meetingFor30: false });
								} else {
									this.setState({ meetingFor30: true });
								}

								if (moment(event.start.dateTime).isBetween(moment(), moment().add(60, 'minutes')) || moment(event.end.dateTime).isBetween(moment(), moment().add(60, 'minutes'))) {
									this.setState({ meetingFor60: false });
								} else {
									this.setState({ meetingFor60: true });
								}
							});
						});
						var datesWithEvents = [];
						data.forEach((event) => {
							var date = moment(event.start.dateTime).format('YYYY-MM-DD');
							datesWithEvents.push(date);
						});
						this.setState({ datesWithEvents: datesWithEvents });

						this.startSchedule();
					} catch (error) {
						this.setState({ events: [], datesWithEvents: [], loading: false });
						console.log('no events');
					}
				});
			}
		});
	};

	handleMonthChange = (event, value) => {
		this.setState({ dateRange: [moment(event).format('YYYY-MM-DD'), moment(event).endOf('month').format('YYYY-MM-DD')], loading: true }, () => {
			this.getEvents();
		});
	};
	handleDateChange = (event, value) => {
		this.setState({ date: event });
	};

	handleBookDialogOpen = () => {
		this.setState({ loading: true, bookDialogOpen: true }, () => {
			this.getEvents();
		});
		// this.setState({ bookDialogOpen: true });
	};

	handleBookDialogClose = () => {
		this.setState({ bookDialogOpen: false });
	};

	handleBookNow = (duration) => {
		this.setState({ loading: true });

		//2017-04-15T12:00:00

		fetch(this.state.apiUrl + '/api/createEvent/' + this.state.room, {
			method: 'POST',
			body: JSON.stringify({
				subject: 'Walk-up Book',
				location: this.state.roomName,
				locationAddress: this.state.room,
				start: moment().format('YYYY-MM-DDTHH:mm:00'),
				end: moment().add(duration, 'minutes').format('YYYY-MM-DDTHH:mm:00'),
			}),
			headers: {
				'Content-Type': 'application/json',
			},
		}).then((response) => {
			if (!response.ok) {
				response.json().then((text) => {
					console.error(text);
				});
			} else {
				return response.json().then((data) => {
					console.log(data);
					this.setState({ bookDialogOpen: false }, () => {
						this.getEvents();
					});
				});
			}
		});

		console.log(duration);
	};

	render() {
		return (
			<div style={{ display: 'flex' }}>
				<CssBaseline />
				<main style={{ flexGrow: 1, height: '100vh', overflow: 'auto' }}>
					<Grid container>
						<Grid item xs={5} style={{ height: '100vh' }}>
							<MuiPickersUtilsProvider utils={MomentUtils}>
								<DatePicker
									autoOk
									orientation='portrait'
									variant='static'
									openTo='date'
									value={this.state.date}
									onMonthChange={this.handleMonthChange}
									onChange={this.handleDateChange}
									renderDay={(day, selectedDate, isInCurrentMonth, dayComponent) => {
										// const date = makeJSDateObject(day); // skip this step, it is required to support date libs
										const isSelected = isInCurrentMonth && this.state.datesWithEvents.includes(moment(day).format('YYYY-MM-DD'));
										const count = this.state.datesWithEvents.filter((d) => d === moment(day).format('YYYY-MM-DD')).length;
										var meetingNow = false;

										this.state.events
											.filter((e) => moment(e.start.dateTime).format('YYYY-MM-DD') === moment(day).format('YYYY-MM-DD'))
											.forEach((event) => {
												if (moment().isBetween(moment(event.start.dateTime), moment(event.end.dateTime))) {
													meetingNow = true;
												}
											});

										// You can also use our internal <Day /> component
										if (isSelected) {
											return (
												<Badge badgeContent={count} overlap='circle' className={meetingNow ? 'now-badge' : 'default-badge'}>
													{dayComponent}
												</Badge>
											);
										} else {
											return dayComponent;
										}
									}}
								/>
							</MuiPickersUtilsProvider>
						</Grid>
						<Grid item xs={7}>
							<img
								alt='BackgroundImage'
								src={'/images/' + this.state.room + '.jpg'}
								style={{ objectFit: 'cover', width: '58.3333333%', height: '100%', position: 'absolute', filter: 'brightness(30%)' }}
							/>
							{this.state.loading ? (
								<div style={{ position: 'relative', textAlign: 'center', top: '40%' }}>
									<CircularProgress />
								</div>
							) : this.state.events.length > 0 ? (
								this.state.events
									.filter((e) => moment(e.start.dateTime).format('MM-DD-YYYY') === this.state.date.format('MM-DD-YYYY'))
									.map((event) => (
										<Paper key={Math.random()} className={moment().isBetween(moment(event.start.dateTime), moment(event.end.dateTime)) ? 'active-event' : 'inactive-event'}>
											<List>
												<ListItem>
													<ListItemAvatar>
														<AvatarGroup style={{ paddingRight: 16 }}>
															{event.attendees
																.filter((a) => a.emailAddress.address !== this.state.room)
																.map((attendee, i) => (
																	<Tooltip title={attendee.emailAddress.name} key={Math.random()}>
																		<Avatar
																			alt={getInitials(attendee.emailAddress.name)}
																			src={
																				isCompanyDomain(attendee.emailAddress.address)
																					? 'https://photo.example.com/api/photo/' + attendee.emailAddress.address + '/96'
																					: '/noimage'
																			}
																		/>
																	</Tooltip>
																))}
															{event.attendees.filter((a) => a.emailAddress.address !== this.state.room).length === 0 && (
																<Tooltip title={this.state.roomName} key={Math.random()}>
																	<Avatar
																		alt={getInitials(this.state.room)}
																		src={isCompanyDomain(this.state.room) ? 'https://photo.example.com/api/photo/' + this.state.room + '/96' : '/noimage'}
																	/>
																</Tooltip>
															)}
														</AvatarGroup>
													</ListItemAvatar>
													<ListItemText
														primary={event.subject}
														secondary={moment(event.start.dateTime).format('h:mmA') + ' - ' + moment(event.end.dateTime).format('h:mmA')}
													/>
												</ListItem>
											</List>
										</Paper>
									))
							) : (
								'no events'
							)}
						</Grid>
					</Grid>
					<Fab
						color='primary'
						variant='extended'
						style={{ position: 'fixed', bottom: 10, right: 10 }}
						disabled={this.state.meetingNow || this.state.loading}
						onClick={this.handleBookDialogOpen}
					>
						<AddIcon />
						Book {this.state.roomName}
					</Fab>

					<Grid container style={{ position: 'fixed', top: 0 }}>
						<Grid item xs={5}>
							<Fab
								style={{ position: 'relative', float: 'right', margin: 10 }}
								size='small'
								onClick={() => {
									this.setState({ loading: true });
									this.getEvents();
								}}
							>
								<SyncIcon />
							</Fab>
						</Grid>
					</Grid>
				</main>
				<Dialog fullScreen open={this.state.bookDialogOpen} onClose={this.handleBookDialogClose} TransitionComponent={this.bookDialogTransition}>
					<AppBar style={{ position: 'relative' }}>
						<Toolbar>
							<IconButton edge='start' color='inherit' onClick={this.handleBookDialogClose} aria-label='close'>
								{this.state.meetingNow || this.state.loading ? <CircularProgress style={{ color: '#fff', height: 24, width: 24 }} /> : <CloseIcon />}
							</IconButton>
							<Typography style={{ flex: 1 }} variant='h6'>
								Book {this.state.roomName}
							</Typography>
						</Toolbar>
					</AppBar>
					<List>
						<ListItem button disabled={this.state.loading || !this.state.meetingFor15} onClick={() => this.handleBookNow(15)}>
							<ListItemText primary='15 Minutes' secondary={!this.state.meetingFor15 && <span style={{ color: '#ff1723' }}>Unavailable</span>} />
						</ListItem>
						<Divider />
						<ListItem button disabled={this.state.loading || !this.state.meetingFor30} onClick={() => this.handleBookNow(30)}>
							<ListItemText primary='30 Minutes' secondary={!this.state.meetingFor30 && <span style={{ color: '#ff1723' }}>Unavailable</span>} />
						</ListItem>
						<Divider />
						<ListItem button disabled={this.state.loading || !this.state.meetingFor60} onClick={() => this.handleBookNow(60)}>
							<ListItemText primary='1 Hour' secondary={!this.state.meetingFor60 && <span style={{ color: '#ff1723' }}>Unavailable</span>} />
						</ListItem>
					</List>
				</Dialog>
			</div>
		);
	}
}

export default SelectRoom;

var getInitials = function (string) {
	string = '' + string + '';
	var names = string.split(' '),
		initials = names[0].substring(0, 1).toUpperCase();

	if (names.length > 1) {
		initials += names[names.length - 1].substring(0, 1).toUpperCase();
	}
	return initials;
};
