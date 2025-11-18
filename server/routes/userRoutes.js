import express from "express";
import {
  applyForJob,
  getUserData,
  getUserJobApplications,
  updateUserResume,
} from "../controllers/userController.js";
import upload from "../config/multer.js";
import { searchCities } from "../utils/locationService.js";

const router = express.Router();

// Get user Data
router.get("/user", getUserData);

// Apply for a job
router.post("/apply", applyForJob);

// Get applied jobs data
router.get("/applications", getUserJobApplications);

// Update user profile (resume) - PUT for full resource update
router.put("/resume", upload.single("resume"), updateUserResume);

// Get location suggestions
router.get("/locations", async (req, res) => {
  try {
    const { query } = req.query;
    const cities = await searchCities(query);
    res.json({ success: true, cities });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching locations" });
  }
});

export default router;
