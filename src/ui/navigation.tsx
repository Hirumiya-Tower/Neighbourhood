"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Sidebar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { data: session } = useSession();

	const handleLogout = async () => {
		await signOut({ redirectTo: "/" });
	};

	return (
		<>
			{/* Mobile hamburger */}
			<div className="flex md:hidden items-center justify-between p-4 bg-[#1b1b1b] border-b border-gray-700">
				<h2 className="text-xl font-bold font-serif">Neighbourhood</h2>
				<button
					onClick={() => setIsMenuOpen(!isMenuOpen)}
					className="text-white"
				>
					☰
				</button>
			</div>

			{/* Sidebar */}
			<nav
				className={`${
					isMenuOpen ? "block" : "hidden"
				} md:flex w-full md:w-60 bg-[#1b1b1b] border-r border-gray-700 p-4 flex-col`}
			>
				<h2 className="text-2xl font-bold mb-6 tracking-wider border-b border-gray-700 pb-2 font-serif hidden md:block">
					Neighbourhood
				</h2>

				{session && (
					<ul className="flex flex-col gap-4 mt-4 font-serif">
						<li>
							<Link
								href="/Semester"
								className="block px-3 py-2 rounded-lg hover:bg-emerald-900 hover:text-emerald-200 transition-all text-base tracking-wide"
							>
								NOTE
							</Link>
						</li>
						<li>
							<Link
								href="/news"
								className="block px-3 py-2 rounded-lg hover:bg-emerald-900 hover:text-emerald-200 transition-all text-base tracking-wide"
							>
								NEWS
							</Link>
						</li>
						<li>
							<Link
								href="/links"
								className="block px-3 py-2 rounded-lg hover:bg-emerald-900 hover:text-emerald-200 transition-all text-base tracking-wide"
							>
								LINK
							</Link>
						</li>
						{session.user.role === "admin" && (
							<li>
								<Link
									href="/secret"
									className="block px-3 py-2 rounded-lg hover:bg-emerald-900 hover:text-emerald-200 transition-all text-base tracking-wide"
								>
									ADMIN
								</Link>
							</li>
						)}
					</ul>
				)}

				<div className="mt-auto text-sm text-center pt-6">
					<p className="text-gray-300 font-serif">
						user: {session?.user?.name || "Not logged in"}
					</p>
					{session && (
						<button
							onClick={handleLogout}
							className="mt-2 w-full bg-red-700 hover:bg-red-600 text-white py-2 rounded-md transition-all font-serif"
						>
							Logout
						</button>
					)}
					<footer className="text-xs text-gray-500 mt-4">
						Coded by <strong>昼水夜塔</strong>
					</footer>
				</div>
			</nav>
		</>
	);
}
