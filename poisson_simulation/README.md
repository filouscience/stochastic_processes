## Poisson process simulation

Let us consider a continuous-time random process $Q(t)$, which can be in either of two states 1 and 2 according to probabilities $p_1(t)$ and $p_2(t)$, respectively.
The time evolution of the probabilities follows the set of equations:
```math
\begin{aligned}
\frac{d}{dt} p_1(t) &=- \lambda(t)p_1(t) + \mu(t)p_2(t)\\
\frac{d}{dt} p_2(t) &=+ \lambda(t)p_1(t) - \mu(t)p_2(t)
\end{aligned}
```
with intensities (or jumping rates) $\lambda(t)$ and $\mu(t)$.
The normalization $p_1(t)+p_2(t)=1$, allows for a description of the kinetics with a single function $y(t) = p_1(t) - p_2(t)$.

We simulate a large number of random trajectories of $Q(t)$ with particular rates $\lambda(t)$ and $\mu(t)$.
Taking the ensemble average, we reconstruct the function $y(t)$ yielding the probabilities $p_1(t)$ and $p_2(t)$.

In our examples, we choose (a) exponential and (b) harmonic time dependency of $\lambda(t)$ and $\mu(t)$:
|![(a) exponential intensities](docs/exp.png "(a) exponential")|![(b) harmonic intensities](docs/harm.png "(b) harmonic")|
|-|-|

There is a full report [PDF](docs/poisson_process.pdf) available (in Czech).
