import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { TranscriptionSchema } from "@/schemas/transcription";

export async function GET() {
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const transcriptions = await prisma.transcription.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const validatedTranscriptions = transcriptions.map((t) =>
      TranscriptionSchema.parse(t)
    );

    return NextResponse.json(validatedTranscriptions);
  } catch (error) {
    console.error("Failed to fetch transcriptions:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching transcriptions" },
      { status: 500 }
    );
  }
}
