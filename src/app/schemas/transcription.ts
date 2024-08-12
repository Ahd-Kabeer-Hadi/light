import { z } from 'zod'

export const TranscriptionSchema = z.object({
  id: z.string(),
  videoUrl: z.string().url(),
  transcript: z.string(),
  createdAt: z.string().datetime(),
})

export const CreateTranscriptionSchema = z.object({
  videoUrl: z.string().url(),
})

export type Transcription = z.infer<typeof TranscriptionSchema>
export type CreateTranscriptionInput = z.infer<typeof CreateTranscriptionSchema>