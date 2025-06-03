import express from "express";
import { incrementTestSensor, decrementTestSensor, getTestSensorValue } from "../services/mqttService.js";
import { sensorDataStore } from "../services/deviceService.js";

const router = express.Router();


router.get("/", (req, res) => {
    res.json({ value: getTestSensorValue() });
});

router.post("/up", async (req, res) => {
    await incrementTestSensor();
    res.json({ value: getTestSensorValue() });
});

router.post("/down", async (req, res) => {
    await decrementTestSensor();
    res.json({ value: getTestSensorValue() });
});

router.get("/sensors", (req, res) => {
    res.json(sensorDataStore);
});



export default router;
