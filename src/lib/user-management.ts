"use server";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import bcrypt from "bcrypt";

export type NewUser = {
	username: string;
	password: string;
	email?: string;
	role?: "user" | "admin";
};

export async function createUser(userData: NewUser) {
	try {
		// Check if username already exists
		const userQuery = query(
			collection(db, "users"),
			where("username", "==", userData.username),
		);

		const snapshot = await getDocs(userQuery);
		if (!snapshot.empty) {
			throw new Error("Username already exists");
		}

		// Hash password with salt
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

		// Create user with hashed password
		const userToSave = {
			username: userData.username,
			password: hashedPassword,
			email: userData.email || null,
			role: userData.role || "user",
			createdAt: new Date().toISOString(),
		};

		const docRef = await addDoc(collection(db, "users"), userToSave);
		return { id: docRef.id, ...userToSave };
	} catch (error) {
		console.error("Error creating user:", error);
		throw error;
	}
}
