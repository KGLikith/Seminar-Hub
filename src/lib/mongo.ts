import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI!
let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!uri) {
  throw new Error("MONGODB_URI missing")
}

if (process.env.NODE_ENV === "development") {
  if (!(global as any)._mongoClient) {
    client = new MongoClient(uri)
    ;(global as any)._mongoClient = client.connect()
  }
  clientPromise = (global as any)._mongoClient
} else {
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export default clientPromise
