import { Schema, model, models, Document } from "mongoose";

export interface ITransaction extends Document {
  txIndex: number;
  title: string;
  txHash: string;
  submittedBy: string;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    txIndex: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    txHash: {
      type: String,
      required: true
    },
    submittedBy: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Transaction =
  models.Transaction || model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
