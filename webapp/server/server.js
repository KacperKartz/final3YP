import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// route imports
import statusRoutes from './routes/statusRoutes.js';
import publishRoutes from './routes/publishRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js'
import configRoutes from './routes/configRoutes.js'
import sensorTestRoutes from './routes/sensorTestRoutes.js'



const app = express();


app.use(cors());
app.use(express.json({ limit: '1mb' }));





// Routes
app.use('/status', statusRoutes);
app.use('/publish', publishRoutes);
app.use("/api", deviceRoutes);
app.use("/config", configRoutes);
app.use('/sensor-test', sensorTestRoutes);




// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
