import { NextResponse } from "next/server";
import { resetUserPassword } from "@/lib/user-store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "Email and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const updatedUser = resetUserPassword(email, newPassword);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully! You can now sign in with your new password.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to reset password." },
      { status: 400 }
    );
  }
}
