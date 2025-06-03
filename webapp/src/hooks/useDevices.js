import { useState, useEffect } from "react";
import axios from "axios";

const useDevices = () => {
    const [devices, setDevices] = useState([]); // List of all devices
    const [statuses, setStatuses] = useState({}); // Online/offline statuses


    useEffect(() => {
        // fetch device list from MySQL
        axios.get("http://localhost:5000/api/devices")
            .then(response => setDevices(response.data))
            .catch(error => console.error("Error fetching devices:", error));

        // fetch online/offline statuses from MQTT
        axios.get("http://localhost:5000/status/")
            .then(response => setStatuses(response.data.status)) 
            .catch(error => console.error("Error fetching device statuses:", error));

        // auto-refresh every 5 seconds
        const interval = setInterval(() => {
            axios.get("http://localhost:5000/status")
                .then(response => setStatuses(response.data.status))
                .catch(error => console.error(" Error refreshing statuses:", error));
        }, 5000);

        return () => clearInterval(interval); 
    }, []);

    const renameDevice = (id, custom_name) => {
        axios.put(`http://localhost:5000/api/device/${id}/rename`, { custom_name })
            .then(() => {
                setDevices(prevDevices =>
                    prevDevices.map(device =>
                        device.device_id === id ? { ...device, custom_name } : device
                    )
                );
            })
            .catch(error => console.error(" Error renaming device:", error));
    };



    return { devices, statuses, renameDevice };
};

export default useDevices;
