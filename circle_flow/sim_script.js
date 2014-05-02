var TIME_CONSTANT = 1000; // real-time constant
var WINDOW_SIZE = 100;
var N_FLOW;
var sim_in_progress = false;
var SITE_CNT;
var PARTICLE_CNT;
var RATE_POS = 0.9; // default
var RATE_NEG = 0.6; // values
var sim_time;
var Run;
var Sites = new Array();
var Particles = new Array();
var Window = new Array();
// ###############################################################

function reset_sites()
{
  for (i = 0; i < SITE_CNT; i++)
  {
    Sites[i] = 0;
  }
  PARTICLE_CNT = 0;
}

function set_site_occupied(index, add)
{
  Sites[index] = add;
  set_site_fill(index, add);
  //output_log_msg("site #"+index+" occupied "+add);
}

function is_site_occupied(index)
{
  return Sites[index];
}

function random_number()
{
  // return a random number between 0 (inclusive) and 1 (exclusive)
  // uniform distribution (?)
  // no random seed
  var r = Math.random();
  if (r == 1)
  {
    //alert("Math.random() returned 1!"); // should never happen
    return 0;
  }
  return r;
}

function transform_exp(r, w)
{
  if (w == 0)
  {
    // zero rate --> never happen
    return Number.POSITIVE_INFINITY;
  }
  // exponentioal distribution
  // transformation method
  var t = -1 / w * Math.log(1 - r);
  return t;
}

function next_site(index, clockwise) {
    if (clockwise) {
        var i = index + 1;
        if (i >= SITE_CNT)
            i = 0;
        return i;
    }
    else {
        var i = index - 1;
        if (i < 0)
            i = SITE_CNT-1;
        return i;
    }
}

function prepare_particles()
{
  j = 0;
  for (i = 0; i < SITE_CNT; i++)
  {
    if (!is_site_occupied(i))
      continue;
    Particles[j] = new Object();
    Particles[j].site = i;
    Particles[j].rate_p = is_site_occupied(next_site(i, true)) ? 0 : RATE_POS;
    Particles[j].rate_n = is_site_occupied(next_site(i, false)) ? 0 : RATE_NEG;
    Particles[j].transtime_p = transform_exp(random_number(), Particles[j].rate_p);
    Particles[j].timer_p = Particles[j].transtime_p;
    Particles[j].transtime_n = transform_exp(random_number(), Particles[j].rate_n);
    Particles[j].timer_n = Particles[j].transtime_n;
    j++;
  }
//  if (j == 0)
//    output_log_msg("no particles present!");
}

function get_particle_on_site(index)
{
  if (is_site_occupied(index))
  {
    var j = -1;
    for (i = 0; i < PARTICLE_CNT; i++)
    {
      if (index == Particles[i].site)
        j = i;
    }
    return j;
  }
  else
  {
    return -1;
  }
}

function update_rate_for_site(index, clockwise, forced)
{
    var j = get_particle_on_site(index);
    if (j == -1)
    {
        //output_log_msg("updating rate for empty site #"+index);
        return;
    }

    if (clockwise)
    {
        new_rate = is_site_occupied(next_site(index, true)) ? 0 : RATE_POS;
        if (forced || new_rate != Particles[j].rate_p)
        {
            Particles[j].rate_p = new_rate;
            Particles[j].transtime_p = transform_exp(random_number(), Particles[j].rate_p);
            Particles[j].timer_p = Particles[j].transtime_p;
        }
    }
    else
    {
        new_rate = is_site_occupied(next_site(index, false)) ? 0 : RATE_NEG;
        if (forced || new_rate != Particles[j].rate_n)
        {
            Particles[j].rate_n = new_rate;
            Particles[j].transtime_n = transform_exp(random_number(), Particles[j].rate_n);
            Particles[j].timer_n = Particles[j].transtime_n;
        }
    }
}

function do_transition(j, clockwise, diff)
{
  var from = Particles[j].site;
  var to = next_site(from, clockwise);
  // move the particle
  set_site_occupied(from, 0);
  set_site_occupied(to, 1);
  Particles[j].site = to;

  // report
  var trans_t = clockwise ? Particles[j].transtime_p : Particles[j].transtime_n;
  var arrow = clockwise ? "&rarr;" : "&larr;";
  output_log_msg("particle #" + j + " moved from site #" + from + " to site #" + to + " (" + arrow + "). transition time " + trans_t.toFixed(4) + "; simtime diff " + diff.toFixed(4));

  // evaluate modified rates and times:
  update_rate_for_site(next_site(from, !clockwise), clockwise, false);  // from-1 --> from
  update_rate_for_site(to, !clockwise, true);                           //     to --> from
  update_rate_for_site(to, clockwise, true);                            //     to --> to+1
  update_rate_for_site(next_site(to, clockwise), !clockwise, false);    //   to+1 --> to
}

// FRTA step
function sim_step(a, tr_part, tr_cw, diff)
{
  //alert("I am alive");
    if (sim_in_progress) {

        if (tr_part != -1) // the real-time visualization requires this inconvenient construction :/
        {
            // perform the transition
            do_transition(tr_part, tr_cw, diff);

            // count current/flow statistics
            watch_current(a, tr_cw);
            output_total(a);
        }

        // find the soonest transition
        var tr_part;  // particle to be moved
        var tr_cw;    // clock-wisdom :)
        var diff = Number.POSITIVE_INFINITY;
        for (j = 0; j < PARTICLE_CNT; j++) {
            if (Particles[j].timer_p <= diff) {
                tr_part = j;
                tr_cw = true;
                diff = Particles[j].timer_p;
            }
            if (Particles[j].timer_n <= diff) {
                tr_part = j;
                tr_cw = false;
                diff = Particles[j].timer_n;
            }
        }

        // update simulation time
        sim_time += diff;
        output_simtime(sim_time);
        for (j = 0; j < PARTICLE_CNT; j++) {
            Particles[j].timer_p -= diff;
            Particles[j].timer_n -= diff;
        }

        // proceed to the next transition
        a++;
        var delay = (diff) * TIME_CONSTANT;
    }
    Run = setTimeout(function () { sim_step(a, tr_part, tr_cw, diff) }, delay);
}

function prepare_current()
{
  for (i = 0; i < N_FLOW; i++) {
    Window[i] = new Object();
    Window[i].dir = 0;
    Window[i].stamp = 0;
  }
}

function watch_current(a, cw)
{
// N_FLOW transitions happen within time interval t.
// during that time the system made x steps in a direction determined by its sign.
// x/N= avg step length, t/N = avg step duration, (x/N)/(t/N) = x/t = current.
    var x = 0;
    var t;
    itr = a % N_FLOW;
    Window[itr].dir = cw ? 1 : -1;
    Window[itr].stamp = sim_time;
    for (i = 0; i < N_FLOW; i++)
        x += Window[i].dir;
    t = sim_time - Window[(itr + 1) % N_FLOW].stamp;
    if (t != 0)
        output_current(x / t);
}



