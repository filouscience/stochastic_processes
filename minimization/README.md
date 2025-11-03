## 2D random walk minimization

While the standard gradient descent finds a local minimum, it has no way of telling if the minimum is global.
By introducing a random element in the process, the algorithm may be able to exit a local minimum and try searching elsewhere.
So instead of descending in the direction of the gradient $-\nabla z(x,y)$ from point $(x_1,x_2)$,
let us select a step (of a fixed length $l$) in a random direction resulting in a new proposed point $(x_2,y_2)$.

- If the step is downhill $z(x_2,y_2) < z(x_1,y_1)$, it's fine and we take it.
- If it is uphill, we ask how much and compare it to a **random number** $u$:
```math
e^{-[z(x_2,y_2)-z(x_1,y_1)]/T} >= u
```
The exponential normalizes the difference to the interval $(0,1)$, and let $u$ be from a uniform distribution on the same interval.
Based on this comparison, we decide to accept or refuse to take the step. If the inequality holds, we accept.

Like this, the random walk prefers descending towards a local minimum, rejecting some of the proposed steps,
but is still able to roam around and search for other minima.
The parameter $T$ can be interpreted as temperature:
the higher the temperature, the more "lively" the Brownian particle during a random walk.

At the time, I found it pretty cool and created this project,
simply following the steps as presented by the teacher during an elementary course on using computers in physics.
Only later have I realized that this is actually an implementation of the Metropolis algorithm (a Markov chain Monte Carlo method).

### Metropolis algorithm

In general, the algorithm serves to sample a probability distribution, which may be difficult to find.
For example, what is the probability of finding a molecule near a given point in a complex potential landscape?
We only know, that the probability density will be proportional to the Boltzmann distribution:
```math
f(x,y) \approx e^{-\frac{mgz(x,y)}{k_BT}}
```
where $mgz(x,y)$ is the potential energy, $k_B$ is the Boltzmann constant, $T$ is the temperature.

For the decision whether to accept or refuse a proposed step, an *acceptance ratio* $\alpha$ is calculated:
```math
\alpha = \frac{f(x_2,y_2)}{f(x_1,y_1)} = e^{-\frac{mg}{k_BT}[z(x_2,y_2)-z(x_1,y_1)]}
```
and compared to $u$.

If we let the algorithm run for a sufficient time and keep a histogram of positions $(x,y)$,
we arrive at the desired probability distribution (provided sufficient temperature).
Going back to the original minimization problem, we can simply find the maximum of the histogram,
which corresponds to the global minimum of the potential landscape.

---

In our example, we stop the algorithm if $z$ value is sufficiently small. The tolerance is set beforehand.
There are a few preset potential landscapes to select from.
