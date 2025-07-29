import mongoose, { Connection } from "mongoose";
import {
  DB_NAME,
  IS_STAGING_ENVIROMENT,
  LOCALDB_URI,
  MONGODB_URI,
} from "@/config";


declare global {
  var mongooseConnection: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
}

let cached = global.mongooseConnection ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseConnection) {
  global.mongooseConnection = cached;
}

export async function connectToDatabase(): Promise<Connection> {
  if (cached.conn) return cached.conn;

  const uri = IS_STAGING_ENVIROMENT ? LOCALDB_URI : MONGODB_URI;

  if (!uri) {
    throw new Error(
      `Missing MongoDB URI. Expected ${IS_STAGING_ENVIROMENT ? "LOCALDB_URI" : "MONGODB_URI"} in environment variables.`
    );
  }

  if (!DB_NAME) {
    throw new Error("DB_NAME environment variable is required");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: DB_NAME,
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    }).then((mongoose) => mongoose.connection);
  }

  cached.conn = await cached.promise;

  cached.conn.on("connected", () => {
    console.log("Mongoose connected to DB");
  });

  cached.conn.on("error", (err) => {
    console.error("Mongoose connection error:", err);
  });

  cached.conn.on("disconnected", () => {
    console.log("Mongoose disconnected from DB");
  });

  return cached.conn;
}
