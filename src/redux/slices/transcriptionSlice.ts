import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

export interface Transcription {
  id: string
  videoUrl: string
  transcript: string
  createdAt: string
}

interface TranscriptionState {
  transcriptions: Transcription[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: TranscriptionState = {
  transcriptions: [],
  status: 'idle',
  error: null,
}

export const fetchTranscriptions = createAsyncThunk(
  'transcription/fetchTranscriptions',
  async () => {
    const response = await axios.get('/api/transcriptions')
    return response.data
  }
)

export const createTranscription = createAsyncThunk(
  'transcription/createTranscription',
  async (videoUrl: string) => {
    const response = await axios.post('/api/transcribe', { videoUrl })
    return response.data
  }
)

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
        state.error = action.error.message || null
      })
      .addCase(createTranscription.fulfilled, (state, action: PayloadAction<Transcription>) => {
        state.transcriptions.unshift(action.payload)
      })
  },
})

export default transcriptionSlice.reducer



// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface Transcription {
//   id: string;
//   videoUrl: string;
//   transcript: string;
//   summary: string;
//   createdAt: string;
// }

// interface TanscriptionState {
//   transcriptions: Transcription[];
//   loading: boolean;
//   error: string | null;
// }

// const initialState: TanscriptionState = {
//   transcriptions: [],
//   loading: false,
//   error: null,
// };

// export const transcriptionSlice = createSlice({
//   name: "transcription",
//   initialState,
//   reducers: {
//     setTranscriptions: (state, action: PayloadAction<Transcription[]>) => {
//       state.transcriptions = action.payload;
//     },
//     addTranscriptions: (state, action: PayloadAction<Transcription>) => {
//       state.transcriptions.unshift(action.payload);
//     },
//     setLoading: (state, action: PayloadAction<boolean>) => {
//       state.loading = action.payload;
//     },
//     setError: (state, action: PayloadAction<string | null>) => {
//       state.error = action.payload;
//     },
//   },
// });

// export const { setTranscriptions, addTranscriptions, setLoading, setError } =
//   transcriptionSlice.actions;

// export default transcriptionSlice.reducer;
