# IRT view of curricula for generative environments (working notes, 2026-09-28)

## Setup
- A state s (inside a trajectory) is an item. The agent's latent ability is theta(w), a function of its weights w.
- Binary outcome y at s. 2PL model: p(s, theta) = sigma(a(s) * (theta - b(s))).
- a = discrimination, b = difficulty.

## Three quantities per item
1. **Slope of the item characteristic curve.** dp/dtheta = a * p(1-p).
2. **Expected learning progress** from one expected-gradient step on item s, with J_s(w) = p(s, theta(w)):
   Delta theta ≈ eta * a * p(1-p) * ||grad_w theta||^2.
   Progress is proportional to a * p(1-p): one power of a.
3. **Fisher information.** I = (dp/dtheta)^2 / (p(1-p)) = a^2 * p(1-p): two powers of a.
   Note I = P^2 / (p(1-p)), where P is the progress above.

## Relation to regret
Regret(s) = p(theta*) - p(theta) ≈ a * p(1-p) * (theta* - theta) when the gap is small. So regret ranks items like progress, scaled by the gap to the reference agent. It degenerates when:
- the reference agent (antagonist) is not ahead on the dimension this item measures (multidimensional case: a^T(theta* - theta) ≈ 0);
- the gap is large: items with p ≈ 0 and p* ≈ 1 get high regret but ~zero progress;
- a ≈ 0: regret estimated from a finite sample is positively biased noise.

## One family
Priority_k(s) = a^k * p(1-p):
- k = 0: learnability (SFL);
- k = 1: training progress and linearized regret;
- k = 2: measurement information (adaptive testing).

So training and evaluation do NOT share the same objective. They agree on which items are useless (a ≈ 0) and differ in how strongly they favour high-discrimination items.

## Key failure of learnability (k = 0)
p(1-p) is maximized by pure-noise items: an outcome that is a coin flip independent of ability has a = 0 and p = 0.5. Learnability cannot tell "at the frontier" from "random". Telling them apart requires ability variation, i.e. a population of checkpoints. That population exists for free during training.

## Multidimensional version
p = sigma(a(s)^T theta - b(s)).
- Progress along a target (deficient) direction u: p(1-p) * a(s)^T G u, with G = the metric grad_w theta grad_w theta^T.
- A useful state is one whose discrimination vector points along the deficiency.
- Off-diagonal entries of G give transfer and interference between abilities.

## Signatures of bad items
- a ≈ 0: ill-posed, unsolvable, or outcome unrelated to ability.
- a < 0: stronger agents fail more often. In classical psychometrics this is the signature of a miskeyed item; here it points to a wrong reference answer or a broken verifier.

## Risks
- **Spurious discrimination.** Checkpoints also drift in nuisance properties (verbosity, format), so a can pick up the wrong axis. Estimate a against ability anchored on a fixed item bank, and use multidimensional IRT to separate nuisance dimensions.
- **Predictive validity is not realism.** A high a against real outcome labels means the state is predictive, not that it is natural.
- **Local independence fails within a trajectory.** Use testlets or sequential IRT. Ability can also drift within an episode during training.
- **Dyadic traits** (compatibility) need a pair-level latent variable.

## Proposal under discussion: critical-moment discovery as sparse recovery (2026-09-28)
- Idea: randomly inject subsets of N candidate events into simulated trajectories and regress outcomes (Lasso/OMP). This needs m = O(k log(N/k)) simulations instead of N ablations. Action-level version: ZORO-style sparse gradients over response features.
- Claude's assessment:
  - Good as a component: it answers the finder's cost question. It is not a standalone topic.
  - Close prior art: factorial screening designs and effect sparsity (Box & Meyer 1986), group testing, Datamodels (random-subset regression for attribution), KernelSHAP/RISE-style random masking.
  - Novelty would have to come from: policy-dependent measurement matrices; threshold (1-bit) outcomes; order and interaction effects; adaptive design driven by IRT information.
  - Validation needs planted ground truth plus an external check against real outcomes, because recovery otherwise only reveals the simulator's own structure.
  - The action-sparsity part depends on a hand-chosen feature map and on controlled text generation, which is hard. Park it.

## Literature update (founder search, 2026-09-28)
- **Taken:** IRT for UED (PERM, Tio & Varakantham: 1PL, checkpoints as students); learnability (Tzannetos et al. 2023 first, used by SFL; NCC generalizes it to any deterministic setting as the variance of success rate); reward hacking by generators (Skill Self-Play, binary filter).
- **Still open (as far as searched):** 2PL discrimination as the environment objective; regret and learnability as special cases; learnability under stochastic outcomes; state-level items in generative environments.
- **Sharper positioning:** learnability methods are restricted to deterministic environments, and LLM-generated environments are stochastic. By the law of total variance, Var(y) = Var_theta(E[y|theta]) + E_theta[Var(y|theta)], i.e. learnable plus aleatoric. Learnability uses the total; the discrimination a isolates the learnable part.
- **To read:** SAMPLR (Jiang et al. 2022). From memory, it addresses curriculum-induced covariate shift over aleatoric parameters (the policy becomes suboptimal under the true aleatoric distribution), which is a different problem from selecting levels by learnable versus noise variance. Verify.

## Pipeline sketch: rollouts and finding critical states (2026-09-28)
1. **Full rollouts.** Run a few full trajectories per scenario with the current agent. Every turn's prefix is saved as a restorable state (text history plus the world state).
2. **Cheap screening of candidates.**
   - Large |ΔV| under a judge or critic.
   - One-step disagreement across checkpoints at the same prefix (if they agree, a ≈ 0 and the state is skipped).
   - Event nodes the environment injected.
3. **Branching at the candidates.** M checkpoints × K continuations from the prefix. Within-checkpoint spread gives the aleatoric noise; between-checkpoint spread gives a. Fit 2PL with anchor-bank abilities.
4. **Train from critical states.** Episodes reset to buffered high-a·p(1-p) prefixes. The GRPO group (K samples from the same prefix) gives the current agent's p for free; only a needs the checkpoints.
5. **Amortization.** Train a predictor â(s) from state text to screen new states without branching. Use sequential early stopping when the checkpoints agree.
6. **Staging.** Start with scenario-level items (comparable to SFL and PERM), then move to state-level items (the novel part).
