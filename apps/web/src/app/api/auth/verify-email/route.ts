import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, code: verificationCode } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (verificationCode) {
      const tokenHash = crypto.createHash("sha256").update(verificationCode).digest("hex");

      const verification = await prisma.verificationToken.findFirst({
        where: {
          identifier: email.toLowerCase().trim(),
          token: tokenHash,
          expires: { gt: new Date() },
        },
      });

      if (!verification) {
        return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
      }

      await prisma.user.update({
        where: { email: email.toLowerCase().trim() },
        data: { emailVerified: new Date() },
      });

      await prisma.verificationToken.delete({ where: { id: verification.id } });

      return NextResponse.json({ message: "Email verified successfully" });
    }

    const newCode = crypto.randomInt(100000, 999999).toString();
    const newTokenHash = crypto.createHash("sha256").update(newCode).digest("hex");

    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase().trim(),
        token: newTokenHash,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    console.log(`[DEV] Verification code for ${email}: ${newCode}`);

    return NextResponse.json({ message: "Verification email sent" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
