import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Typography } from '@mui/material';

import SelectRoom from './components/SelectRoom';
import RoomSchedule from './components/RoomSchedule';

function App() {
	return (
		<Router>
			<Routes>
				<Route path='/' element={<SelectRoom />} />
				<Route path='/:room' element={<RoomSchedule />} />

				<Route
					path='*'
					element={
						<>
							<Typography variant='h5' gutterBottom style={{ marginTop: 100, textAlign: 'center' }}>
								Page not found!
							</Typography>
						</>
					}
				/>
			</Routes>
		</Router>
	);
}

export default App;
