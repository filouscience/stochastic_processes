// poisson_simulation.cpp

#include <cmath>
#include <ctime>
#include <iostream>

// number of simulations/trajectories

#define NUM 1000000

// time window

#define TIME 8
#define RES 100
#define STEP 0.08 // TIME/RES

// simulation type

#define EXP 0
#define HARM 1

#define TYPE EXP

// time dependent transition rates:

// exponential
// lambda(t) = NU*exp(-A*t)
// mi(t) = NU*(1-exp(-A*t))

// harmonic
// lambda(t) = NU*sin^2(W*t)
// mi(t) = NU*cos^2(W*t)

#define NU 1.2f
#define A 1.1f
#define W 1.3f

// allowed states/values for dichotomic process
#define E1  0
#define E2  1

#define INIT1 1
#define INIT2 1

// technical stuff

#define PI 4*atan(1.0f)
#define EPSILON 0.00001
#define MAX_ITER 100

double rnd() // return uniformly distributed random number from interval [0:1)
{
    double r = (double) std::rand() / RAND_MAX;
    if (r == 1)
        return rnd();
    //std::cout << "random number generator: " << r << std::endl;
    return r;
}

double get_transition_time(double curr_time, bool curr_state)
{
    if (TYPE == EXP)
    {
        if (curr_state == false)
        {
            double t;
            // explicit solution
            double u = A*log(1-rnd())/NU + exp(-A*curr_time);
            if (u <= 0)
                t = TIME + STEP; // infinity
            else
                t = -log(u)/A;
            //std::cout << "explicit solution of t: " << t << std::endl;
            return t;
        }
        else // curr_state == true
        {
            double c = log(1-rnd())/NU - exp(-A*curr_time)/A - curr_time;
            // Newton's algorithm
            double x = curr_time + 1/NU;
            int i;
            double fx;
            for (i = 0; i < MAX_ITER; i++)
            {
                fx = x + exp(-A*x)/A + c;
                if (fx < EPSILON && fx > -EPSILON)
                {
                    break;
                }
                x = x - fx/(1 - exp(-A*x));
            }
            //std::cout << "Newton's method " << (i < MAX_ITER ? "converged" : "did not converge") << " after " << i << " iterations, delta: " << fx << ", dt: " << x-curr_time << std::endl;

            // this should never happen due to Newton's method convergence and initial point selection
            // (although a negative time solution exists)
            if (x-curr_time < 0)
            {
                std::cout << "negative transition time selected!" << std::endl;
                x = curr_time+STEP;
            }
            return x;
        }
    }
    else if (TYPE == HARM)
    {
        double c = 2*log(1-rnd())/NU - curr_time - (curr_state ? 1 : -1)*sin(2*W*curr_time)/(2*W);
        // bisection method
        double a = curr_time;
        double b = TIME + STEP;
        double fa = a + (curr_state ? 1 : -1)*sin(2*W*a)/(2*W) + c;
        double fb = b + (curr_state ? 1 : -1)*sin(2*W*b)/(2*W) + c;
        if (fa*fb > 0)
            return b;
        int i;
        double x;
        double fx;
        for (i = 0; i < MAX_ITER; i++)
        {
            x = (a+b)/2;
            fx = x + (curr_state ? 1 : -1)*sin(2*W*x)/(2*W) + c;

            if (fx < EPSILON && fx > -EPSILON)
            {
                //std::cout << "bisection method converged after " << i+1 << " iterations, delta: " << fx << ", dt: " << x-curr_time << std::endl;
                return x;
            }
            else if (fa*fx < 0)
            {
                b = x;
                //fb = fx;
            }
            else
            {
                a = x;
                fa = fx;
            }
        }
        //std::cout << "bisection method did not converge after " << i << " iterations, delta: " << fx << ", dt: " << x-curr_time << std::endl;
        return x;
    }
    else // unsupported type
    {
        std::cout << "unsupported type of simulation/choice of coefficients! TYPE: " << TYPE << std::endl;
        return TIME + STEP; // end of simulation
    }
}

int main(int argc, char* argv[])
{
    double simtime;
    bool state;
    int histogram_e1[RES];
    int index;

    std::srand((unsigned)time(0));
    for (int i = 0; i < RES; i++)
        histogram_e1[i] = 0;

    // simulate NUM trajectories:
    for (int j = 0; j < NUM; j++)
    {
        // initialize
        simtime = 0;
        state = (j < (NUM/2) ? INIT1 : INIT2);
        index = 0;

        // generate sample trajectory ---> set definition NUM 1
        //std::cout << simtime << " " << (state ? 0 : 1) << std::endl;

        while (simtime <= TIME)
        {
            double t = get_transition_time(simtime, state);
            int add = (state ? 0 : 1);
            while (((index*STEP) < t) && (index < RES))
            {
                histogram_e1[index] += add;
                index++;
            }
            state = !state;
            simtime = t;
            //std::cout << "transition to state: " << state << " at time: " << simtime << std::endl;

            // generate sample trajectory ---> set definition NUM 1
            //std::cout << simtime-0.001 << " " << (state ? 1 : 0) << std::endl;
            //std::cout << simtime << " " << (state ? 0 : 1) << std::endl;
        }
        //std::cout << "trajectory #" << j << " simulated." << std::endl;
    }
    for (index = 0; index < RES; index++)
    {
        std::cout << index*STEP << " " << (double)histogram_e1[index]/NUM << " " << (double)(NUM-histogram_e1[index])/NUM << std::endl;
    }

    //std::cin.get();
    return 0;
}

