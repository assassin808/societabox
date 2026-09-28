# Company thesis (working notes)

Source: founder outreach email draft (Haoyang Shang to Allen) and founder discussion, 2026-09-28.

## Team
- Haoyang Shang: MASc student, UBC.
- Xuan Liu: PhD researcher, UC San Diego.

## Pitch (from outreach email)
- Let decision-makers test how people will respond before they act. The decisions that matter most (a product launch, a public message, a crisis response) often can't be A/B tested in the real world.
- Existing tools model people from who they are (demographics) and what they have said (surveys, interviews). We go one layer deeper: the cognitive mechanisms that shape their decisions.
- That answers both "what will people do?" and "how would their behaviour change if we changed X?"
- Research origin: programming cognitive mechanisms into AI agents. Best Paper Award, CHI 2026.
- System: validated behavioural science turned into cognitive profiles for AI agents, then those agents verified against real human behaviour. Each profile is a reusable cognitive asset that can be read, edited, and carried across scenarios.
- Traction: the technology is funded and in use, including a tsunami evacuation project with IRIDeS (Tohoku University) and research teams at more than 10 universities.
- Beachhead market: market research, where the problem already has a budget and a workflow.

## Technical thesis (founder's words, summarized)
- Goal: give any LLM a human skill or trait (example: "group leader in department B of company A").
- Training is anchored in human behaviour studies, but that is not enough. A person is a combination of traits. An LLM can have each ability and still fail to use them together in context.
- We do not collect human data from the target setting. That would require knowing how the real data is generated, and effectively infinite data.
- Instead, assume a good verifier that can tell whether the LLM succeeds or fails. Put the LLM in a purpose-built sandbox where it trains itself to acquire the ability.
- The sandbox is also trained with RL and co-evolves with the agent.
