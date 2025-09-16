## Ornstein&ndash;Uhlenbeck process

The general equation of motion for a particle (e.g. a molecule) is:
```math
m\frac{d^2x}{dt^2} = -\lambda \frac{dx}{dt} - \theta x + F(t)
```
We consider the case of motion **overdamped** by friction $\lambda$, where the inertial term on the left-hand side can be neglected.
The second term on the right-hand side is the force driving the particle towards the equilibrium position $x_\infty=0$.
The time-dependent external force $F(t)$ will be a random variable.
The general equation of motion becomes the **Langevin equation**:
```math
\frac{dx}{dt} = - \gamma x + \sigma \eta(t)
```
where $\eta(t)$ represents *Gaussian white noise*.

A simple Monte Carlo simulation can be performed, assuming a short time step $\Delta t$, following the Euler&ndash;Maruyama method:
```math
x_{t+1} = x_t - \gamma x_t \Delta t + N(0,V)
```
where $N$ is a random sample from the normal distribution with mean $\mu=0$ and variance $V = \sigma^2 \Delta t$. The update can be expressed as:
```math
x_{t+1} = x_t - \gamma x_t \Delta t + \sigma \sqrt{\Delta t} N(0,1)
```
with samples from standard normal distribution.

---

The probability distribution function $P(x,t)$ follows the **Fokker&ndash;Planck equation**:
```math
\frac{dP}{dt} = \gamma \frac{\partial}{\partial x} (xP) + \frac{\sigma^2}{2} \frac{\partial^2}{\partial x^2} P
```
It can be solved analytically to obtain the propagator $P(x,t|x',t')$ for $t>t'$. The probability distribution of $x(t)$ is plotted in the histograms to be compared to the MC results. Furthermore, one can obtain the mean $\mu_x(t)$ and variance $V_x(t)$ of $x(t)$.

The simulated trajectories can be smoothed-out by the knowledge of the evolution of the mean and variance during the finite time step.
In other words, in each step, the dynamics is integrated over $\Delta t$, reducing the local error of the finite time step.
The Monte Carlo update becomes the following
```math
x_{t+1} = x_t e^{-\gamma \Delta t} + N(0,V)
```
with the variance $V$:
```math
V = \frac{\sigma^2}{2\gamma} ( 1-e^{-2 \gamma \Delta t} )
```
Again, the update can be expressed in terms of the standard normal distribution
```math
x_{t+1} = x_t - \gamma x_t \Delta t + \sqrt{V} N(0,1)
```

For a sufficiently small $\Delta t$, we should get the same results from both MC implementations.
Therefore the latter version serves just as an exercise with the analytic solution to the Fokker&ndash;Planck equation, which is otherwise not needed to perform MC simulations.

---

### Gaussian noise
Gaussian noise $\eta(t)$ is a stochastic process where subsequent samples are mutually uncorrelated and following the same normal distribution.
Then also their linear combination follows the normal distribution.
This is the reason why an arbitrarily long time step of the trajectory can be sampled from a normal distribution as well.

### Box&ndash;Muller transform
The sampling of the normal distribution can be done with Box-Muller transform,
in which two independent samples from uniform distribution on \[0;1) interval are transformed into two independent samples from standard normal distribution.
```math
\{U_1, U_2\}\rightarrow \{N_1, N_2\}
```

### histogram extrapolation
The trajectories are simulated only on a finite time window.
In order to see if the process converges to the equilibrium probability distribution (at $t=\infty$), we perform a time extrapolation of the data stored in histograms using Lagrange polynomial.

However, we do not evaluate the polynomial at $t=\infty$. Instead, we transform the time series: $\tau = t^{-\alpha}$ and evaluate the extrapolation polynomial at $\tau=0$.

The extrapolation is done on the time series of each bin of the histogram independently.
This is perhaps not a particularly smart approach, since it doesn't necessarily conserve the number of trajectories.
Yet, it works surprisingly well.
