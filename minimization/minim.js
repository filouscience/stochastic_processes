
var TerrainZ = function (x, y) {
    return 0;
};

var MAX_YELLOW = 1;
var MAX_RED = 4;

var CVS_LEFT = -20;
var CVS_RIGHT = 20;
var CVS_BOTTOM = -20;
var CVS_TOP = 20;

var CVS_WIDTH;
var CVS_HEIGHT;

var BEGIN_X;
var BEGIN_Y;
var PARAM_T;
var STEP_LENGTH;

/* stuff */
function RandomNumber(min, max) {
    if (min > max)
        return min;
    /* Math.random() generates a value between 0 and 1 */
    var r = Math.random() * (max - min) + min;
    return r;
}

function IsGoodStep(oldz, newz) {

    if (oldz > newz)
        return true;
    /* is bad step good enough? */
    if (!(PARAM_T > 0))
        return false;
    var probability = Math.exp((oldz - newz) / PARAM_T);
    var roll = RandomNumber(0, 1);
    return (roll < probability);
}

/* coord transformation */
function GetCX(x) {
    return Math.floor((x - CVS_LEFT) / (CVS_RIGHT - CVS_LEFT) * CVS_WIDTH);
}

function GetCY(y) {
    return Math.floor((-y - CVS_BOTTOM) / (CVS_TOP - CVS_BOTTOM) * CVS_HEIGHT);
}

/* visualization */
function GetColour(z) {
    var col = "RGB(0,0,0)";
    if (z >= MAX_RED) {
        col = "RGB(0,0,255)";
    } else if (z <= MAX_YELLOW) {
        col = "RGB(255," + Math.floor((1 - ((z % MAX_YELLOW) / MAX_YELLOW)) * 255) + ",0)";
    } else {
        col = "RGB(" + Math.floor((1 - (((z - MAX_YELLOW) % (MAX_RED - MAX_YELLOW)) / (MAX_RED - MAX_YELLOW))) * 255)
        + ",0," + Math.floor((((z - MAX_YELLOW) % (MAX_RED - MAX_YELLOW)) / (MAX_RED - MAX_YELLOW)) * 255) + ")";
    }
    return col;
}
function ShowPoint(x, y, z, ctx) {
    ctx.fillStyle = GetColour(z);
    ctx.fillRect(GetCX(x), GetCY(y), 1, 1);
}

function HilightPoint(x, y, ctx) {
    ctx.fillStyle = "RGB(20,255,20)";
    ctx.fillRect(GetCX(x)-3, GetCY(y)-3, 7, 7);
}

function InitCanvas() {
    canvas = document.getElementById('myCanvas');
    CVS_WIDTH = canvas.getAttribute("width");
    CVS_HEIGHT = canvas.getAttribute("height");
    PrepareCanvas();
}

function PrepareCanvas() {
    canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CVS_WIDTH, CVS_HEIGHT);

    ctx.fillStyle = "RGB(20,20,20)";
    ctx.moveTo(GetCX(CVS_LEFT), GetCY(0));
    ctx.lineTo(GetCX(CVS_RIGHT), GetCY(0));
    ctx.moveTo(GetCX(0), GetCY(CVS_TOP));
    ctx.lineTo(GetCX(0), GetCY(CVS_BOTTOM));
    ctx.stroke();
}

/* I/O helpers */
function Report(x, y, z, loop_cnt, step_cnt) {
    document.getElementById("out_cnt").innerHTML = loop_cnt;
    document.getElementById("out_x").innerHTML = Math.floor(1000 * x) / 1000;
    document.getElementById("out_y").innerHTML = Math.floor(1000 * y) / 1000;
    document.getElementById("out_z").innerHTML = Math.floor(1000000 * z) / 1000000;
    document.getElementById("out_pct").innerHTML = Math.floor((1 - step_cnt / loop_cnt) * 10000) / 100;
}

