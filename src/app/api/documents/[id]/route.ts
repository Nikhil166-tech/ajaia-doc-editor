import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const doc = await prisma.document.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        shares: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const isOwner = doc.ownerId === userId;
    const userShare = doc.shares.find((s) => s.userId === userId);

    if (!isOwner && !userShare) {
      return NextResponse.json(
        { error: "Access denied. You do not have permission to view this document." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ...doc,
      isOwner,
      permission: isOwner ? "owner" : userShare?.permission || "view",
    });
  } catch (error) {
    console.error("Failed to fetch document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { title, content, userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required to authorize edits" },
        { status: 400 }
      );
    }

    const doc = await prisma.document.findUnique({
      where: { id },
      include: {
        shares: true,
      },
    });

    if (!doc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const isOwner = doc.ownerId === userId;
    const userShare = doc.shares.find((s) => s.userId === userId);

    if (!isOwner && (!userShare || userShare.permission !== "edit")) {
      return NextResponse.json(
        { error: "Forbidden: You do not have edit permission for this document." },
        { status: 403 }
      );
    }

    const updateData: { title?: string; content?: string } = {};
    if (typeof title === "string") updateData.title = title.trim() || "Untitled Document";
    if (typeof content === "string") updateData.content = content;

    const updated = await prisma.document.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
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
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
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
        { error: "Forbidden: Only the document owner can delete this document." },
        { status: 403 }
      );
    }

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Document deleted" });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
