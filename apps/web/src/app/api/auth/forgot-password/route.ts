import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return NextResponse.json({ message: "If the account exists, a reset code has been sent" });
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const tokenHash = crypto.createHash("sha256").update(code).digest("hex");

    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase().trim(),
        token: tokenHash,
        expires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    console.log(`[DEV] Password reset code for ${email}: ${code}`);

    return NextResponse.json({ message: "If the account exists, a reset code has been sent" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
