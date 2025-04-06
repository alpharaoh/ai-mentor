from pydantic import BaseModel
from dataclasses import dataclass
from agents import Agent, Runner
from fastapi import FastAPI


"""
Run an agent which does deep research, internet searching, and watches thousands of hours of YouTube videos to find information about a topic.
"""

class CalendarEvent(BaseModel):
    name: str
    date: str
    participants: list[str]
    
@dataclass
class UserContext:
  uid: str
  is_pro_user: bool

model = "meta-llama/llama-4-scout-17b-16e-instruct"

agent = Agent[UserContext](
    name="Researcher Agent",
    instructions="You are the best mentor ",
    output_type=CalendarEvent,
)

if __name__ == "__main__":
    result = Runner.run_sync(
        starting_agent=agent, 
        input="Akaam Shamerany wants to attend the PyCon US 2023 in San Diego, California on July 15th, 2023. He is interested in learning about the latest trends in Python and web development. He's attending it with Jack and Jasmine",
    )

    print(result.final_output)

app = FastAPI()

class Transcript(BaseModel):
    text: str
    speaker: str

@app.post("/api/run_analysis")
async def run_analysis(transcript: Transcript):
    # Return transcript as JSON object stringified
    return {"transcript": transcript}
