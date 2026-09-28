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
