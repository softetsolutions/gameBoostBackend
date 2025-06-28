import express from "express";
import {
  createCredential,
  deleteCredential,
  getCredential,
} from "../controllers/credential.controller.js";
import auth from "../middleware/auth.middleware.js";
import checkRole from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/create-credential", auth, checkRole("seller"), createCredential);
router.delete(
  "/delete-credential/:id",
  auth,
  checkRole("seller"),
  deleteCredential
);
router.get("/get-credential/:id", auth, checkRole("seller"), getCredential);

export default router;
