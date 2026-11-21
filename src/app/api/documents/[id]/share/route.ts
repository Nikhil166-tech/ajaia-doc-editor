import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { targetEmail, permission = "edit", userId } = body;

    if (!userId || !targetEmail) {
      return NextResponse.json(
        { error: "userId and targetEmail are required" },
        { status: 400 }
      );
    }

    const doc = await prisma.document.findUnique({
      where: { id },
    });

    if (!doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (doc.ownerId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: Only the document owner can share this document" },
        { status: 403 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { email: targetEmail.trim().toLowerCase() },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: `User with email "${targetEmail}" does not exist.` },
        { status: 404 }
      );
    }

    if (targetUser.id === doc.ownerId) {
      return NextResponse.json(
        { error: "You cannot share a document with yourself (you are already the owner)." },
        { status: 400 }
      );
    }

    const share = await prisma.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId: id,
          userId: targetUser.id,
        },
      },
      update: {
        permission: permission === "view" ? "view" : "edit",
      },
      create: {
        documentId: id,
        userId: targetUser.id,
        permission: permission === "view" ? "view" : "edit",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(share, { status: 200 });
  } catch (error) {
    console.error("Failed to share document:", error);
    return NextResponse.json(
      { error: "Failed to share document" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { targetUserId, userId } = body;

    if (!userId || !targetUserId) {
      return NextResponse.json(
        { error: "userId and targetUserId are required" },
        { status: 400 }
      );
    }

    const doc = await prisma.document.findUnique({
      where: { id },
    });

    if (!doc || doc.ownerId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: Only the document owner can revoke access" },
        { status: 403 }
      );
    }

    await prisma.documentShare.deleteMany({
      where: {
        documentId: id,
        userId: targetUserId,
      },
    });

    return NextResponse.json({ success: true, message: "Share revoked" });
  } catch (error) {
    console.error("Failed to revoke share:", error);
    return NextResponse.json(
      { error: "Failed to revoke share" },
      { status: 500 }
    );
  }
}
