import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { marked } from "marked";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const ownerId = formData.get("ownerId") as string | null;

    if (!file || !ownerId) {
      return NextResponse.json(
        { error: "Both 'file' and 'ownerId' are required" },
        { status: 400 }
      );
    }

    const filename = file.name || "Imported Document";
    const extension = filename.split(".").pop()?.toLowerCase();

    if (extension !== "md" && extension !== "txt") {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a .md or .txt file." },
        { status: 400 }
      );
    }

    const rawText = await file.text();
    let htmlContent = "";
    let extractedTitle = filename.replace(/\.[^/.]+$/, "");

    if (extension === "md") {
      // Parse markdown to HTML
      const firstHeadingMatch = rawText.match(/^#\s+(.+)$/m);
      if (firstHeadingMatch && firstHeadingMatch[1]) {
        extractedTitle = firstHeadingMatch[1].trim();
      }
      htmlContent = await marked.parse(rawText);
    } else {
      // Plain text: wrap paragraphs in <p> tags
      const paragraphs = rawText
        .split(/\r?\n\r?\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      htmlContent = paragraphs.length > 0
        ? paragraphs.map((p) => `<p>${p.replace(/\r?\n/g, "<br/>")}</p>`).join("")
        : `<p>${rawText}</p>`;
    }

    const doc = await prisma.document.create({
      data: {
        title: extractedTitle || "Imported Document",
        content: htmlContent || "<p></p>",
        ownerId,
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error("Failed to import file:", error);
    return NextResponse.json(
      { error: "Failed to process and import file" },
      { status: 500 }
    );
  }
}
