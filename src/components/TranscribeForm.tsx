'use client'

import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { CreateTranscriptionSchema } from '@/schemas/transcription'
import { createTranscription } from '@/redux/slices/transcriptionSlice'
import { AppDispatch } from '@/redux/store'
import { Input } from './ui/input'

export default function TranscribeForm() {
  const { data: session } = useSession()
  const dispatch = useDispatch<AppDispatch>()
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // if (!session) return
    setLoading(true)
    try {
      const validatedInput = CreateTranscriptionSchema.parse({ videoUrl })
      dispatch(createTranscription(validatedInput.videoUrl))
      setVideoUrl('')
    } catch (error) {
      console.error('Transcription failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <Input
        type="url"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        placeholder="Enter YouTube Video URL"
        required
        className="mb-4"
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Transcribing...' : 'Transcribe Video'}
      </Button>
    </form>
  )
}