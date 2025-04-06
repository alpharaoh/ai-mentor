import { Role, type Transcript } from "ultravox-client";

export async function POST(request: Request) {
  const body = await request.json();
  const transcripts = body.transcripts as Transcript[];

  const parsedTranscripts = transcripts.map((transcript) => ({
    text: transcript.text,
    speaker: transcript.speaker === Role.USER ? "user" : "agent",
  }));

  const response = await fetch(`${process.env.AGENT_SERVER_URL}/api/run_analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transcripts: parsedTranscripts,
    }),
  });

  const data = await response.json();

  return Response.json({ data });
}
