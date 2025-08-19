import { dbConnect } from "../lib/db";
import Owner from "../models/Owner";

export async function getOwners() {
  await dbConnect();
  const owners = await Owner.find({}, { _id: 1, name: 1, email: 1, address: 1, status: 1, updatedAt: 1 })
  .lean()
  .sort({ createdAt: -1 });

  return owners;
}


