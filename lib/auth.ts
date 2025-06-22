import bcrypt from "bcryptjs"
import { userOperations, sessionOperations, type User } from "./redis"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(
  email: string,
  password: string,
  name: string,
  role: "admin" | "user" = "user",
): Promise<User> {
  const existingUser = await userOperations.findByEmail(email)
  if (existingUser) {
    throw new Error("User already exists")
  }

  const hashedPassword = await hashPassword(password)
  return userOperations.create({
    email,
    password: hashedPassword,
    name,
    role,
  })
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await userOperations.findByEmail(email)
  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return null
  }

  return user
}

export async function getUserFromSession(sessionId: string): Promise<User | null> {
  const userId = await sessionOperations.get(sessionId)
  if (!userId) {
    return null
  }

  return userOperations.findById(userId)
}
