import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		Credentials({
			credentials: {
				username: { label: "Username", type: "text" },
				password: { label: "Password", type: "password" },
			},
			authorize: async (credentials) => {
				if (!credentials?.username || !credentials?.password) {
					return null;
				}

				try {
					const q = query(
						collection(db, "users"),
						where("username", "==", credentials.username),
					);

					const snapshot = await getDocs(q);

					if (snapshot.empty) {
						return null;
					}

					const user = snapshot.docs[0].data();
					const passwordMatch = await bcrypt.compare(
						//@ts-expect-error
						credentials.password,
						user.password,
					);

					if (passwordMatch) {
						return {
							id: snapshot.docs[0].id,
							name: user.username,
							email: user.email || null,
							role: user.role || "user",
						};
					}

					return null;
				} catch (error) {
					console.error("Auth error:", error);
					return null;
				}
			},
		}),
	],
	pages: {
		signIn: "/",
	},
	callbacks: {
		jwt: async ({ token, user }) => {
			if (user) {
				token.role = user.role;
			}
			return token;
		},
		session: async ({ session, token }) => {
			if (token) {
				//@ts-expect-error
				session.user.role = token.role;
			}
			return session;
		},
	},
});
