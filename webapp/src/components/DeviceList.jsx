import useDevices from "../hooks/useDevices";
import ledControl from "../services/ledControl";
import DeviceItem from "./DeviceItem";

const DeviceList = () => {
    const { devices, statuses, renameDevice } = useDevices();
    const { turnOnLED, turnOffLED, blinkLED, tripleBlink, rebootEsp } = ledControl();

    const onlineDevices = devices.filter(device => statuses[device.device_id] === "online");
    const offlineDevices = devices.filter(device => statuses[device.device_id] === "offline");

    return (
        <div>
            <div className="section">
                <h2>Connected Devices:</h2>
                {onlineDevices.length > 0 ? (
                    <ul>
                        {onlineDevices.map(device => (
                            <DeviceItem
                                key={device.device_id}
                                device={device}
                                status="online"
                                blinkLED={blinkLED}
                                tripleBlink={tripleBlink}
                                turnOnLED={turnOnLED}
                                turnOffLED={turnOffLED}
                                rebootEsp={rebootEsp}
                                renameDevice={renameDevice}
                            />
                        ))}
                    </ul>
                ) : (
                    <p className="status">No devices currently online.</p>
                )}
            </div>

            <div className="section">
                <h2>Offline Devices:</h2>
                {offlineDevices.length > 0 ? (
                    <ul>
                        {offlineDevices.map(device => (
                            <DeviceItem
                                key={device.device_id}
                                device={device}
                                status="offline"
                                turnOnLED={turnOnLED}
                                renameDevice={renameDevice}
                            />
                        ))}
                    </ul>
                ) : (
                    <p className="status">No devices currently offline.</p>
                )}
            </div>
        </div>
    );
};

export default DeviceList;
