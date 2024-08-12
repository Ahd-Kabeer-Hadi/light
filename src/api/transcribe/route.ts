import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { transcribeVideo } from '@/lib/transcriber';
import { z } from 'zod';
import { CreateTranscriptionSchema } from '@/app/schemas/transcription';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { videoUrl } = CreateTranscriptionSchema.parse(body);

    const result = await transcribeVideo(videoUrl);
    
    const transcription = await prisma.transcription.create({
      data: {
        videoUrl,
        transcript: result.transcript,
        userId: session.user.id,
      },
    });

    return NextResponse.json(transcription);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error : error.errors }, { status: 400 });
    }
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'An error occurred during processing' }, { status: 500 });
  }
}