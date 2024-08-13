import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

// Define the Transcription interface
export interface Transcription {
  id: string
  videoUrl: string
  transcript: string
  createdAt: string
}

// Define the state interface
interface TranscriptionState {
  transcriptions: Transcription[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

// Initial state
const initialState: TranscriptionState = {
  transcriptions: [],
  status: 'idle',
  error: null,
}

// Async thunk for fetching transcriptions
export const fetchTranscriptions = createAsyncThunk(
  'transcription/fetchTranscriptions',
  async () => {
    const response = await axios.get('/api/transcriptions')
    return response.data
  }
)

// Async thunk for creating a new transcription
export const createTranscription = createAsyncThunk(
  'transcription/createTranscription',
  async (videoUrl: string) => {
    console.log(videoUrl)
    const response = await axios.post('/api/transcribe', { videoUrl })
    console.log(response.data);
    
    return response.data
  }
)

// Create the slice
const transcriptionSlice = createSlice({
  name: 'transcription',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTranscriptions.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchTranscriptions.fulfilled, (state, action: PayloadAction<Transcription[]>) => {
        state.status = 'succeeded'
        state.transcriptions = action.payload
      })
      .addCase(fetchTranscriptions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to fetch transcriptions'
      })
      .addCase(createTranscription.fulfilled, (state, action: PayloadAction<Transcription>) => {
        state.transcriptions.unshift(action.payload)
        state.status = 'succeeded'
      })
      .addCase(createTranscription.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to create transcription'
      })
  },
})

// Export the reducer to use in the store
export default transcriptionSlice.reducer
