import React from 'react';
import { useParams } from 'react-router-dom';

import { Event } from '../types';

import axios from 'axios';
import moment, { Moment } from 'moment';

import { LocalizationProvider, PickersDay, PickersDayProps, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { useTheme } from '@mui/material/styles';
import '../datePicker.css';

import {
	AppBar,
	Avatar,
	AvatarGroup,
	Backdrop,
	Badge,
	Card,
	CardHeader,
	CircularProgress,
	Dialog,
	Divider,
	Fab,
	Grid,
	IconButton,
	List,
	ListItemButton,
	ListItemText,
	Toolbar,
	Typography,
} from '@mui/material';
import { Add, Close, Sync } from '@mui/icons-material';

import { Room } from './SelectRoom';
import RoomSettings, { SlideTransition } from './RoomSettings';

export default function RoomSchedule() {
	const theme = useTheme();

	const { room: roomID } = useParams();

	const [room, setRoom] = React.useState<Room>();
	const [loading, setLoading] = React.useState<boolean>(true);

	const [events, setEvents] = React.useState<Event[]>([]);
	const [loadingSchedule, setLoadingSchedule] = React.useState<boolean>(true);

	const [meetingNow, setMeetingNow] = React.useState<boolean>(false);
	const [meetingOverlaps15, setMeetingOverlaps15] = React.useState<Event[]>([]);
	const [meetingOverlaps30, setMeetingOverlaps30] = React.useState<Event[]>([]);
	const [meetingOverlaps60, setMeetingOverlaps60] = React.useState<Event[]>([]);
	const [bookDialogOpen, setBookDialogOpen] = React.useState<boolean>(false);

	const [selectedDate, setSelectedDate] = React.useState<Moment | null>(moment());
	const [dateRange, setDateRange] = React.useState<string[]>([moment().startOf('month').format('YYYY-MM-DD'), moment().endOf('month').format('YYYY-MM-DD')]);

	React.useEffect(() => {
		getRoomDetail();

		setTimeout(function () {
			window.location.reload();
		}, 300000);
	}, []);

	React.useEffect(() => {
		getSchedule();
	}, [dateRange]);

	React.useEffect(() => {
		setMeetingOverlaps15(
			events
				.filter((e) => moment(e.start.dateTime).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD'))
				.filter((e) => moment() <= moment(e.end.dateTime) && moment().add(15, 'minutes') >= moment(e.start.dateTime))
		);
		setMeetingOverlaps30(
			events
				.filter((e) => moment(e.start.dateTime).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD'))
				.filter((e) => moment() <= moment(e.end.dateTime) && moment().add(30, 'minutes') >= moment(e.start.dateTime))
		);
		setMeetingOverlaps60(
			events
				.filter((e) => moment(e.start.dateTime).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD'))
				.filter((e) => moment() <= moment(e.end.dateTime) && moment().add(60, 'minutes') >= moment(e.start.dateTime))
		);
	}, [events]);

	const getRoomDetail = async () => {
		setLoading(true);

		await axios
			.get(`/api/room/${roomID}`)
			.then(({ data }) => {
				setRoom(data);
				setLoading(false);
				getSchedule();
			})
			.catch((error) => {
				console.error(error);
			});
	};

	const getSchedule = async () => {
		setLoadingSchedule(true);
		axios
			.get(`/api/events/${roomID}?start=${dateRange[0]}&end=${dateRange[1]}`)
			.then(({ data }) => {
				setEvents(data);
				setLoadingSchedule(false);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	const handleBookNow = async (duration: number) => {
		if (room) {
			setLoadingSchedule(true);

			await axios
				.post(`/api/events/${roomID}`, {
					subject: 'Walk-up Book',
					location: room.displayName,
					locationAddress: room.userPrincipalName,
					start: moment().format('YYYY-MM-DDTHH:mm:00'),
					end: moment().add(duration, 'minutes').format('YYYY-MM-DDTHH:mm:00'),
				})
				.then(({ data }) => {
					setBookDialogOpen(false);
					getSchedule();
				})
				.catch((error) => {
					console.error(error);
				});
		} else {
			console.error('Room details not available!', room);
		}
	};

	return (
		<>
			<Backdrop sx={{ color: '#fff' }} open={loading}>
				<CircularProgress color='inherit' />
			</Backdrop>
			<div style={{ display: 'flex' }}>
				<main style={{ flexGrow: 1, height: '100vh', overflow: 'auto' }}>
					<Grid container>
						<Grid item xs={5} style={{ height: '100vh' }}>
							<LocalizationProvider dateAdapter={AdapterMoment}>
								<StaticDatePicker
									orientation='portrait'
									openTo='day'
									value={selectedDate}
									onChange={(newDate) => setSelectedDate(newDate)}
									onMonthChange={(newMonth) => {
										setDateRange([moment(newMonth).startOf('month').format('YYYY-MM-DD'), moment(newMonth).endOf('month').format('YYYY-MM-DD')]);
									}}
									slots={{
										day: (props: PickersDayProps<Moment> & { selectedDay?: Moment | null }) => {
											const { day, selectedDay, ...other } = props;

											const count = events.filter((d) => moment(d.start.dateTime).format('YYYY-MM-DD') === moment(day).format('YYYY-MM-DD')).length;
											let meetingNow = false;
											events
												.filter((e) => moment(e.start.dateTime).format('YYYY-MM-DD') === moment(day).format('YYYY-MM-DD'))
												.forEach((event) => {
													if (moment().isBetween(moment(event.start.dateTime), moment(event.end.dateTime))) {
														meetingNow = true;
													}
												});

											return (
												<span style={{ width: 'calc(100% / 7)', textAlign: 'center', marginTop: 6 }}>
													<Badge badgeContent={count} overlap='circular' className={meetingNow ? 'now-badge' : 'default-badge'}>
														<PickersDay {...other} day={day} />
													</Badge>{' '}
												</span>
											);
										},
									}}
									slotProps={{
										day: {
											selectedDay: selectedDate,
										} as any,
									}}
									renderLoading={() => <CircularProgress />}
									loading={loadingSchedule}
									disabled={loadingSchedule}
								/>
							</LocalizationProvider>

							{room && <RoomSettings room={room} getRoomDetail={getRoomDetail} />}
						</Grid>
						<Grid item xs={7}>
							{room && room.image?.length > 0 && (
								<img
									alt='Room Image'
									src={room.image}
									onError={({ currentTarget }) => {
										currentTarget.style.display = 'none';
									}}
									style={{
										objectFit: 'cover',
										width: '58.3333333%',
										height: '100%',
										position: 'absolute',
										filter: theme.palette.mode === 'dark' ? 'brightness(50%)' : 'brightness(90%)',
										zIndex: -5,
									}}
								/>
							)}

							<Grid container spacing={2} sx={{ padding: 2 }}>
								{events
									.filter((e) => moment(e.start.dateTime).format('MM-DD-YYYY') === selectedDate?.format('MM-DD-YYYY'))
									.map((e, i) => (
										<Grid key={i} item xs={12}>
											<Card sx={{ width: '100%' }} className={moment().isBetween(moment(e.start.dateTime), moment(e.end.dateTime)) ? 'active-event' : 'inactive-event'}>
												<CardHeader
													avatar={
														<AvatarGroup max={4}>
															{e.attendees
																.filter((a) => a.emailAddress.address !== roomID)
																.map((attendee, i) => (
																	<Avatar key={i} alt={attendee.emailAddress.name} src={`/api/photo/${attendee.emailAddress.address}/96`} />
																))}
														</AvatarGroup>
													}
													title={e.subject}
													subheader={moment(e.start.dateTime).format('h:mmA') + ' - ' + moment(e.end.dateTime).format('h:mmA')}
												/>
											</Card>
										</Grid>
									))}
							</Grid>
							{room && (
								<>
									{room.allowWalkup && (
										<Fab
											variant='extended'
											color='primary'
											onClick={() => setBookDialogOpen(true)}
											disabled={meetingNow || loadingSchedule}
											sx={{ position: 'fixed', bottom: 10, right: 10 }}
										>
											<Add sx={{ mr: 1 }} />
											Book {room.displayName || 'Room'}
										</Fab>
									)}

									<Dialog fullScreen open={bookDialogOpen} onClose={() => setBookDialogOpen(false)} TransitionComponent={SlideTransition}>
										<AppBar style={{ position: 'relative' }}>
											<Toolbar>
												<IconButton edge='start' color='inherit' onClick={() => setBookDialogOpen(false)}>
													{loadingSchedule ? <CircularProgress style={{ color: '#fff', height: 24, width: 24 }} /> : <Close />}
												</IconButton>
												<Typography style={{ flex: 1 }} variant='h6'>
													Book {room.displayName || 'Room'}
												</Typography>
											</Toolbar>
										</AppBar>
										<List>
											<ListItemButton disabled={loadingSchedule || meetingOverlaps15.length > 0} onClick={() => handleBookNow(15)}>
												<ListItemText
													primary='15 Minutes'
													secondary={
														meetingOverlaps15.length > 0 && (
															<span style={{ color: '#ff1723' }}>
																Unavailable - {meetingOverlaps15.length} Meeting{meetingOverlaps15.length > 1 && 's'} Overlap{meetingOverlaps15.length === 1 && 's'}
															</span>
														)
													}
												/>
											</ListItemButton>
											<Divider />
											<ListItemButton disabled={loadingSchedule || meetingOverlaps30.length > 0} onClick={() => handleBookNow(30)}>
												<ListItemText
													primary='30 Minutes'
													secondary={
														meetingOverlaps30.length > 0 && (
															<span style={{ color: '#ff1723' }}>
																Unavailable - {meetingOverlaps30.length} Meeting{meetingOverlaps30.length > 1 && 's'} Overlap{meetingOverlaps30.length === 1 && 's'}
															</span>
														)
													}
												/>
											</ListItemButton>
											<Divider />
											<ListItemButton disabled={loadingSchedule || meetingOverlaps60.length > 0} onClick={() => handleBookNow(60)}>
												<ListItemText
													primary='1 Hour'
													secondary={
														meetingOverlaps60.length > 0 && (
															<span style={{ color: '#ff1723' }}>
																Unavailable - {meetingOverlaps60.length} Meeting{meetingOverlaps60.length > 1 && 's'} Overlap{meetingOverlaps60.length === 1 && 's'}
															</span>
														)
													}
												/>
											</ListItemButton>
										</List>
									</Dialog>
								</>
							)}
						</Grid>
					</Grid>

					<Grid container style={{ position: 'fixed', top: 0 }}>
						<Grid item xs={5}>
							<Fab size='medium' sx={{ position: 'relative', float: 'right', margin: 1 }} onClick={() => window.location.reload()}>
								<Sync />
							</Fab>
						</Grid>
					</Grid>
				</main>
			</div>
		</>
	);
}