function SetMaze(type) {
    switch (type) {
        case 1:
            /* prohnute plato na vajicka */
            TerrainZ = function (x, y) {
                var z = 1.3 * (Math.sin(x * Math.PI / 4) * Math.sin(y * Math.PI / 4) + 0.005 * ((x + 10) * (x + 10) + (y + 6) * (y + 6)) + 1);
                return z;
            };
            break;
        case 2:
            /* dira */
            TerrainZ = function (x, y) {
                var z = 0.05 * (((Math.abs(x) + 1) * (Math.abs(y) + 1)) * (1 - Math.exp(-10 * (x * x + y * y))));
                return z;
            };
            break;
        case 3:
            /* Maze */
            TerrainZ = function (x, y) {
                var z = 0.1 * x + (0.002 * y * y) + 1;
                if (
                    (x > 11 && x < 12 && (y > 3 || y < 2)) ||
                    (x > 9 && x < 10 && (y > -5 || y < -6)) ||
                    (x > 7 && x < 8 && (y > 12 || y < 11)) ||
                    (x > 5 && x < 6 && (y > 4 || y < 3)) ||
                    (x > 3 && x < 4 && (y > -11 || y < -12)) ||
                    (x > -1 && x < 2 && (y > 9 || y < 8)) ||
                    (x > -3 && x < -2 && (y > -6 || y < -7)) ||
                    (x > -5 && x < -4 && (y > 11 || y < 10)) ||
                    (x > -7 && x < -6 && (y > -1 || y < -2)) ||
                    (x > 18 || y < -15 || y > 15)
                    )
                    z = 50;
                if (x < -11)
                    z = -x + 100;
                return z;
            };
            break;
        case 0:
        default:
            /* Rosenbrock valley function */
            TerrainZ = function (x, y) {
                var z = 1.1 * ((y + 9) - (x / 2.5) * (x / 2.5)) * ((y + 9) - (x / 2.5) * (x / 2.5)) + 0.025 * (x + 5) * (x + 5);
                return z;
            };
            break;
    }
}

/* core */
var m_x;
var m_y;

var loop_cnt;
var step_cnt;

var is_found;

function DoIt() {
    document.getElementById("out_stat").innerHTML = "progress:";

    SetMaze(parseInt(document.getElementById("maze").value));
    BEGIN_X = parseFloat(document.getElementById("beg_x").value);
    BEGIN_Y = parseFloat(document.getElementById("beg_y").value);
    PARAM_T = parseFloat(document.getElementById("param_t").value);
    STEP_LENGTH = parseFloat(document.getElementById("step_l").value);

    m_x = BEGIN_X;
    m_y = BEGIN_Y;

    loop_cnt = 0;
    step_cnt = 0;
    bad_cnt = 0;

    is_found = false;

    PrepareCanvas();

    WorkHard();
}

function WorkHard() {
    if (is_found) {
        return;
    }
    var canvas = document.getElementById('myCanvas');
    var ctx = canvas.getContext('2d');
    var z;

    for (var i = 0; i < 100; i++) {
        var rand = RandomNumber(0, 2*Math.PI);
        var x = m_x + Math.cos(rand) * STEP_LENGTH;
        var y = m_y + Math.sin(rand) * STEP_LENGTH;

        loop_cnt++;

        if (!IsGoodStep(TerrainZ(m_x, m_y), TerrainZ(x, y))) {
            continue;
        }

        m_x = x;
        m_y = y;
        step_cnt++;
        z = TerrainZ(m_x, m_y);
        ShowPoint(m_x, m_y, z, ctx);

        if (z < 0.0001) {
            is_found = true;
            break;
        }
    }

    Report(m_x, m_y, z, loop_cnt, step_cnt);

    if (is_found) {
        document.getElementById("out_stat").innerHTML = "minimum found:";
        HilightPoint(m_x, m_y, ctx);
        HilightPoint(BEGIN_X, BEGIN_Y, ctx);
        //alert("completed");
    } else {
        window.setTimeout(WorkHard, 1);
    }
}


function logslide_t() {
    var pos = document.getElementById("param_slide").value;


    var minv = Math.log(1);
    var maxv = Math.log(2);
    var scale = (maxv - minv) / 100;

    var val = Math.exp(minv + scale * pos) - 1
    PARAM_T = val;
    document.getElementById("param_t").innerHTML = Math.floor(100 * val) / 100;
    document.getElementById("param_t").value = val;

}
function logslide_l() {
    var pos = document.getElementById("step_slide").value;

    var minv = Math.log(1);
    var maxv = Math.log(11);
    var scale = (maxv - minv) / 100;

    var val = Math.exp(minv + scale * pos) - 1
    STEP_LENGTH = val;
    document.getElementById("step_l").innerHTML = Math.floor(100 * val) / 100;
    document.getElementById("step_l").value = val;

}

function InitAll() {
    InitCanvas();
    logslide_t();
    logslide_l();
}