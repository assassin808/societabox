# Log

Newest entries first. Format: `## YYYY-MM-DD: title`, then what happened, what we learned, and next steps.

---

## 2026-09-28: One-page proposal and demo v2

- Proposal (Chinese, one page): `proposal/proposal.html`, live at https://claude.ai/artifact/K8MpVUM4jX1MEjM42aPWFd
  - Framework: genome + state → appraisal and arbitration → scripts (options) → episodes. Freedom ladder L0–L3.
  - Four modules: M1 gene library (ML), M2 choice-point fidelity and admission checker (ML), M3 gene controller (RL), M4 world generator (RL).
  - Course split: ML course takes M1+M2, RL course takes M3+M4; one joint paper.
- Demo v2: `prototypes/town-sim.html`, same link as before (https://claude.ai/artifact/3D84mk61m1s81WzinTaWe4)
  - L0–L3 switch; editable genomes (6 genes, each with an expression type and assay); state bars; script stages; arbitration breakdown with designer vs self-generated options.
  - World generator panel: picks events by population decision entropy. Events: a newcomer (Leo), oat milk running out, rain, a busker, the poetry sign-up.
  - Gene controller panel: per-step expressed gene strengths.
  - Population check: 300 sampled genomes vs a single persona.
  - All panel numbers are illustrative. The rules are hand-set stand-ins for the trained RL and ML modules.

## 2026-09-28: Competitive landscape and fundraising prep

- Founder wants to keep the town demo central and frame several paper proposals ahead of fundraising.
- Reviewed the Artificial Societies Benchmark paper and the funding of Simile, Aaru, Electric Twin and Artificial Societies. See `notes/landscape.md`.

## 2026-09-28: Company thesis captured

- Wrote down the big idea: the outreach email pitch plus the technical thesis (a verifier-driven RL sandbox that co-evolves with the agent). See `notes/company-thesis.md`.
- Next: discuss the thesis, then write a short purpose statement and reframe the town demo around it.

## 2026-09-27: Course projects as a startup vehicle, VC outreach, Simile-style town prototype

**Context**
- Two UBC course projects are available: one on reinforcement learning (RL), one on general machine learning (ML). The only requirement is that the topic relates to RL or ML.
- Plan: use these projects to bring in a collaborator who builds something useful for the startup.
- We have started contacting VCs.

**Skill test: rebuild Simile's pixel-world UI in about an hour**
- Simile (simile.ai, Joon Sung Park's company, which grew out of the Stanford "Generative Agents / Smallville" work) shows a small simulated world with pixel characters on its site.
- simile.ai was blocked from this sandbox, so the prototype follows the Smallville style rather than a pixel-exact copy of their page.
- Built `prototypes/town-sim.html`, a single self-contained HTML file with all pixel art drawn in code and no external assets:
  - 2 places: Maple Square (outdoor town with a café, two houses, a park and a pond) and the Juniper Café interior.
  - 3 agents: Mei (café owner), Rafael (painter) and Priya (UBC ML grad student). Each has a daily plan, an emoji status above their head, and a memory stream with importance scores.
  - Agents find their way around with BFS pathfinding, move between scenes through doors, and talk when they are near each other (scripted dialogue, logged to the town log and to memory).
  - "Whisper" feature: inject an idea into an agent's memory, and the agent brings it up in their next conversation.
  - Day/night lighting, speed controls, and a follow-agent camera.
- Live demo: https://claude.ai/artifact/3D84mk61m1s81WzinTaWe4

**Next**
- Decide the RL and ML project topics so they feed the startup (for example, LLM-driven agents in place of scripted dialogue, or RL agents learning routines inside this town).
- Keep a record of VC conversations here.

## 2026-09-27: Repository created

- Started the SocietaBox foundation repo to keep a running log of the entrepreneurship journey.
- Next: capture the initial idea, the problem, target users, and the team.
