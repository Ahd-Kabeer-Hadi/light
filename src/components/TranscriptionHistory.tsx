"use client";

import { fetchTranscriptions } from "@/redux/slices/transcriptionSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export default function TranscriptionHistory() {
  const dispatch = useDispatch<AppDispatch>();
  const { transcriptions, status, error } = useSelector(
    (state: RootState) => state.transcription
  );

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTranscriptions());
    }
  }, [status, dispatch]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "failed") {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="w-full max-w-4xl mt-8">
      <h2 className="text-2xl font-bold mb-4">Transcription History</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Video URL</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Summary</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transcriptions.map((transcription) => (
            <TableRow key={transcription.id}>
              <TableCell>{transcription.videoUrl}</TableCell>
              <TableCell>
                {new Date(transcription.createdAt).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
