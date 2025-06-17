import Credential from "../models/credential.model.js";
import { encrypt, decrypt } from "../utils/cryptoHelper.js";

export const createCredential = async (req, res) => {
  try {
    const { offerId, orderId, label, value } = req.body;

    if (!offerId || !label || !value) {
      return res
        .status(400)
        .json({ error: "offerId, label and value are required." });
    }
    
    const encryptedValue = encrypt(value);

    const credential = await Credential.create({
      offerId,
      orderId,
      label,
      value: encryptedValue,
    });

    res
      .status(201)
      .json({ message: "Credential created successfully.", credential });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create credential.", details: error.message });
  }
};

export const deleteCredential = async (req, res) => {
  try {
    const { id } = req.params;

    const credential = await Credential.findById(id);
    if (!credential) {
      return res.status(404).json({ error: "Credential not found." });
    }

    await Credential.findByIdAndDelete(id);

    res.json({ message: "Credential deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete credential.", details: error.message });
  }
};

export const getCredential = async (req, res) => {
  try {
    const credential = await Credential.findById(req.params.id);
    if (!credential) {
      return res.status(404).json({ error: "Credential not found." });
    }
    const decryptedValue = decrypt(credential.value);
    res.json({
      decryptedData: decryptedValue,
    });
  } catch (error) {
    res.status(500).json({ error: "error", details: error.message });
  }
};
