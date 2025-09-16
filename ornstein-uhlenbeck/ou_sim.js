var NUM_TSTEPS,
	START_X,
    AREA,
    TIME_WIND,
    GAMMA,
    PARAM_C, // sigma^2
    PARAM_L,
    PARAM_M,
    PARAM_N,
    //PARAM_D,
    DT,
    NORMALIZE;
const SIZE_X = 1000;
const SIZE_Y = 500;

function compute_mn() {
    DT = TIME_WIND / NUM_TSTEPS;
    PARAM_L = Math.sqrt(PARAM_C * DT);
    PARAM_M = Math.exp(-GAMMA * DT);
    PARAM_N = Math.sqrt(PARAM_C / (2 * GAMMA) * (1 - Math.exp(-2 * GAMMA * DT))); // std = sqrt(var)
}

function random_number() {
    // return a random number between 0 (inclusive) and 1 (exclusive)
    // uniform distribution (?)
    // no random seed
    var r = Math.random();
    if (r == 1) {
        //alert("Math.random() returned 1!"); // should never happen
        return 0;
    }
    return r;
}

var Box_Muller = new Object;
Box_Muller.b = false;
Box_Muller.s = new Number(0);
Box_Muller.t = new Number(0);
Box_Muller.N = function () {
    if (this.b) {
        this.b = false;
        return (this.s * Math.sin(this.t));
    } else {
        this.s = Math.sqrt(-2 * Math.log(1 - random_number()));
        this.t = 2 * Math.PI * random_number();
        this.b = true;
        return (this.s * Math.cos(this.t));
    }
}

function generate_teor() {
    var xp = START_X;
    var xz = START_X;
    var xm = START_X;
    var ptsp = "0," + (-xp * SIZE_Y / AREA + SIZE_Y / 2).toFixed(2) + " ";
    var ptsz = "0," + (-xz * SIZE_Y / AREA + SIZE_Y / 2).toFixed(2) + " ";
    var ptsm = "0," + (-xm * SIZE_Y / AREA + SIZE_Y / 2).toFixed(2) + " ";
    var tstep = TIME_WIND/100;
    for (var time = tstep; time < TIME_WIND; time += tstep) {
        xp = START_X * Math.exp(-GAMMA * time) + Math.sqrt(PARAM_C / (2 * GAMMA) * (1 - Math.exp(-2 * GAMMA * time)));
        xz = START_X * Math.exp(-GAMMA * time);
        xm = START_X * Math.exp(-GAMMA * time) - Math.sqrt(PARAM_C / (2 * GAMMA) * (1 - Math.exp(-2 * GAMMA * time)));
        var t = (time * SIZE_X / TIME_WIND).toFixed(2);
        ptsp = ptsp + t + "," + (-xp * SIZE_Y / AREA + SIZE_Y / 2).toFixed(2) + " ";
        ptsz = ptsz + t + "," + (-xz * SIZE_Y / AREA + SIZE_Y / 2).toFixed(2) + " ";
        ptsm = ptsm + t + "," + (-xm * SIZE_Y / AREA + SIZE_Y / 2).toFixed(2) + " ";
    }

    plot_teor("plus", ptsp);
    plot_teor("zero", ptsz);
    plot_teor("minus", ptsm);

    // stationary state probability density
    // theoretical values for histograms
    var ptslim = "";
    var normlim = Math.sqrt(2 * Math.PI * PARAM_C / (2 * GAMMA)) / NORMALIZE;
    var ptst = new Array();
    var normt = new Array();
    for (var n = 0; n < HIST_CNT; n++) {
        ptst[n] = "";
        normt[n] = Math.sqrt(2 * Math.PI * PARAM_C / (2 * GAMMA) * (1 - Math.exp(-2 * GAMMA * (n + 1) * TIME_WIND / HIST_CNT))) / NORMALIZE;
    }
    var stp = AREA / HIST_RES;
    var xtop = AREA * (HIST_RES - 1) / HIST_RES / 2;
    for (var x = -xtop; x <= xtop; x += stp) {
        var xpos = x * HIST_WIDTH / AREA + HIST_WIDTH / 2 + 1;
        // theoretical at LIMIT T ---> inf
        var ylim = Math.exp(-(x * x) / (2 * PARAM_C / (2 * GAMMA))) / normlim;
        ptslim = ptslim + xpos.toFixed(2) + "," + (-ylim * HIST_HEIGHT + HIST_HEIGHT + 2).toFixed(2) + " ";
        // theoretical at T == (n * TIME_WIND / HIST_CNT)
        for (var n = 0; n < HIST_CNT; n++) {
            var y = Math.exp(-((x + START_X * Math.exp(-GAMMA * (n + 1) * TIME_WIND / HIST_CNT)) * (x + START_X * Math.exp(-GAMMA * (n + 1) * TIME_WIND / HIST_CNT))) / (2 * PARAM_C / (2 * GAMMA) * (1 - Math.exp(-2 * GAMMA * (n + 1) * TIME_WIND / HIST_CNT)))) / normt[n];
            ptst[n] = ptst[n] + xpos.toFixed(2) + "," + (-y * HIST_HEIGHT + HIST_HEIGHT + 2).toFixed(2) + " ";
        }

    }
    plot_teor("lim", ptslim);
    for (var n = 0; n < HIST_CNT; n++) {
        plot_teor("t" + n, ptst[n]);
    }
}

function generate_trajectory(compare) {
    var n = 0;
    var x = START_X;
    var x1 = START_X;
    var pts = "0," + (-x * SIZE_Y / AREA + SIZE_Y / 2).toFixed(2) + " ";
    var pts1 = "0," + (-x * SIZE_Y / AREA + SIZE_Y / 2).toFixed(2) + " ";
    for (var time = DT; time <= TIME_WIND; time += DT) {

        var rnd = Box_Muller.N(/*0,1*/);
        x = x - GAMMA * x * DT + PARAM_L * rnd;

        var t = (time * SIZE_X / TIME_WIND).toFixed(2);
        pts = pts + t + "," + (-x * SIZE_Y / AREA + SIZE_Y / 2).toFixed(2) + " ";

        if (compare) {
            x1 = x1 * PARAM_M + PARAM_N * rnd;
            pts1 = pts1 + t + "," + (-x1 * SIZE_Y / AREA + SIZE_Y / 2).toFixed(2) + " ";
        }

        // collect histogram data
        if ((time >= TIME_WIND / 5 && n == 0) ||
            (time >= 2 * TIME_WIND / 5 && n == 1) ||
            (time >= 3 * TIME_WIND / 5 && n == 2) ||
            (time >= 4 * TIME_WIND / 5 && n == 3)) {
            Histogram.add(n, x);
            n++;
        }
    }
    Histogram.add(n, x);
    plot_trajectory(pts);
    if (compare)
        plot_trajectory_comp(pts1);
}

