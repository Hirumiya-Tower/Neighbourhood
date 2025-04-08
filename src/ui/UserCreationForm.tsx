"use client";

import { Switch } from "@mantine/core";
import { createUser, type NewUser } from "@/lib/user-management";
import { useState } from "react";
import { toast } from "sonner";

export default function UserCreationForm() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isAdmin, setIsAdmin] = useState(false);

	const handleCreateUser = async () => {
		if (!username.trim() || !password.trim()) {
			toast.error("ユーザー名とパスワードを入力してください。");
			return;
		}
		try {
			const role = isAdmin ? "admin" : "user";
			const user = { username, password, email: "", role } as NewUser;
			await createUser(user);
			toast.success("ユーザーを作成し、パスワードをコピーしました。");
			setUsername("");
			setPassword("");
			setIsAdmin(false);
			navigator.clipboard.writeText(user.password);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "ユーザーを作成できませんでした。",
			);
		}
	};

	return (
		<div className="h-screen overflow-hidden text-gray-100 flex items-center justify-center px-4 font-sans">
			<div className="bg-[#1a1a1a] border border-gray-600 rounded-2xl p-6 shadow-lg w-full max-w-md font-serif">
				<h1 className="text-2xl md:text-3xl mb-6 text-center tracking-wider border-b pb-2 border-gray-600">
					Create User
				</h1>
				<input
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="user name"
					className="w-full bg-transparent border border-gray-600 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm md:text-base"
				/>
				<input
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="password"
					className="w-full bg-transparent border border-gray-600 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-sm md:text-base"
				/>
				<div className="flex flex-row justify-center items-center">
					<label className="text-sm mr-2">Admin</label>
					<Switch
						color={"teal"}
						checked={isAdmin}
						onChange={() => setIsAdmin(!isAdmin)}
					/>
				</div>
				<button
					onClick={handleCreateUser}
					className="w-full bg-emerald-800 hover:bg-emerald-700 text-white py-2 rounded-md transition-all duration-200 tracking-wide text-sm md:text-base mt-3"
				>
					Create
				</button>
			</div>
		</div>
	);
}
