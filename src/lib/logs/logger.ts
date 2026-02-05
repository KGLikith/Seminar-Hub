import clientPromise from "@/lib/mongo"

type Collection =
  | "logs_notifications"
  | "logs_user_actions"
  | "logs_system"

export async function logToMongo(
  collection: Collection,
  data: Record<string, any>
) {
  const client = await clientPromise
  const db = client.db()

  await db.collection(collection).insertOne({
    ...data,
    createdAt: new Date(),
  })
}
