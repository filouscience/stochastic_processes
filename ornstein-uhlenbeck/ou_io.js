var DEFAULT_CNT,
	ITER;

var initialized = false;
var target_cnt = DEFAULT_CNT;
var timer = null;

function get_float_val(name) {
    return parseFloat(document.getElementById(name).value);
}
function get_int_val(name) {
    return parseInt(document.getElementById(name).value);
}

function plot_teor(type, points) {
    document.getElementById("Teor_" + type).setAttribute("points", points);
}

function plot_trajectory(points) {
    document.getElementById("Trajectory").setAttribute("points", points);
}

function report_count() {
    document.getElementById("count").innerHTML = cnt;
}


function init() {
    pause();
    initialized = true;
    NUM_TSTEPS = get_int_val("NUM_STEPS");
    HIST_RES = get_int_val("HIST_RES");
    DEFAULT_CNT = get_int_val("DEF_CNT");
    AREA = get_float_val("AREA");
    START_X = get_float_val("START_POS");
    TIME_WIND = get_float_val("TIME_WIND");
    GAMMA = get_float_val("GAMMA");
    PARAM_C = get_float_val("PARAM_C");
    CELL_WIDTH = HIST_WIDTH / HIST_RES;
    NORMALIZE = Math.sqrt(2 * Math.PI * PARAM_C / (2 * GAMMA) * (1 - Math.exp(-2 * GAMMA * TIME_WIND / HIST_CNT))); // normalization relative to peak value of teor in first histogram
    HIST_CELL_NORM = HIST_HEIGHT * HIST_RES / AREA * NORMALIZE;
    compute_mn();

    plot_trajectory("");
    generate_teor();

    target_cnt = DEFAULT_CNT;
    cnt = 0;
    report_count();
    hi_val = 0;
    Histogram.reset();
    Histogram.prep_cells();

}

function do_it() {
    generate_trajectory();
    cnt++;
}

function do_once() {
    if (!initialized || timer != null)
        return;
    do_it();
    report_count();
    Histogram.update_cells();
}

function do_many() {
    ITER = get_int_val("ITER");
    for (var i = 0; i < ITER; i++)
        do_it();
    report_count();
    Histogram.update_cells();
    if (cnt > target_cnt) {
        pause();
    }
}

function do_more() {
    if (!initialized || timer != null)
        return;
    NUM_TSTEPS = get_int_val("NUM_STEPS");
    compute_mn();
    DEFAULT_CNT = get_int_val("DEF_CNT");
    if (cnt > target_cnt)
        target_cnt += DEFAULT_CNT;
    timer = window.setInterval(do_many, 1);
}

function pause() {
    window.clearInterval(timer);
    timer = null;
}

