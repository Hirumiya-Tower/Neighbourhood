import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { auth } from "@/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ name: string }> }
) {
    const { name } = await params;
    const session = await auth();
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    try {
        const fileName = name.replace(/-/g, "/") + ".pdf";

        if (!fileName) {
            return new NextResponse("File name is required", { status: 400 });
        }

        const filePath = path.join(process.cwd(), "pdfs", fileName);

        console.log("Attempting to access file at:", filePath);

        try {
            await fs.access(filePath);
        } catch (error) {
            console.error("File access error:", error);
            return new NextResponse("File not found", { status: 404 });
        }

        const fileBuffer = await fs.readFile(filePath);

        const headers = {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${path.basename(fileName)}"`,
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            "Expires": "0",
            "Pragma": "no-cache",
        };

        return new NextResponse(fileBuffer, { headers });
    } catch (error) {
        console.error("Error fetching file:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}