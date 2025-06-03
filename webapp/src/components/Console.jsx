import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Console = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchSensorData = () => {
      axios.get("http://localhost:5000/sensor-test/sensors")
        .then((response) => {
          const newLogs = [];

          const now = new Date();
          const timestamp = now.toLocaleString();

          for (const deviceId in response.data) {
            const sensors = response.data[deviceId];

            for (const sensorType in sensors) {
              const sensor = sensors[sensorType];
              const value = typeof sensor === "object" ? sensor.value : sensor;
              newLogs.push(`${timestamp} - [${deviceId}] ${sensorType}: ${value}`);
            }
          }

          setLogs(prevLogs => [...prevLogs.slice(-5), ...newLogs]); 
        })
        .catch((error) => {
          console.error("Error fetching sensor data:", error);
        });
    };

    fetchSensorData();
    const interval = setInterval(fetchSensorData, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <h1>Console Log</h1>
      <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
        {logs.map((log, idx) => (
          <div key={idx}>{log}</div>
        ))}
      </div>
    </>
  );
};

export default Console;
