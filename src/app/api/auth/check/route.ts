import { NextResponse } from "next/server";
import { isAuthorizedEmail } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const authorized = await isAuthorizedEmail(email);
    return NextResponse.json({ authorized });
  } catch (error) {
    console.error("API error checking auth:", error);
    // Even on error, we return 200 with authorized: false so the client handles it gracefully
    return NextResponse.json({ authorized: false, error: "Internal Server Error" });
  }
}
