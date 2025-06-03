import express from 'express';
import { deviceStatuses, mqttStatus } from '../services/mqttService.js';

const router = express.Router();

// GET status
router.get('/', (req, res) => {
    res.json({ status: deviceStatuses });
});

router.get('/mqtt', (req, res) => {
    res.json({ status: mqttStatus });
})

export default router;
