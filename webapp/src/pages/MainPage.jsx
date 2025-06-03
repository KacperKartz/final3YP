
import { mqttStatus } from '../services/mqttService';
import DeviceList from '../components/deviceList';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import RuleForm from '../components/RuleForm';
import Dictaphone from '../components/Dictaphone';
import Console from '../components/Console';
import useDevices from '../hooks/useDevices';
const MainPage = () => {

//                    iot/device/data/9454C562BD9C/tempSensor
  const [value, setValue] = useState(0);
  const { devices, statuses } = useDevices(); 
 const [selectedDeviceId, setSelectedDeviceId] = useState("");


   const onlineDevices = devices.filter(device => statuses[device.device_id] === "online");


useEffect(() => {
  if (onlineDevices.length > 0 && selectedDeviceId === "") {
    setSelectedDeviceId(onlineDevices[0].device_id);
  }
}, [onlineDevices, selectedDeviceId]);

  const fetchTempSensor = async () => {
    try {
      const response = await axios.get("http://localhost:5000/sensor-test");
      setValue(response.data.value);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTempSensor();
  }, []);

  const testUp = async () => {
    const res = await axios.post("http://localhost:5000/sensor-test/up");
    setValue(res.data.value);
  };

  const testDown = async () => {
    const res = await axios.post("http://localhost:5000/sensor-test/down");
    setValue(res.data.value);
  };

  const navigator = useNavigate();
  return (
    <div className='dashboard'>
        <button className="btn" onClick={() => navigator("/nodes")}>Nodes</button>
      <h1>ESP32 IoT Dashboard</h1>
      <Dictaphone/>

      <h2>MQTT Status: {mqttStatus}</h2>
      <Console></Console>
      <div>

      <button onClick={testUp}>TestSensor up</button>
      <button onClick={testDown}>TestSensor down</button>
      </div>
      <p>TestSensor Value: {value}</p>
      <DeviceList></DeviceList>


 {onlineDevices.length > 0 && (
        <>
          <label htmlFor="deviceSelect">Select Device for Rule:</label>
          <select
            id="deviceSelect"
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
          >
            {onlineDevices.map(device => (
              <option key={device.device_id} value={device.device_id}>
                {device.name || device.device_id}
              </option>
            ))}
          </select>
          <RuleForm deviceId={selectedDeviceId} />
        </>
      )}

      {onlineDevices.length === 0 && (
        <p className="status">No online devices available to configure rules.</p>
      )}
    </div>
  )
}

export default MainPage

