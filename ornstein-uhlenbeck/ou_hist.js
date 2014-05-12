const HIST_CNT = 5;
var HIST_RES;
var TIME_POW;

const HIST_WIDTH = 148;
const HIST_HEIGHT = 96;
var CELL_WIDTH;
var HIST_CELL_NORM;
var cnt;
var hi_val = 0;

var Histogram = new Array();
for (var n = 0; n < HIST_CNT; n++)
    Histogram[n] = new Array();

var hist_lim_data = new Array();
for (var n = 0; n < HIST_CNT; n++)
    hist_lim_data[n] = new Array();

Histogram.reset = function () {
    for (var n = 0; n < HIST_CNT; n++) {
        for (var i = 0; i < HIST_RES; i++) {
            this[n][i] = 0;
        }
    }
}

Histogram.add = function (n, x) {
    var i = Math.floor((-x + AREA / 2) / AREA * HIST_RES);
    if (i < 0 || i >= HIST_RES)
        return;
    if (++this[n][i] > hi_val)
        hi_val = this[n][i];
}

Histogram.prep_cells = function () {
    for (var n = 0; n <= HIST_CNT; n++) {
        var mhist = document.getElementById("hist" + n);
        while (mhist.firstChild) {
            mhist.removeChild(mhist.firstChild);
        }
        for (var i = 0; i < HIST_RES; i++) {
            var cell = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            cell.setAttribute("id", n + "." + i);
            cell.setAttribute("class", "Cell");
            cell.setAttribute("x", (1 + i * CELL_WIDTH).toFixed(2));
            cell.setAttribute("y", HIST_HEIGHT + 2)
            cell.setAttribute("width", CELL_WIDTH.toFixed(2));
            cell.setAttribute("height", 0);
            mhist.appendChild(cell);
        }
    }
}

// update all cells for all histograms
// and extrapolation for limit TIME ---> inf in the last histogram
Histogram.update_cells = function () {
    TIME_POW = get_float_val("TIME_POW");
    if (isNaN(TIME_POW) || TIME_POW <= 0) { TIME_POW = 1; }
    for (var n = 0; n < HIST_CNT; n++) {
        //hist_lim_data_x[n] = 1 / ((n + 1) * TIME_WIND / HIST_CNT) / ((n + 1) * TIME_WIND / HIST_CNT);
        hist_lim_data[n][0] = 1 / Math.exp(TIME_POW * Math.log(n + 1) * TIME_WIND / HIST_CNT);
    }
    for (var i = 0; i < HIST_RES; i++) {
        for (var n = 0; n < HIST_CNT; n++) {
            var cell = document.getElementById(n + "." + i);
            //var h = Histogram[n][i] * HIST_HEIGHT / hi_val;
            var h = Histogram[n][i] * HIST_CELL_NORM / cnt;
            cell.setAttribute("y", (HIST_HEIGHT - h + 2).toFixed(2));
            cell.setAttribute("height", h.toFixed(2));
            hist_lim_data[n][1] = h;
        }
        var cell_lim = document.getElementById(HIST_CNT + "." + i);
        var h_lim = Lagrange(0, hist_lim_data, HIST_CNT);
        cell_lim.setAttribute("y", (HIST_HEIGHT - h_lim + 2).toFixed(2));
        cell_lim.setAttribute("height", (h_lim > 0 ? h_lim : 0).toFixed(2));

        // inspect Lagrange extrapolation
        var INSPECT = get_int_val("INSPECT");
        if (i == INSPECT) {
            var x0 = 1.2 * hist_lim_data[0][0];
            var x1 = -0.2 * hist_lim_data[0][0];

            var tl = document.getElementById("t0");
            tl.setAttribute("x1", (HIST_WIDTH / 7).toFixed(2));
            tl.setAttribute("x2", (HIST_WIDTH / 7).toFixed(2));
            for (var n = 0; n < HIST_CNT; n++) {
                var tl = document.getElementById("t" + (n+1));
                tl.setAttribute("x1", (hist_lim_data[n][0] * HIST_WIDTH / (x0 - x1) + HIST_WIDTH / 7).toFixed(2));
                tl.setAttribute("x2", (hist_lim_data[n][0] * HIST_WIDTH / (x0 - x1) + HIST_WIDTH / 7).toFixed(2));
            }
            var ptsex = "";
            var stp = (x0 - x1) / HIST_RES;
            for (var x = x1; x <= x0; x += stp) {
                var xpos = x * HIST_WIDTH / (x0 - x1) + HIST_WIDTH / 7;
                var ypos = Lagrange(x, hist_lim_data, HIST_CNT);
                ptsex = ptsex + xpos.toFixed(2) + "," + (-ypos + HIST_HEIGHT + 2).toFixed(2) + " ";
            }
            plot_teor("extra", ptsex);
        }
    }
}

/*
 * Lagrange polynomial interpolation
 * interpolate k values of xy
 * return interpolation polynomial value in x
 */
function Lagrange(/*double*/ x, /*const double*/ xy/*[][2]*/, /*int*/ k)
{
    var sum = 0;
    var f;

    for (var i = 0; i < k; i++)
    {
        f = 1;
        for (var j = 0; j < k; j++)
        {
            if (i == j) continue;
            f = f * (x-xy[j][0])/(xy[i][0]-xy[j][0]);
        }
        sum += f * xy[i][1];
    }
    return sum;
}
