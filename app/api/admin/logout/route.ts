import { clearAdminSession } from "@/lib/adminAuth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    await clearAdminSession();
    return NextResponse.redirect(new URL("/admin/login", request.url));
}
