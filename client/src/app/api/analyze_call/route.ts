import { type Transcript } from "ultravox-client";

export async function POST(request: Request) {
  const body = await request.json();
  const transcripts = body.transcripts as Transcript[];

  console.log(transcripts);

  return Response.json({ message: "success" });
}
