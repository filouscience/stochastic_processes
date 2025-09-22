const BOX_X = 996; // total 1000
const BOX_Y = 960; // total 1000
const OFFSET_X = 2;
const OFFSET_Y = 20;

var half_life;

function do_it() {
	n = parseInt(document.getElementById("PART_CNT").value);
    d = parseFloat(document.getElementById("DECAY_RATE").value);
    w = parseFloat(document.getElementById("TIME_WINDOW").value);
    if ( n < 0 || d < 0 || w <= 0 )
        return;
    set_half_life(d,w);
	predict(n,d,w);
    run_sim_a(n,d,w);
	run_sim_b(n,d,w);
}

function trajectory(points, colour) {
    var polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("points", points);
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", colour);
    document.getElementById("svg_element").appendChild(polyline);
}

function output_msg_a(msg) {
    document.getElementById("output-a").innerHTML = msg;
}

function output_msg_b(msg) {
    document.getElementById("output-b").innerHTML = msg;
}

function random_number() {
    // return a random number between 0 (inclusive) and 1 (exclusive)
    // uniform distribution
    // no random seed
    var r = Math.random();
    if (r == 1) {
        //alert("Math.random() returned 1!"); // should never happen
        return 0;
    }
    return r;
}

function transform_exp(r, w) {
    if (w == 0) {
        // zero rate --> never happen
        return Number.POSITIVE_INFINITY;
    }
    // exponential distribution
    // transformation method
    var t = -1 / w * Math.log(1 - r);
    return t;
}

function predict(PARTICLES_N, DECAY_RATE, TIME_WINDOW) {
	var simtime,
		particles_n;
	var points = "";
	
	for(itr=0; itr<=100; itr++) {
		simtime = TIME_WINDOW * itr / 100;
		particles_n = PARTICLES_N * Math.exp(-simtime*DECAY_RATE);
		var px = simtime * BOX_X / TIME_WINDOW + OFFSET_X;
		var py = BOX_Y - particles_n * BOX_Y / PARTICLES_N + OFFSET_Y;
		points = points + px + "," + py + " ";
	}
    document.getElementById("predict-polyline").setAttribute("points",points);
}

function set_half_life(DECAY_RATE, TIME_WINDOW) {
    if (DECAY_RATE != 0)
        half_life = Math.log(2)/DECAY_RATE;
    else
        half_life = Number.POSITIVE_INFINITY;
    document.getElementById("HALF_LIFE").value = half_life;
    if (half_life < TIME_WINDOW) {
        var xhl = (half_life * BOX_X / TIME_WINDOW + OFFSET_X);
        var points = xhl + ",2 " + xhl + ",998";
        document.getElementById("half-life-polyline").setAttribute("points",points);
    }
}


function run_sim_a(PARTICLES_N, DECAY_RATE, TIME_WINDOW) {

    var simtime,
        particles_n,
        points;

    simtime = 0;
    points = OFFSET_X + "," + (BOX_Y - (PARTICLES_N) * BOX_Y / (PARTICLES_N) + OFFSET_Y) + " ";

    for (particles_n = PARTICLES_N; particles_n > 0; particles_n--) {
        var diff = transform_exp(random_number(), particles_n * DECAY_RATE);

        simtime += diff;
        if (simtime > TIME_WINDOW)
            break;
        var px1 = simtime * BOX_X / TIME_WINDOW + OFFSET_X;
        var py1 = BOX_Y - (particles_n)   * BOX_Y / (PARTICLES_N) + OFFSET_Y;
        var py2 = BOX_Y - (particles_n-1) * BOX_Y / (PARTICLES_N) + OFFSET_Y;
        points = points + px1 + "," + py1 + " ";
        points = points + px1 + "," + py2 + " ";
    }
    points = points + (BOX_X + OFFSET_X) + "," + (BOX_Y - (particles_n) * BOX_Y / (PARTICLES_N) + OFFSET_Y) + " ";
    trajectory(points, "blue");
    output_msg_a(particles_n + " out of " + PARTICLES_N + " particles with decay rate " + DECAY_RATE + " s<sup>-1</sup> left after " + (simtime>TIME_WINDOW ? TIME_WINDOW : simtime.toFixed(3)) + " s. (ensemble sim.)");
}

function run_sim_b(PARTICLES_N, DECAY_RATE, TIME_WINDOW) {
	
	var events = new Array(PARTICLES_N);
	var simtime,
		particles_n,
		points;
		
	for (particles_n = 0; particles_n < PARTICLES_N; particles_n++) {
        events[particles_n] = transform_exp(random_number(), DECAY_RATE);
	}
		
	events.sort();
	events.reverse();
	
	simtime = 0;
    points = OFFSET_X + "," + (BOX_Y - (PARTICLES_N) * BOX_Y / (PARTICLES_N) + OFFSET_Y) + " ";
	
	for (particles_n = PARTICLES_N; particles_n > 0; particles_n--) {
        simtime = events[particles_n-1];
        if (simtime > TIME_WINDOW)
            break;
        var px1 = simtime * BOX_X / TIME_WINDOW + OFFSET_X;
        var py1 = BOX_Y - (particles_n)   * BOX_Y / (PARTICLES_N) + OFFSET_Y;
        var py2 = BOX_Y - (particles_n-1) * BOX_Y / (PARTICLES_N) + OFFSET_Y;
        points = points + px1 + "," + py1 + " ";
        points = points + px1 + "," + py2 + " ";
    }
    points = points + (BOX_X + OFFSET_X) + "," + (BOX_Y - (particles_n) * BOX_Y / (PARTICLES_N) + OFFSET_Y) + " ";
    trajectory(points, "black");
    output_msg_b(particles_n + " out of " + PARTICLES_N + " particles with decay rate " + DECAY_RATE + " s<sup>-1</sup> left after " + (simtime>TIME_WINDOW ? TIME_WINDOW : simtime.toFixed(3)) + " s. (individual sim.)");
}
