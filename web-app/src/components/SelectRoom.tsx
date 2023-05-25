import React from 'react';

import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import axios from 'axios';

import { AppBar, Avatar, Divider, List, ListItemAvatar, ListItemText, Toolbar, Typography, ListItemButton, Backdrop, CircularProgress } from '@mui/material';
import { LocationOn } from '@mui/icons-material';

export type Room = {
	id: string;
	displayName: string;
	userPrincipalName: string;

	// config
	allowWalkup: boolean;
	image: string;
};

function SelectRoom() {
	const navigate = useNavigate();

	const [cookies, setCookie] = useCookies(['room']);

	const [loading, setLoading] = React.useState<boolean>(true);
	const [rooms, setRooms] = React.useState<Room[]>([]);

	React.useEffect(() => {
		if (cookies.room !== '') {
			navigate(`/${cookies.room}`);
		} else {
			axios
				.get(`/api/rooms`)
				.then(({ data }) => {
					setRooms(data);
					setLoading(false);
				})
				.catch((error) => {
					console.error(error);
					setLoading(false);
				});
		}
	}, []);

	return (
		<>
			<Backdrop sx={{ color: '#fff' }} open={loading}>
				<CircularProgress color='inherit' />
			</Backdrop>

			<AppBar position='static'>
				<Toolbar>
					<Typography variant='h6'>Select Room</Typography>
				</Toolbar>
			</AppBar>

			<List>
				{rooms.map((room, i) => (
					<>
						<ListItemButton
							onClick={() => {
								setCookie('room', room.userPrincipalName);
								navigate(`/${room.userPrincipalName}`);
							}}
							style={{ textDecoration: 'none', color: 'inherit' }}
						>
							<ListItemAvatar>
								<Avatar>
									<LocationOn />
								</Avatar>
							</ListItemAvatar>
							<ListItemText primary={room.displayName} />
						</ListItemButton>
						{rooms.length - 1 !== i && <Divider component='li' />}
					</>
				))}
			</List>
		</>
	);
}

export default SelectRoom;
