import { Payment } from "../models/payment.js";

export const createPaymentRecord = async (data) => {
  return await Payment.create(data);
};

export const updatePaymentStatus = async (orderId, updateData) => {
  return await Payment.findOneAndUpdate(
    { orderId },
    updateData,
    { new: true }
  );
};
