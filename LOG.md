# Log

Newest entries first. Format: `## YYYY-MM-DD: title`, then what happened, what we learned, and next steps.

---

## 2026-09-30: Home page cut to four parts

- The founders want the site very concise. It now has:
  1. one line: "Simulated customers you can check against real human behaviour.";
  2. the CoBRA CHI 2026 Best Paper, linked to arXiv;
  3. the film, playing inline;
  4. a footer with the co-founders and xul049@ucsd.edu.
- Everything else was dropped.

## 2026-09-29: Company home page draft (yax.clawder.ai)

- Built `site/` as a static page from the founders' copy:
  - hero, proof strip, problem, audit → calibrate → reuse, the calibration loop, the film, team, and the contact CTA.
- The hero visual is an illustrative trait readout: following the crowd at 2.6 of 4, checked in Asch 1951 and the hotel towel study 2008.
- Preview: https://claude.ai/artifact/SysvJhvgkZhB9RGCpUgxw9
- Still open: the T04 chart, the film length in the link text (47 s in the copy, 1:37 actual), and the team lines.

## 2026-09-29: Film v3 (story fixes)

- Founder feedback on v2:
  1. A rocket reads as a space launch, not a product launch.
  2. The film jumps to "one layer deeper" without first showing today's methods, and the tags go by too fast to read.
  3. Nothing explains what 2.6 means.
  4. The cut into the sandbox is abrupt, and the opening scene is too short.
- v3 (`film/v3/`, 92.5 s) changes:
  - the launch card is now a product box with a NEW! sticker;
  - a new "how teams guess today" scene (surveys, focus groups, demographic persona);
  - the tags stay readable longer and are struck out more slowly;
  - a new "what 2.6 looks like" scene shows the same person at 0.5, 2.6 and 3.8, and the 2.6 panel reads "leans in, can say no";
  - a bridge scene where calibrated residents walk into the paper town and the pencil draws straight into SocietaBox;
  - the opening lingers longer.
- Four new narration lines were generated with Kokoro. The logo stamp is still on a downbeat (bar 34). Voice sits 11.9 dB over the music.
- Player: https://claude.ai/artifact/KWWM4VGSxHpkasQUMCQjNN
- Revision 2 (97.5 s), after founder feedback:
  - a correlation-vs-causation line before "one layer deeper": "But demographics only correlate with choices. They don't cause them." It is shown as a "correlates ≠ cause" stamp. This is the core pitch contrast: others model who people are, we model the mechanism of how they decide;
  - "across every scenario" before "from a café…".

## 2026-09-29: Film v2 (extended)

- The founder prefers v0. v2 keeps all of v0 and inserts a 25 s calibration section in v1's style after the genome scene: dial set to 2.6 → classic studies and the Cognitive Bias Index → tune prompt, inner state or weights until it holds → holds across models.
- Total 67.5 s. The logo stamp lands on a downbeat at 60 s. Voice sits 11 dB over the music.
- Player: https://claude.ai/artifact/3kwV6NXWcfVHexDmQmoQSL

## 2026-09-29: Film v1 (calibration) and v0 archived

- The first film is kept as v0 in `film/v0/`.
- v1 (`film/v1/`, 32.2 s) expands the cognitive-genome part around YAX calibration, following Deck v4 and CoBRA:
  - set a trait level on a 0–4 scale;
  - measure it with classic experiments (Asch, hotel towel), scoring answers 4 to 0 into the Cognitive Bias Index;
  - adjust via prompt, activations or weights;
  - the result holds across models;
  - "Measured in humans? We can set it in an agent."
- Player: https://claude.ai/artifact/Qgdhdzyt2pnpjsJ4jCTr5C
- CoBRA facts used: 4 biases (authority, bandwagon, confirmation, framing), 8 paradigms (Milgram, Stanford Prison, Asch, Hotel Towel, Wason, Biased Information, Asian Disease, Investment/Insurance), 0–4 Likert scale, three control spaces.

## 2026-09-29: YAX film (autonomous production)

- 42.5 s paper-collage film. Story: every decision is a guess about people → launches, prices and crisis messages cannot be rehearsed (clapperboard "TAKE 1 of 1") → one layer deeper: demographic tags crossed out, a cognitive genome tape unrolls → readable, editable, portable (magnifier, pencil, postcards for café, negotiation, evacuation) → SocietaBox: a pencil draws the world ahead of the AI agent → corkboard of moments: weak spots circled, luck notes crumpled, then trained to checkmarks, and new ones appear → YAX ransom-letter logo, "how people decide, and how agents learn to", SocietaGene · SocietaBox.
- Narration by Kokoro TTS run locally (no API keys were available; the network allowed only the package registries, so the model came from an npm package that bundles the weights). "YAX" is pronounced like "yaks".
- The original score and sound design were synthesized in code.
- Files are in `film/`. Player: https://claude.ai/artifact/Xjr66XcCo45g3Vnzm5ydWp

## 2026-09-28: Company name and demo video plan

