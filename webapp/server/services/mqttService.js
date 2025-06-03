import mqtt from "mqtt";
import dotenv from "dotenv";
import * as deviceService from "./deviceService.js"; 

dotenv.config();

const MQTT_BROKER = process.env.MQTT_BROKER;
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;
const STATUS_TOPIC = process.env.MQTT_STATUS_TOPIC;
const CONTROL_TOPIC = process.env.MQTT_CONTROL_TOPIC;


let deviceStatuses = {}; 

let mqttStatus = "Unknown";



const mqttClient = mqtt.connect(MQTT_BROKER, {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    reconnectPeriod: 1000, 
});

mqttClient.on("connect", () => {
    console.log("Connected to MQTT Broker");
    mqttClient.subscribe(`${STATUS_TOPIC}/+`);
    mqttClient.subscribe(`iot/device/data/#`);

    mqttStatus = "Connected";
});

mqttClient.on("error", (err) => {
    console.error("MQTT Connection Error:", err);
});

// Handle incoming messages
mqttClient.on("message", async (topic, message) => {
    try {
        const payloadStr = message.toString();
        const isJson = payloadStr.trim().startsWith("{");

        if (!isJson) return;

        const payload = JSON.parse(payloadStr);
        const device_id = payload.id;

         if (topic.startsWith("iot/device/status/")) {
            const status = payload.status || "Unknown";

            if (device_id) {
                await deviceService.updateDeviceStatus(device_id, status);
                deviceStatuses[device_id] = status;
                console.log(`${new Date().toLocaleString()} - Updated status for device ${device_id}: ${status}`);
            }
        }
       else if (topic.startsWith("iot/device/data/")) {
            const sensorType = payload.sensor;
            const value = payload.value;

            if (device_id && sensorType && typeof value !== "undefined") {
                // console.log(`${new Date().toLocaleString()} - [${device_id}] ${sensorType}: ${value}`);
                await deviceService.saveSensorData(device_id, sensorType, value);
            }
        }
    } catch (error) {
        console.error("Error processing MQTT message:", error.message);
    }
});

// publish messages to MQTT
const publishToMQTT = (device_id, message) => {
    return new Promise((resolve, reject) => {
        const topic = `${CONTROL_TOPIC}/${device_id}`;
        mqttClient.publish(topic, message, (err) => {
            if (err) {
                reject("MQTT Publish Error");
            } else {
                resolve(`Published to ${topic}: ${message}`);
            }
        });
    });
};

/// similar to publishToMQTT except with different topic
const publishControl = (device_id, message) => {
    return new Promise((resolve, reject) => {
        const topic = `iot/device/command/${device_id}`;
        mqttClient.publish(topic, message, (err) => {
            if (err) {
                reject("MQTT Publish Error");
            } else {
                resolve(`Published to ${topic}: ${message}`);
            }
        });
    });
};


const publishCommand = (device_id, command) => {
    return new Promise((resolve, reject) => {
        const topic = `iot/device/command/${device_id}`;
        const payload = typeof command === 'string' ? command : JSON.stringify(command);

        mqttClient.publish(topic, payload, (err) => {
            if (err) {
                reject("MQTT Publish Error");
            } else {
                resolve(`Published to ${topic}: ${payload}`);
            }
        });
    });
};



const sendDeviceConfig = (device_id, rules) => {
    return new Promise((resolve, reject) => {
        const configTopic = `iot/device/config/${device_id}`;
        const payload = JSON.stringify({ rules }); 

        mqttClient.publish(configTopic, payload, (err) => {
            if (err) {
                reject("MQTT Config Publish Error");
            } else {
                console.log(`Sent config to ${device_id}: ${payload}`);
                resolve();
            }
        });
    });
};


const publishMessage = (topic, message) => {
    return new Promise((resolve, reject) => {
        mqttClient.publish(topic, message, (err) => {
            if (err) reject("MQTT Publish Error");
            else resolve(`Published '${message}' to '${topic}'`);
        });
    });
};

let testSensorValue = 20; 

const getTestSensorValue = () => testSensorValue;

const incrementTestSensor = () => {
    testSensorValue += 1;
    return publishMessage("/tempSensor", testSensorValue.toString());
};

const decrementTestSensor = () => {
    testSensorValue -= 1;
    return publishMessage("/tempSensor", testSensorValue.toString());
};




export { mqttClient, publishToMQTT, sendDeviceConfig, deviceStatuses, mqttStatus, getTestSensorValue, incrementTestSensor, decrementTestSensor, publishCommand, publishControl };














