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
        const parts = name.split("-");
        if (parts.length < 3) {
            return new NextResponse("Invalid file name format", { status: 400 });
        }

        const [term, subject, lessonNum] = parts;
        const filePath = path.join(process.cwd(), "pdfs", term, subject, `${lessonNum}.pdf`);

        console.log("Accessing file at:", filePath);

        try {
            await fs.access(filePath);
        } catch (error) {
            console.error("File access error:", error);
            return new NextResponse("File not found", { status: 404 });
        }

        const fileBuffer = await fs.readFile(filePath);

        const headers = {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${term}-${subject}-${lessonNum}.pdf"`,
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        };
        

        return new NextResponse(fileBuffer, { headers });
    } catch (error) {
        console.error("Error fetching file:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
