import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useCookies } from 'react-cookie';
import axios from 'axios';

import {
	AppBar,
	Button,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Fab,
	FormControlLabel,
	Grid,
	IconButton,
	Rating,
	Slide,
	Stack,
	Switch,
	Toolbar,
	Typography,
} from '@mui/material';
import { Settings, Close, AddAPhoto, Circle, RadioButtonUnchecked } from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';

import { Room } from './SelectRoom';

export const SlideTransition = React.forwardRef(function Transition(
	props: TransitionProps & {
		children: React.ReactElement;
	},
	ref: React.Ref<unknown>
) {
	return <Slide direction='up' ref={ref} {...props} />;
});

type RoomSettingsProps = {
	room: Room;
	getRoomDetail: () => Promise<void>;
};

export default function RoomSettings(props: RoomSettingsProps) {
	const navigate = useNavigate();
	const [cookies, setCookie] = useCookies(['room']);

	const [open, setOpen] = React.useState(false);

	const [unlockOpen, setUnlockOpen] = React.useState(false);
	const [pinLoading, setPinLoading] = React.useState(false);
	const [pinValid, setPinValid] = React.useState(false);
	const [pin, setPin] = React.useState('');
	const [error, setError] = React.useState('');

	// settings
	const [allowWalkup, setAllowWalkup] = React.useState<boolean>(props.room.allowWalkup || true);
	const [image, setImage] = React.useState<string>(props.room.image || '');

	const handleDigit = (digit: number) => {
		setPin(pin + digit.toString());
	};

	React.useEffect(() => {
		if (pin.length >= 6) {
			setPinLoading(true);
			checkPin();
		}

		if (pin.length !== 0) {
			setError('');
		}
	}, [pin]);

	const checkPin = async () => {
		await axios
			.post(`/api/checkPin`, {
				pin: pin,
			})
			.then(({ data }) => {
				setPinValid(true);
				setTimeout(() => {
					setUnlockOpen(false);
					setOpen(true);
				}, 750);
			})
			.catch((error) => {
				setPin('');
				setError('Invalid Pin!');
				setPinLoading(false);
				console.error(error);
			});
	};

	const handleClose = () => {
		setOpen(false);
		setUnlockOpen(false);
		setPinLoading(false);
		setPinValid(false);
		setPin('');
		setError('');
	};

	const saveConfig = async () => {
		await axios
			.post(`/api/room/${props.room.userPrincipalName}`, {
				userPrincipalName: props.room.userPrincipalName,
				allowWalkup: allowWalkup,
				image: image,
			})
			.then(({ data }) => {
				handleClose();
				props.getRoomDetail();
			})
			.catch((error) => {
				console.log(error);
			});
	};

	return (
		<>
			<Fab size='small' sx={{ position: 'fixed', bottom: 10, left: 10 }} onClick={() => setUnlockOpen(true)}>
				<Settings />
			</Fab>
			<Dialog open={unlockOpen} onClose={handleClose}>
				<DialogTitle>Enter Admin PIN</DialogTitle>
				<DialogContent>
					<Stack direction='row' justifyContent='center' alignItems='center' sx={{ marginBottom: 1 }}>
						<Rating
							readOnly
							value={pin.length}
							max={6}
							size='large'
							icon={<Circle color={pinValid ? 'success' : 'inherit'} />}
							emptyIcon={error.length > 0 ? <RadioButtonUnchecked color={'error'} /> : <RadioButtonUnchecked />}
						/>
					</Stack>

					<Grid container direction='row' justifyContent='center' alignItems='center' sx={{ maxWidth: 192 }}>
						<Grid item xs={4}>
							<Fab color='default' sx={{ margin: 0.5 }} onClick={() => handleDigit(1)} disabled={pinLoading}>
								<span style={{ fontSize: 32 }}>1</span>
							</Fab>
						</Grid>
						<Grid item xs={4}>
							<Fab color='default' sx={{ margin: 0.5 }} onClick={() => handleDigit(2)} disabled={pinLoading}>
								<span style={{ fontSize: 32 }}>2</span>
							</Fab>
						</Grid>
						<Grid item xs={4}>
							<Fab color='default' sx={{ margin: 0.5 }} onClick={() => handleDigit(3)} disabled={pinLoading}>
								<span style={{ fontSize: 32 }}>3</span>
							</Fab>
						</Grid>
						<Grid item xs={4}>
							<Fab color='default' sx={{ margin: 0.5 }} onClick={() => handleDigit(4)} disabled={pinLoading}>
								<span style={{ fontSize: 32 }}>4</span>
							</Fab>
						</Grid>
						<Grid item xs={4}>
							<Fab color='default' sx={{ margin: 0.5 }} onClick={() => handleDigit(5)} disabled={pinLoading}>
								<span style={{ fontSize: 32 }}>5</span>
							</Fab>
						</Grid>
						<Grid item xs={4}>
							<Fab color='default' sx={{ margin: 0.5 }} onClick={() => handleDigit(6)} disabled={pinLoading}>
								<span style={{ fontSize: 32 }}>6</span>
							</Fab>
						</Grid>
						<Grid item xs={4}>
							<Fab color='default' sx={{ margin: 0.5 }} onClick={() => handleDigit(7)} disabled={pinLoading}>
								<span style={{ fontSize: 32 }}>7</span>
							</Fab>
						</Grid>
						<Grid item xs={4}>
							<Fab color='default' sx={{ margin: 0.5 }} onClick={() => handleDigit(8)} disabled={pinLoading}>
								<span style={{ fontSize: 32 }}>8</span>
							</Fab>
						</Grid>
						<Grid item xs={4}>
							<Fab color='default' sx={{ margin: 0.5 }} onClick={() => handleDigit(9)} disabled={pinLoading}>
								<span style={{ fontSize: 32 }}>9</span>
							</Fab>
						</Grid>
						<Grid item xs={4}>
							<Fab color='default' sx={{ margin: 0.5 }} onClick={() => handleDigit(0)} disabled={pinLoading}>
								<span style={{ fontSize: 32 }}>0</span>
							</Fab>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button color='inherit' onClick={handleClose}>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={SlideTransition}>
				<AppBar sx={{ position: 'relative' }}>
					<Toolbar>
						<IconButton edge='start' color='inherit' onClick={handleClose} aria-label='close'>
							<Close />
						</IconButton>
						<Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
							{props.room.displayName || 'Room'} Settings
						</Typography>
						<Button variant='contained' color='primary' onClick={saveConfig}>
							Save
						</Button>
					</Toolbar>
				</AppBar>
				<Container maxWidth='sm' sx={{ paddingTop: 4 }}>
					<Grid container spacing={2} sx={{ padding: 2 }}>
						<Grid item xs={12}>
							<FormControlLabel control={<Switch checked={allowWalkup} onChange={(e) => setAllowWalkup(e.target.checked)} />} label='Allow Walk-up Bookings' />
						</Grid>
						<Grid item xs={12}>
							<Button fullWidth variant={image?.length > 0 ? 'contained' : 'outlined'} component='label' color='primary' startIcon={<AddAPhoto />}>
								Background Image
								<input
									hidden
									type='file'
									accept='image/png, image/gif, image/jpeg'
									onChange={(e) => {
										if (e.target.files) {
											let reader = new FileReader();
											reader.readAsDataURL(e.target.files[0]);
											reader.onload = function () {
												setImage(reader.result as string);
											};
											reader.onerror = function (error) {
												console.log('Image base64 error: ', error);
											};
										}
									}}
								/>
							</Button>
						</Grid>

						<Grid item xs={12}>
							<Button
								fullWidth
								variant='outlined'
								color='error'
								onClick={() => {
									setCookie('room', '');
									navigate(`/`);
								}}
							>
								Return to Room Selection
							</Button>
						</Grid>
					</Grid>
				</Container>
			</Dialog>
		</>
	);
}

function getBase64(file: File) {}
