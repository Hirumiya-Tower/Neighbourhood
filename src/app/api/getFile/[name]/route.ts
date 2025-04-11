import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { auth } from "@/auth";
import { join } from 'path';

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
        // URLからファイルパスへの変換をより明示的に
        const fileName = name.replace(/-/g, "/") + ".pdf";
        console.log("Requested file:", fileName);
        
        // パスの安全性を確保
        const normalizedFileName = fileName.replace(/\.\.\//g, ''); // ディレクトリトラバーサル防止
        
        // 環境に応じたパス解決
        let filePath;
        if (process.env.VERCEL) {
            // Vercel環境
            filePath = join(process.cwd(), 'pdfs', normalizedFileName);
        } else {
            // ローカル環境
            filePath = join(process.cwd(), 'pdfs', normalizedFileName);
        }
        
        console.log("Attempting to access file at:", filePath);
        
        // ファイルの存在確認
        try {
            await fs.access(filePath);
        } catch (error) {
            console.error("File access error:", error);
            return new NextResponse("File not found", { status: 404 });
        }
        
        const fileBuffer = await fs.readFile(filePath);
        
        // Response headersを明示的に設定
        const headers = {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${encodeURIComponent(path.basename(normalizedFileName))}"`,
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