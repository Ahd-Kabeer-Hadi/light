import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { SpeechClient } from "@google-cloud/speech";
import { TranslationServiceClient } from "@google-cloud/translate";

const speechClient = new SpeechClient();
const translationClient = new TranslationServiceClient();

export async function transcribeVideo(videoUrl: string) {
  const audioFilePath = await downloadAndExtractAudio(videoUrl);
  const language = await detectLanguage(audioFilePath);
  const transcript = await transcribeAudio(audioFilePath, language);

  fs.unlinkSync(audioFilePath);

  return { transcript };
}

async function downloadAndExtractAudio(videoUrl: string): Promise<string> {
  const videoReadableStream = ytdl(videoUrl, { quality: "lowestaudio" });
  const outputPath = path.join(process.cwd(), "temp", `${Date.now()}.mp3`);

  return new Promise((resolve, reject) => {
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

  return result.languages?.[0]?.languageCode ?? "English";
}
async function transcribeAudio(
  audioFilePath: string,
  language: string
): Promise<string> {
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
  }else{
    return "error, transcription failed"
  }
}
