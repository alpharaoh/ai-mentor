import { mentorSystemPrompt } from "@/prompts/mentor";

if (!process.env.ULTRAVOX_API_KEY) {
  throw new Error("ULTRAVOX_API_KEY is not set");
}

export async function POST() {
  const options = {
    method: "POST",
    headers: {
      "X-API-Key": process.env.ULTRAVOX_API_KEY as string,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemPrompt: mentorSystemPrompt,
      temperature: 0,
      model: "fixie-ai/ultravox",
      voice: "91fa9bcf-93c8-467c-8b29-973720e3f167",
      initialMessages: [],
      timeExceededMessage: "Hey, I'm sorry, but I've run out of time. You may have to call me back another time.",
      recordingEnabled: true,
      transcriptOptional: true,
      initialOutputMedium: "MESSAGE_MEDIUM_VOICE",
      experimentalSettings: {},
      firstSpeakerSettings: {
        agent: {
          uninterruptible: true,
          text: "Hey, how's it going?",
        },
      },
      metadata: {},
    }),
  };

  const result = await fetch("https://api.ultravox.ai/api/calls", options).then((response) => response.json());

  console.log(result);

  return Response.json({ callId: result.callId, joinUrl: result.joinUrl });
}
