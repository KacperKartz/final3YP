import pool from "../config/db.js"; 



export let sensorDataStore = {};
// Get all devices
export const getAllDevices = async () => {
    const [rows] = await pool.query("SELECT * FROM devices");
    return rows;
};

// Update or Insert Device Status
export const updateDeviceStatus = async (device_id) => {
    await pool.query(
        `INSERT INTO devices (device_id, last_seen) 
         VALUES (?, NOW()) 
         ON DUPLICATE KEY UPDATE last_seen = NOW()`,
        [device_id]
    );
};

// Rename a device
export const renameDevice = async (device_id, custom_name) => {
    await pool.query(
        `UPDATE devices SET custom_name = ? WHERE device_id = ?`,
        [custom_name, device_id]
    );
};


export const saveSensorData = async (deviceId, sensorType, value) => {
    if (!sensorDataStore[deviceId]) sensorDataStore[deviceId] = {};
    sensorDataStore[deviceId][sensorType] = value;
};
