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

## Clarifications (2026-09-28)
- Target is **fidelity**: predict what real people will do, not make agents optimally competent.
- Mechanisms are represented two ways: prompt templates, and parameter or activation space (steering vectors, task vectors).
- The verifier checks agent behaviour against real human data.
- Course scope: each course delivers one module of the larger system, written up as a research paper at roughly ICML-poster level.

## Research plan direction (2026-09-28, founder)
- One paper covers both courses. Everything built also serves the startup: the town demo becomes the project demo, an interactive paper, and the VC/customer demo.
- Simple lab datasets are anchors, not the goal. Use them to choose and extract a small set of cognitive mechanisms (the word "traits" is dropped).
- Step 1: restrict scope to a few mechanisms. Do not fine-tune the whole model; mechanisms become controllable parameters (for example steering vectors).
- Step 2: a real simulation sandbox. At each agent action, an RL policy chooses the combination and strength of mechanisms. The mechanisms are the action space.

## Two open ideas (2026-09-28, founder)
1. **An RL-trained social-ability sandbox.** Given an evaluation dataset for one ability, learn (with RL) an environment such that an agent trained inside it becomes good at that ability. The sandbox is optimised; the eval set only scores it.
2. **The basic unit of the "cognitive genome".** Not yet defined. Open question: should it be an abstract interface that different implementations (prompt templates, steering vectors, adapters, and so on) can plug into?

Working answer (Claude): define the gene as an interface contract: construct, parameter, expression operator, assay, and composition. Then the sandbox's environment space is genome space × scenario space, which joins the two ideas. Details are in the chat of 2026-09-28.

## Ontology draft: how everyday life is represented (2026-09-28)
Four layers:
1. **Genome** (person-level, stable): cognitive mechanism parameters.
2. **Script** (situation-level, shared by a culture): a typed structure of roles, stages, slots, norms, expected transitions, and repair moves. Examples: ordering at a café, greeting, a class, small talk. See Schank & Abelson's scripts.
3. **Episode** (instantiation): script × genome × context (time, state, the other people, a disruption) → a concrete behaviour trajectory.
4. **Ability** (a competence dimension that cuts across scripts): how well someone reaches goals within and across scripts, especially when a script breaks. Negotiation, persuasion and leadership are high-stakes scripts plus the ability to reshape other people's scripts.

Key claim: routine behaviour mostly follows the script, and the genome mostly shows at choice points and breaks. LLMs are "too consistent" because they execute the most common version of each script.

## Revision: spontaneous goals (2026-09-28)
The four layers are top-down. Spontaneous behaviour (for example, seeing an attractive stranger and deciding to go talk to them) needs a bottom-up loop:
- Add a **state** layer: dynamic drives and condition (hunger, social need, mood, energy, time pressure).
- Every tick runs **perceive → appraise → arbitrate**. Cues in the world are appraised through genome and state; a candidate goal competes with the current script's goal (value minus interruption cost, norm cost, and social risk); if it wins, the agent continues, nests, switches, or abandons the script.
- Environment perturbations come in two kinds: **breaks** (outside events disrupt a script) and **opportunities** (cues that can trigger internal goals).
- Fidelity needs calibrated base rates: how often real people act on such cues, and how that varies by person and context.

## Freedom ladder ("Free Guy" framing, 2026-09-28)
- **L0 Loop:** a fixed script cycle A → B → C → A. Background NPCs; the current demo.
- **L1 Choice:** a closed graph with designer-given options at each node. The agent picks; the option set is fixed.
- **L2 Encounters:** the world can pop up new states (events and people), not just actions. A world-side generator (the "dungeon master") grows the graph at runtime.
- **L3 Option generation:** the agent also decides what can be chosen. It proposes new options, which are admitted if feasible and plausible.
- Formal view: an open-ended semi-MDP. Scripts are options (initiation set, policy, termination). L2 grows the state space; L3 grows the option set.
- Other actors as state: valid from one agent's point of view (standard in multi-agent RL). Keep internal state separate. Scale with levels of detail: nearby actors run as full agents; the distant crowd is an aggregate (mean-field) process, and a crowd member is promoted to a full agent when interacted with. Caveat: aggregation drops feedback loops, which is fine for bystanders and wrong for persuasion or leadership.
