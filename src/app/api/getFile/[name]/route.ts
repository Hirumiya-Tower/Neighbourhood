import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { auth } from "@/auth";
import { join } from 'path';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        // パラメータ取得を確実に
        const resolvedParams = await params;
        const { name } = resolvedParams;
        
        // ここでセッション確認
        const session = await auth();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        
        // リクエスト情報の詳細ログ
        console.log("Request URL:", request.url);
        console.log("Raw name parameter:", name);
        
        if (!name) {
            return new NextResponse("File name parameter is missing", { status: 400 });
        }
        
        // パス変換をより安全に
        const decodedName = decodeURIComponent(name);
        const fileName = decodedName.replace(/-/g, "/") + ".pdf";
        
        console.log("Converted file path:", fileName);
        
        // 意図しないパスのアクセスを防止
        if (fileName.includes('..') || !fileName.endsWith('.pdf')) {
            return new NextResponse("Invalid file path", { status: 400 });
        }
        
        // 完全なファイルパスを生成
        const filePath = path.join(process.cwd(), "pdfs", fileName);
        console.log("Full file path:", filePath);
        
        // ファイルの存在確認
        try {
            const stats = await fs.stat(filePath);
            console.log("File exists, size:", stats.size, "bytes");
            
            if (stats.size === 0) {
                return new NextResponse("Empty file", { status: 404 });
            }
        } catch (error) {
            console.error("File not found:", filePath);
            return new NextResponse(`File not found: ${fileName}`, { status: 404 });
        }
        
        // ファイル読み込み
        const fileBuffer = await fs.readFile(filePath);
        console.log("File read successfully, buffer length:", fileBuffer.length);
        
        // 強力なキャッシュバスティング
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        
        const headers = {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${encodeURIComponent(path.basename(fileName))}"`,
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, private",
            "Expires": "0",
            "Pragma": "no-cache",
            "X-Content-Hash": uniqueId,
            "X-Requested-File": fileName // デバッグ用に追加
        };
        
        return new NextResponse(fileBuffer, { headers });
    } catch (error) {
        console.error("Unexpected error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}