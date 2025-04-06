from pydantic import BaseModel
from dataclasses import dataclass
from agents import Agent, Runner
from fastapi import FastAPI, Body
from dotenv import load_dotenv

load_dotenv()


class ActionPlan(BaseModel):
    objective: str
    subjects_to_research: list[str]
    
@dataclass
class UserContext:
  uid: str
  is_pro_user: bool

app = FastAPI()

class Transcript(BaseModel):
    text: str
    speaker: str

@app.post("/api/run_analysis")
async def run_analysis(transcripts: list[Transcript] = Body(embed=True)):
    action_plan_agent = Agent[UserContext](
        name="Researcher Agent",
        instructions="You are the best mentor in the world with an IQ of 160. Your task is to create a research plan given a transcript from a conversation between a user and the mentor. The research plan must contain subjects, must be nuanced, and powerful and helpful for exactly what the user wants. Each subject to research must be 1-2 sentances long",
        output_type=ActionPlan,
    )

    result = await Runner.run(
        starting_agent=action_plan_agent, 
        input=transcript_to_input(transcripts)
    )

    return result.final_output

def transcript_to_input(transcript: list[Transcript]) -> str:
    return "\n\n".join([f"{t.speaker}: {t.text}" for t in transcript])
