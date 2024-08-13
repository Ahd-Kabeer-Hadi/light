import { configureStore } from "@reduxjs/toolkit";
import transcriptionReducer from "./slices/transcriptionSlice";

export const store = configureStore({
    reducer:{
        transcription: transcriptionReducer
    },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch