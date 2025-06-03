import express from 'express';
import { sendDeviceConfig } from '../services/mqttService.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { device_id, rules } = req.body;

    if (!device_id || !Array.isArray(rules)) {
        return res.status(400).json({ error: "device_id and rules[] are required" });
    }

    try {
        await sendDeviceConfig(device_id, rules);
        res.json({ status: "Configuration sent", rules });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
