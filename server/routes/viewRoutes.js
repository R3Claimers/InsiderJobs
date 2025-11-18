import express from "express";
import Job from "../models/job.js";

const router = express.Router();

router.get("/ssr/apply-job/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "companyId",
      "name image email"
    );

    if (!job) {
      return res.status(404).send("Job not found");
    }

    const relatedJobs = await Job.find({
      companyId: job.companyId._id,
      _id: { $ne: job._id },
      visible: true,
    })
      .populate("companyId", "name image")
      .limit(4);

    res.render("apply-job", {
      title: job.title,
      job,
      relatedJobs,
      backendUrl: process.env.VITE_BACKEND_URL || "http://localhost:5000",
    });
  } catch (error) {
    console.error("Error fetching job details:", error);
    res.status(404).send("Job not found");
  }
});

export default router;
