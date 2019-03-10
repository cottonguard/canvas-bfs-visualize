const canvas = document.getElementById('app');
const ctx = canvas.getContext('2d');

let env = {
    width: canvas.width,
    height: canvas.height,
    tileSize: 16 
};

let boardProps = {
    data: null,
    m: Math.floor(canvas.height / env.tileSize),
    n: Math.floor(canvas.width / env.tileSize),
};
let board = boardProps.data;

board = [];
for (let i = 0; i < boardProps.m; ++i) {
    board.push(new Array(boardProps.n).fill(Object.create({ type: "empty" })));
}
for (let i = 0; i < 500; ++i) {
    let x = Math.floor(boardProps.n * Math.random());
    let y = Math.floor(boardProps.m * Math.random());
    board[y][x] = { type: "wall" };
}
board[0][0] = { type: "visited", color: "#0f0", text: "0" };

let state = {
    q: [{ x: 0, y: 0, step: 0 }],
    step: 0
};

const updateState = () => {
    let nextQ = [];
    for ({ x, y, step } of state.q) {
        state.step = step;

        let vx = 1, vy = 0;
        for (let i = 0; i < 4; ++i) {
            let tx = x + vx, ty = y + vy;
            if (0 <= tx && tx < boardProps.n && 0 <= ty && ty < boardProps.m
                && board[ty][tx].type == "empty") {
                let nextStep = step + 1;
                board[ty][tx] = {
                    type: "visited",
                    color: `hsl(${(180+3*step)%360},90%,70%)`,
                    text: nextStep.toString()
                };
                nextQ.push({ x: tx, y: ty, step: nextStep });
            }
            let t = vx; vx = -vy; vy = t;
        }
        pStep = step;
    }
    state.q = nextQ;
};

let visibleText = true;

const drawTile = (x, y, t) => {
    let sx = x * env.tileSize, sy = y * env.tileSize;
    switch (t.type) {
        case "wall":
        ctx.fillStyle = "#000";
        ctx.fillRect(sx, sy, env.tileSize, env.tileSize);
        break;

        case "visited":
        ctx.fillStyle = t.color;
        ctx.fillRect(sx, sy, env.tileSize, env.tileSize);
        if (visibleText) {
            ctx.fillStyle = "#000";
            ctx.fillText(t.text, sx, sy + env.tileSize);
        }
    }
};

const drawBoard = () => {
    for (let y = 0; y < boardProps.m; ++y) {
        for (let x = 0; x < boardProps.n; ++x) {
            drawTile(x, y, board[y][x]);
        }
    }
};

let gridPath = new Path2D();
for (let x = 0; x < env.width; x += env.tileSize) {
    gridPath.moveTo(x, 0);
    gridPath.lineTo(x, env.height);
}
for (let y = 0; y < env.height; y += env.tileSize) {
    gridPath.moveTo(0, y);
    gridPath.lineTo(env.width, y);
}

let visibleGrid = true;
const drawGrid = () => {
    if (visibleGrid) {
        ctx.strokeStyle = "#888";
        ctx.stroke(gridPath);
    }
};

const clear = () => {
    ctx.clearRect(0, 0, env.width, env.height);
};

let layers = [
    clear,
    drawBoard,
    drawGrid,
];

const draw = () => {
    for (let l of layers) {
        l();
    }
}

const update = () => {
    updateState();
    draw();
    writeMessage();
};

const messageElem = document.querySelector(".message");
const writeMessage = () => {
    messageElem.textContent = `step: ${state.step}\n`;
};

draw();
writeMessage();

document.querySelector(".update").addEventListener("click", () => update());
document.querySelector(".text").addEventListener("click", () => {
    visibleText = !visibleText;
    draw();
});
document.querySelector(".grid").addEventListener("click", () => {
    visibleGrid = !visibleGrid;
    draw();
});