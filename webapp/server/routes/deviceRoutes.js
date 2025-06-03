import express from "express";
import { getAllDevicesHandler, renameDeviceHandler } from "../controllers/deviceController.js"; 


const router = express.Router();

router.get("/devices", getAllDevicesHandler); 
router.put("/device/:device_id/rename", renameDeviceHandler);


export default router;
