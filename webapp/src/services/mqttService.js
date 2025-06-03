
import axios from 'axios';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const publishMessage = async (device_id, message) => {
    try {
        console.log('Publishing message:', message);
        console.log('Device ID:', device_id);

        const response = await axios.post('http://localhost:5000/publish', {
            device_id,
            message
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('Published:', response.data);

        // let updateStatus = await fetchStatus();
        // setStatus(updateStatus);
    } catch (error) {
        if (error.response) {
            console.error('Server Error:', error.response.data);
        } else {
            console.error('MQTT Publish Error:', error.message);
        }
    }
};
export const publishControl = async (device_id, message) => {
    try {
        console.log('Publishing message:', message);
        console.log('Device ID:', device_id);

        const response = await axios.post('http://localhost:5000/publish/ctrl', {
            device_id,
            message
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('Published:', response.data);

        // let updateStatus = await fetchStatus();
        // setStatus(updateStatus);
    } catch (error) {
        if (error.response) {
            console.error('Server Error:', error.response.data);
        } else {
            console.error('MQTT Publish Error:', error.message);
        }
    }
};



export const mqttStatus = axios.get("http://localhost:5000/status/mqtt").then((response) => {
    return response.data.status;
});

