import express from 'express';
import { publishToMQTT, publishControl } from '../services/mqttService.js';

const router = express.Router();

// POST publish message
router.post('/', async (req, res) => {
    const { device_id, message } = req.body;

    if (!device_id || !message) {
        return res.status(400).json({ error: 'Message and device_id are required' });
    }

    await publishToMQTT(device_id, message);
    res.json({ status: 'Published', message });
});



router.post('/ctrl', async (req, res) => {
    const { device_id, message } = req.body;

    if (!device_id || !message) {
        return res.status(400).json({ error: 'Message and device_id are required' });
    }

    await publishControl(device_id, message);
    res.json({ status: 'Published', message });
});






export default router;
