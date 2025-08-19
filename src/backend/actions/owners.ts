"use server"
import { dbConnect } from "../lib/db";
import Owner from "../models/Owner";

export async function getOwners() {
  await dbConnect();
  const owners = await Owner.find({}, { _id: 1, name: 1, email: 1, address: 1, status: 1, updatedAt: 1 })
  .lean()
  .sort({ createdAt: -1 });

  return owners;
}

export async function addDeployerAsOwner() {
  try {
    const address = process.env.DEPLOYER_ADDRESS!;
    const name = process.env.DEPLOYER_NAME || "CEO";
    const email = process.env.DEPLOYER_EMAIL || "";

    if (!address) {
      throw new Error("DEPLOYER_ADDRESS is not defined");
    }

    await dbConnect();

    const existing:any = await Owner.findOne({ address: address.toLowerCase() }).lean();
    
    if (existing) {
      return { message: "Owner already exists.", status: false };
    }

    await Owner.create({
      name,
      email,
      address: address.toLowerCase(),
      status: "approved",
    });

    return {
      message: "Deployer added successfully!",
      status: true
    };
  } catch (err: any) {
    console.error("Error adding deployer as owner:", err);
    return { message: "Failed to add deployer as owner", status: false };
  }
}
