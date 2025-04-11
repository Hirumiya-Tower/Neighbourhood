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
        // URLパラメータとリクエスト情報をログ出力
        console.log("Original requested name:", name);
        
        // ファイル名をデコード（URLエンコードされている可能性がある）
        const decodedName = decodeURIComponent(name);
        console.log("Decoded name:", decodedName);
        
        // パス変換
        const fileName = decodedName.replace(/-/g, "/") + ".pdf";
        console.log("Converted file path:", fileName);
        
        // セキュリティ対策（ディレクトリトラバーサル防止）
        const safeFileName = fileName.replace(/\.\.\//g, '');
        
        // ファイルパス生成 - より明示的に
        const filePath = path.resolve(process.cwd(), "pdfs", safeFileName);
        console.log("Full resolved file path:", filePath);
        
        // ファイル存在確認
        try {
            await fs.access(filePath);
            console.log("File exists at path:", filePath);
        } catch (error) {
            console.error("File access error:", error);
            return new NextResponse("File not found", { status: 404 });
        }
        
        // ファイル読み込み
        const fileBuffer = await fs.readFile(filePath);
        
        // キャッシュ制御を強化したヘッダー
        const uniqueETag = `"${path.basename(filePath)}-${Date.now()}"`;
        
        const headers = {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${encodeURIComponent(path.basename(safeFileName))}"`,
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, private",
            "Expires": "0",
            "Pragma": "no-cache",
            "ETag": uniqueETag,
            "Vary": "Accept-Encoding, Origin",
            // 追加のキャッシュバスティング
            "X-Content-Hash": uniqueETag
        };
        
        return new NextResponse(fileBuffer, { headers });
    } catch (error) {
        console.error("Error fetching file:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}