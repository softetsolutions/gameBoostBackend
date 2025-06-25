import express from "express";
import {
  createCredential,
  deleteCredential,
  getCredential,
} from "../controllers/credential.controller.js";

const router = express.Router();

router.post("/create-credential", createCredential);
router.post("/delete-credential/:id", deleteCredential);
router.get("/get-credential/:id", getCredential);

export default router;