- The company is **YAX**. Working product names: **SocietaBox** (trainable generative social sandbox) and **SocietaGene** (cognitive genome); alternatives are still open.
- Demo video plan: two 15-second segments, each usable on its own.
  1. Cognitive genome: composable, readable, editable, portable across scenarios.
  2. Trainable sandbox: finds where the agent is socially deficient and trains it there; co-evolves.
- No math on screen.
- Positioning vs Simile: Simile copies *who* a person is; YAX models *how* people decide and trains agents in a sandbox that learns.

## 2026-09-28: Two simple proposals (method + application) and demo v3

- `proposal/method_proposal.pdf`, "Beyond Learnability: Discrimination-Aware Curricula for Generative Environments":
  - States are items (2PL).
  - One family Pri_k = a^k p(1-p): SFL learnability (k=0), progress and linearized regret (k=1), information (k=2).
  - Learnability is fooled by coin-flip items; bad items have signatures (a≈0 ill-posed, a<0 mis-keyed); regret degeneracy.
  - a is estimated from checkpoints by rewinding and branching.
  - Experiments E1 (planted noise and mis-keys), E2 (minimax mazes with stochastic tiles), E3 (LLM task generator vs a binary filter).
- `proposal/app_proposal.pdf`, "Juniper Town: Surfacing the Moments That Matter in a Generative Social Sandbox":
  - Café owner "what if" scenario; simple tech (prompted LLM residents plus an LLM world engine).
  - Critical-moment finder ranks situations by a·p(1-p); includes a demo screenshot.
- Demo v3 (same link): the world-generator panel is now the "Critical-moment finder" scoring a·p(1-p). New events: an oat-milk surcharge and a chance raffle. The raffle shows split 0.99 but a 0.08, so the finder picks the surcharge (loss aversion, a≈0.50). Numbers come from hand-set rules.
- The joint proposal is moved to `proposal/archive/`.
- Literature to verify: Skill Self-Play (2026), DEGen (2026), IDGen, IrtNet, and "Transferable Curricula through Difficulty Conditioned Generators" (already uses IRT difficulty), SPADE (arXiv 2608.19197).

## 2026-09-28: Joint one-page proposal (replaces the two separate ones)

- Founder feedback:
  - "Skill" is the wrong word; use LLM **meta-attributes**.
  - Aim for novel, not incremental work; don't follow PAIRED closely.
  - One PDF for both courses.
  - Temporal sparsity: skip full rollouts and training on non-critical steps.
  - The algorithm need not be tied to social simulation.
- Grounded in our own prior work:
  - Love First, Know Later (NeurIPS 2025 workshop): H1 sparse rewards at critical moments, H2 low-entropy decisions there.
  - Programmable Cognitive Bias (arXiv 2509.13588): meta-attributes.
- `proposal/joint_proposal.pdf`, "Where Is the Agent Socially Deficient? Co-Evolving LLM Agents and a Generative Social Sandbox through Critical Moments":
  - H1 temporal sparsity, H2 decisiveness, H3 attribute sparsity (trait activation, so each moment's sensing vector is sparse).
  - Compressed episodes: a jump model over routine segments; the agent acts only at critical moments.
  - Sense / Teach / Calibrate loop. Expander-graph sparse designs give RIP-1 and l1 recovery.
  - Sandbox reward = information gain + learning progress - unfaithfulness.
  - Target bound: |J_full - J_comp| <= K(R_max eps_W + L delta).
  - Track A (RL course): algorithmic, on a synthetic sparse-critical POMDP suite and text games. Track B (ML course): the social sandbox, evaluated on SOTOPIA and on the speed-dating and divorce data.
- The earlier two separate PDFs are moved to `proposal/archive/`.

## 2026-09-28: Course proposals as one-page PDFs (technical)

- Correction: we do not have an RL environment yet. The town demo runs on hand-set rules.
- New framing, "Compressed Regret Sensing" (CRS), with PAIRED/PLR/ACCEL as the main related work:
  - (A1) Skill sparsity: regret factorizes as phi(theta)^T delta(pi) with a k-sparse deficiency, i.e. a low-rank regret matrix.
  - (A2) Temporal sparsity: the advantage is concentrated on a few decision-critical steps.
  - Method: randomize to measure (basis pursuit, RIP, n = O(k log(d/k)) probes); learn phi by regret-matrix completion; target to train (a generator with a dense predicted-regret reward); sparse rollouts (options for routine segments, branching only at critical steps).
- `proposal/rl_proposal.pdf` (RL course): the pure-RL method on minimax/MiniGrid and Craftax against DR, PAIRED, Robust PLR, ACCEL.
- `proposal/ml_proposal.pdf` (ML course): the social sandbox as a UPOMDP (scripts × perturbations × NPC genomes); inductive matrix completion with sparse deficiencies; admission classifier; critical-turn detection; SOTOPIA evaluation.
- Sources are in `proposal/src/`. Rebuild with `node proposal/src/build.js` (needs katex from npm and playwright).

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
