function sites_set() {
    SITE_CNT = parseInt(document.getElementById("SITE_CNT").value);
    reset_sites();
    prepare_the_scene();
    output_reset();
}

function output_reset()
{
    output_simtime(0);
    output_total(0);
    output_current(0,0);
}

function rates_set() {
    RATE_POS = Math.max(parseFloat(document.getElementById("wplus").value),0);
    RATE_NEG = Math.max(parseFloat(document.getElementById("wminus").value),0);
    output_log_msg("set rates: w+ = " + RATE_POS + ", w- = " + RATE_NEG);

    prepare_particles(); // instantly recalculate rates
}

function site_onclick(id)
{
  if (sim_in_progress)
    return;

  // semaphore: cur_state XOR 1 (cannot use ! due to string type of the attribute value)
  var add = document.getElementById(id).getAttribute("opacity") ^ 1;

  var index = parseInt(id.replace('#', ''));
  if (add)
    PARTICLE_CNT += 1;
  else
    PARTICLE_CNT -= 1;
  output_particle(PARTICLE_CNT);

// call corresponding handler in the simulation script
  set_site_occupied(index, add);
}

function set_site_fill(index, add)
{
  var id = '#'+index;
  document.getElementById(id).setAttribute("opacity", add);
}

function speed_slide()
{
    if (document.speed_form.s[0].checked) // paused
    {
        sim_in_progress = false;
        return;
    }
    if (document.speed_form.s[1].checked) // real-time
    {
        TIME_CONSTANT = 1000;
    }
    else if (document.speed_form.s[2].checked) // max
    {
        TIME_CONSTANT = 0;
    }
    sim_in_progress = true;
}

function prepare_the_scene()
{
  var gsites = document.getElementById("GroupSites");
// remove old sites
  var last;
  while (last = gsites.lastChild) {
    gsites.removeChild(last);
  }
// prepare the sites
  var fi_step = 2*Math.PI/SITE_CNT;
  for (i = 0; i < SITE_CNT; i++)
  {
    var x = 500+300*Math.sin(i*fi_step);
    var y = 500-300*Math.cos(i*fi_step);
// create an empty site
    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    newElement.setAttribute("class","Circle");
    newElement.setAttribute("r","12");
    newElement.setAttribute("cx",x);
    newElement.setAttribute("cy",y);
    gsites.appendChild(newElement);
// place a hidden filling
    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    newElement.setAttribute("id","#"+i);
    newElement.setAttribute("class","Point_none");
    newElement.setAttribute("r","14");
    newElement.setAttribute("cx",x);
    newElement.setAttribute("cy",y);
    newElement.setAttribute("opacity","0");
    newElement.setAttribute("onclick","site_onclick('#"+i+"')");
    gsites.appendChild(newElement);
  }
  output_log_clear();
  output_log_msg("prepared "+SITE_CNT+" sites");
}


function output_log_clear() {
    document.getElementById("outlog").innerHTML = "<br><br><br><br><br><br><br><br>";
}

function output_log_msg(msg) {
    var old = document.getElementById("outlog").innerHTML;
    var str = old.substring(old.indexOf("<br>")+4);
    document.getElementById("outlog").innerHTML = str + "<br>" + msg;
}

function output_simtime(t) {
    document.getElementById("simtime").innerHTML = t.toFixed(3);
}

function output_current(c, std) {
    document.getElementById("current").innerHTML = c.toFixed(3) + " &#177; " + std.toFixed(3);
}

function output_particle(n) {
    document.getElementById("part_cnt").innerHTML = n;
}

function output_total(a) {
    document.getElementById("total").innerHTML = a;
}

function sim_stop()
{
    if (sim_in_progress)
    {
        sim_in_progress = false;
        clearInterval(Run);
        output_reset();
        output_log_msg("simulation stopped");
    }
}

function sim_init()
{
    if (sim_in_progress)
        return;
	prepare_particles();
    sim_time = 0;
    sim_in_progress = true;
    reset_current();
    // start the simulation
    sim_step(0, -1, 0, 0);
    output_log_msg("simulation initialized ("+ PARTICLE_CNT + " particles)");
}





