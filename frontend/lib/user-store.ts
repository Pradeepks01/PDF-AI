import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

// Ensure data directory and users.json exist
function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), "utf8");
    }
  } catch (err) {
    console.error("Error ensuring users.json file:", err);
  }
}

// Read all users from disk
export function getAllUsers(): StoredUser[] {
  ensureDataFile();
  try {
    const data = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    return [];
  }
}

// Save users array to disk
function saveUsers(users: StoredUser[]) {
  ensureDataFile();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

// Hash password with salt using PBKDF2 (SHA-512)
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const userSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, userSalt, 10000, 64, "sha512").toString("hex");
  return { hash, salt: userSalt };
}

// Verify password
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const testHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(testHash));
}

// Register a new user
export function registerUser(name: string, email: string, password: string): StoredUser {
  const cleanEmail = email.trim().toLowerCase();
  const users = getAllUsers();

  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error("An account with this email already exists. Please sign in instead.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  const { hash, salt } = hashPassword(password);
  const newUser: StoredUser = {
    id: `usr_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
    name: name.trim() || cleanEmail.split("@")[0] || "User",
    email: cleanEmail,
    passwordHash: hash,
    salt: salt,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
}

// Authenticate user with email and password
export function authenticateUser(email: string, password: string, isRegistering: boolean = false, name?: string): StoredUser {
  const cleanEmail = email.trim().toLowerCase();
  const users = getAllUsers();
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (isRegistering) {
    if (user) {
      throw new Error("An account with this email already exists. Please sign in instead.");
    }
    return registerUser(name || cleanEmail.split("@")[0], cleanEmail, password);
  }

  if (!user) {
    throw new Error("No account found with this email. Please create an account first.");
  }

  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    throw new Error("Incorrect password. Please try again.");
  }

  return user;
}
