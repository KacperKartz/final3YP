import { useState } from "react";

const DeviceItem = ({ device, status, turnOnLED, turnOffLED, renameDevice, blinkLED, tripleBlink,  rebootEsp   }) => {
    const [editing, setEditing] = useState(false);
    const [newName, setNewName] = useState(device.custom_name);

    const handleRename = () => {
        renameDevice(device.device_id, newName);
        setEditing(false);
    };

    return (
        <li className="device">
            <div className="device-name">{device.custom_name}</div>
            <div className="device-mac">Device MAC Address: {device.device_id}</div>

            {editing ? (
                <div className="edit-controls">
                    <input
                        className="input"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <button className="btn" onClick={handleRename}>Save</button>
                    <button className="btn" onClick={() => setEditing(false)}>Cancel</button>
                </div>
            ) : (
                <>
                    <div className={`status-indicator ${status}`}>
                        <span className="dot" />
                        <span className="status-text">{status === "online" ? "Online" : "Offline"}</span>
                    </div>

                    {status === "online" && (
                        <div className="controls">
                            <button className="btn" onClick={() => blinkLED(device.device_id)}>Blink LED</button>
                            <button className="btn" onClick={() => tripleBlink(device.device_id)}>Triple Blink</button>
                            <button className="btn" onClick={() => turnOnLED(device.device_id)}>Turn On LED</button>
                            <button className="btn" onClick={() => turnOffLED(device.device_id)}>Turn Off LED</button>
                            <button className="btn" onClick={() => rebootEsp(device.device_id)}>Reboot Device</button>
                        </div>
                    )}

                    <button
                        className="btn"
                        onClick={() => {
                            setEditing(true);
                            setNewName(device.custom_name);
                        }}
                    >
                        Rename
                    </button>
                </>
            )}
        </li>
    );
};

export default DeviceItem;
