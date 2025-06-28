import Credential from "../models/credential.model.js";
import { encrypt, decrypt } from "../utils/cryptoHelper.js";

export const createCredential = async (req, res) => {
  try {
    const { offerId, orderId, label, value } = req.body;

    if (!offerId || !label || !value) {
      return res
        .status(400)
        .json({
          success: false,
          error: "offerId, label and value are required.",
        });
    }

    const encryptedValue = encrypt(value);

    const credential = await Credential.create({
      offerId,
      orderId,
      label,
      value: encryptedValue,
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Credential created successfully.",
        data: credential,
      });
  } catch (error) {
    next(error);
  }
};

export const deleteCredential = async (req, res) => {
  try {
    const { id } = req.params;

    const credential = await Credential.findById(id);
    if (!credential) {
      return res
        .status(404)
        .json({ success: false, error: "Credential not found." });
    }

    await Credential.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Credential deleted" });
  } catch (error) {
    next(error);
  }
};

export const getCredential = async (req, res) => {
  try {
    const credential = await Credential.findById(req.params.id);
    if (!credential) {
      return res.status(404).json({ error: "Credential not found." });
    }
    const decryptedValue = decrypt(credential.value);
    res.status(200).json({
      success: true,
      data: decryptedValue,
    });
  } catch (err) {
    next(err);
  }
};
