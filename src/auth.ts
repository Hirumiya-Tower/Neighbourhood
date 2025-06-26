import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import bcrypt from "bcryptjs";

// 型ガード関数でcredentialsの中身を安全にチェック
function isValidCredentials(
	credentials: unknown
): credentials is { username: string; password: string } {
	return (
		typeof credentials === "object" &&
		credentials !== null &&
		"username" in credentials &&
		"password" in credentials &&
		typeof (credentials as any).username === "string" &&
		typeof (credentials as any).password === "string"
	);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
	secret: process.env.AUTH_SECRET,
	providers: [
		Credentials({
			credentials: {
				username: { label: "Username", type: "text" },
				password: { label: "Password", type: "password" },
			},
			authorize: async (credentials, req) => {
				console.log("--- ログイン処理開始 ---");

				if (!isValidCredentials(credentials)) {
					console.log("エラー: IDまたはパスワードの形式が正しくありません。");
					return null;
				}

				const { username, password } = credentials;
				console.log(`入力されたID: ${username}`);

				try {
					const q = query(
						collection(db, "users"),
						where("username", "==", username)
					);

					const snapshot = await getDocs(q);

					if (snapshot.empty) {
						console.log("探偵さんの報告: ユーザーが見つかりませんでした。");
						return null;
					}

					console.log("探偵さんの報告: ユーザーを発見！");

					const user = snapshot.docs[0].data();

					if (!user.password) {
						console.log("エラー: ユーザーにパスワードが設定されていません。");
						return null;
					}

					const passwordMatch = await bcrypt.compare(password, user.password);
					console.log(`探偵さんの報告: パスワードは一致した？ → ${passwordMatch}`);

					if (passwordMatch) {
						console.log("--- ログイン成功！ ---");
						return {
							id: snapshot.docs[0].id,
							name: user.username,
							email: user.email || null,
							role: user.role || "user",
						};
					}

					console.log("エラー: パスワードが一致しませんでした。");
					return null;
				} catch (error) {
					console.error("探偵さんの緊急報告: 認証中に重大なエラーが発生！", error);
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
				// @ts-expect-error
				session.user.role = token.role;
			}
			return session;
		},
	},
});