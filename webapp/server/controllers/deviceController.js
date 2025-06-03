import { getAllDevices, renameDevice } from "../services/deviceService.js"; 
import {publishCommand} from "../services/mqttService.js";

export const getAllDevicesHandler = async (req, res) => { 
    try {
        const devices = await getAllDevices(); 
        res.json(devices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const renameDeviceHandler = async (req, res) => { 
    const { device_id } = req.params;
    const { custom_name } = req.body;

    try {
        await renameDevice(device_id, custom_name); 
        await publishCommand(device_id, "rename");
        res.json({ message: "Device renamed successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
