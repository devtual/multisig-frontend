import { Schema, Document, models, model } from "mongoose";

export interface IOwner extends Document {
  name: string;
  email: string;
  address: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const OwnerSchema = new Schema<IOwner>(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    address: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true 
    },
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected"], 
      default: "pending" 
    }
  },
  {
    timestamps: true
  }
);

export default models.Owner || model<IOwner>("Owner", OwnerSchema);
