import { storage } from "@/lib/storage";

export async function hashPassword(password: string): Promise<string> {
  if (typeof window === "undefined" || !crypto.subtle) {
    // Fallback if crypto subtle is not supported in the SSR execution environment
    return password; 
  }
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export class AuthService {
  static async verifyMockUserCredentials(email: string, passwordPlain: string): Promise<any> {
    const usersStr = localStorage.getItem("privora_mock_users") || "[]";
    const users = JSON.parse(usersStr);
    const matched = users.find(
      (u: { email: string }) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!matched) {
      throw new Error("Invalid email or password.");
    }

    // Hash the password input to compare against the stored hash
    const inputHash = await hashPassword(passwordPlain);
    if (matched.password !== inputHash) {
      throw new Error("Invalid email or password.");
    }

    return matched;
  }

  static async registerMockUser(email: string, passwordPlain: string, firstName: string, lastName: string): Promise<any> {
    const usersStr = localStorage.getItem("privora_mock_users") || "[]";
    const users = JSON.parse(usersStr);
    
    if (users.some((u: { email: string }) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("A user with this email already exists.");
    }

    const passwordHash = await hashPassword(passwordPlain);
    return {
      email,
      passwordHash,
      firstName,
      lastName
    };
  }

  static async completeMockUserRegistration(pendingUser: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }, userId: string): Promise<any> {
    const usersStr = localStorage.getItem("privora_mock_users") || "[]";
    const users = JSON.parse(usersStr);

    const newUserEntry = {
      id: userId,
      email: pendingUser.email,
      password: pendingUser.passwordHash, // already hashed
      firstName: pendingUser.firstName,
      lastName: pendingUser.lastName,
      created_at: new Date().toISOString(),
    };

    users.push(newUserEntry);
    localStorage.setItem("privora_mock_users", JSON.stringify(users));

    // Sync settings and user profiles
    await storage.syncUser(userId, pendingUser.email, pendingUser.firstName, pendingUser.lastName);
    
    return {
      id: userId,
      email: pendingUser.email,
      firstName: pendingUser.firstName,
      lastName: pendingUser.lastName,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${pendingUser.firstName}%20${pendingUser.lastName}`
    };
  }
}
