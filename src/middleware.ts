import { NextResponse } from "next/server";
import { auth } from "./auth";

export default async function middleware() {
	const session = await auth();

	if (!session) {
		return NextResponse.redirect(`https://${process.env.VERCEL_URL}`);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/Semester/:path*",
		"/news/:path*",
		"/links/:path*",
		"/comments/:path*",
		"/secret/:path*",
	],
};
