// src\lib\transcriber.ts

import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import fs from "fs";
import path from "path";
import { SpeechClient } from "@google-cloud/speech";
import { TranslationServiceClient } from "@google-cloud/translate";

// Set the path to the static ffmpeg binary
ffmpeg.setFfmpegPath(ffmpegStatic as string);

const speechClient = new SpeechClient();
const translationClient = new TranslationServiceClient();

export async function transcribeVideo(videoUrl: string): Promise<{ transcript: string }> {
  console.log(videoUrl);

  const audioFilePath = await downloadAndExtractAudio(videoUrl);
  console.log(audioFilePath);

  const language = await detectLanguage(audioFilePath);
  console.log(language);
  const transcript = await transcribeAudio(audioFilePath, language);

  console.log(transcript);

  fs.unlinkSync(audioFilePath);

  return { transcript };
}

async function downloadAndExtractAudio(videoUrl: string): Promise<string> {
  const videoReadableStream = ytdl(videoUrl, { quality: "lowestaudio" });
  const outputPath = path.join(process.cwd(), "temp", `${Date.now()}.mp3`);

  // Ensure the temp directory exists
  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }

  console.log(outputPath);
  return new Promise((resolve, reject) => {
    console.log("ffmpeg started");
    ffmpeg(videoReadableStream)
      .audioBitrate(128)
      .toFormat("mp3")
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
}

async function detectLanguage(audioFilePath: string): Promise<string> {
  const [result] = await translationClient.detectLanguage({
    content: fs.readFileSync(audioFilePath).toString("base64"),
    mimeType: "audio/mp3",
  });

  return result.languages?.[0]?.languageCode ?? "en";
}

async function transcribeAudio(audioFilePath: string, language: string): Promise<string> {
  const audio = {
    content: fs.readFileSync(audioFilePath).toString("base64"),
  };

  const config = {
    encoding: "MP3" as const,
    sampleRateHertz: 16000,
    languageCode: language,
  };

  const [response] = await speechClient.recognize({ audio, config });

  if (response.results) {
    const transcript = response.results
      .map((result) => result.alternatives?.[0]?.transcript)
      .join("\n");
    return transcript.slice(0, 1000);
  } else {
    return "Error: transcription failed";
  }
}
