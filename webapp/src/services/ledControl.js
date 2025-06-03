
import { publishMessage, publishControl } from '../services/mqttService';


const ledControl = () => {


    const blinkLED = (deviceId) => {
        publishControl(deviceId, `blink`);
    };

    const tripleBlink = (deviceId) => {
        publishControl(deviceId, `tripleBlink`);
    };

    const rebootEsp = (deviceId) => {
        publishControl(deviceId, `reboot`);
    };

    
    const turnOnLED = (deviceId) => {
        publishControl(deviceId, `ledOn`);
    };


    const turnOffLED = (deviceId) => {
        publishControl(deviceId, `ledOff`);
    };
    
    
    
    
    return { turnOnLED, turnOffLED, blinkLED, tripleBlink, rebootEsp };
};

export default ledControl;
