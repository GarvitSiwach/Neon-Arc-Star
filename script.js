const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let stars = [];
let score = 0;
let ball = { x: 0, y: 0, t: 0, active: false, path: [] };
let gameWon = false;

const scope = {
    R: 5,
    π: Math.PI,
    pi: Math.PI,
    ϕ: Math.PI / 4,
    phi: (1 + Math.sqrt(5)) / 2,
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan
};

function generateStars(count) {
    stars = [];
    score = 0;
    document.getElementById("score").textContent = score;
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * 750 + 25,
            y: Math.random() * 450 + 25,
            collected: false
        });
    }
}

function randomizeStars() {
    let count = parseInt(document.getElementById("starCount").value) || 5;
    generateStars(count);
    gameWon = false;
}

function generatePath(eq) {
    let path = [];
    let compiled;
    try {
        compiled = math.compile(eq);
    } catch (err) {
        return [];
    }
    for (let x = 0; x <= 20; x += 0.1) {
        try {
            let y = compiled.evaluate({ x, ...scope });
            path.push({ x: x * 40, y: canvas.height - (y * 40) });
        } catch {
            return [];
        }
    }
    return path;
}

function updatePathFromInput() {
    const eq = document.getElementById("equation").value;
    ball.path = generatePath(eq);
}

function launchBall() {
    if (gameWon) return;
    ball.t = 0;
    ball.active = true;
}

function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = "cyan";
    ctx.shadowColor = "cyan";
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawStars() {
    stars.forEach(s => {
        if (!s.collected) {
            drawStar(s.x, s.y, 5, 10, 5);
        }
    });
}

function drawPath() {
    if (ball.path.length > 0) {
        ctx.strokeStyle = "rgba(255,0,255,0.6)";
        ctx.shadowColor = "magenta";
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ball.path[0].x, ball.path[0].y);
        for (let i = 1; i < ball.path.length; i++) {
            ctx.lineTo(ball.path[i].x, ball.path[i].y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

function drawBall() {
    if (!ball.active || ball.path.length === 0) return;
    if (ball.t >= ball.path.length) {
        ball.active = false;
        return;
    }
    let pos = ball.path[ball.t];
    ball.x = pos.x;
    ball.y = pos.y;
    ctx.fillStyle = "#ff0";
    ctx.shadowColor = "#ff0";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    stars.forEach(s => {
        let dx = s.x - ball.x;
        let dy = s.y - ball.y;
        if (!s.collected && Math.sqrt(dx * dx + dy * dy) < 12) {
            s.collected = true;
            score++;
            document.getElementById("score").textContent = score;
            if (score === stars.length && !gameWon) {
                gameWon = true;
                setTimeout(() => {
                    alert("🎉 You Win! All stars collected!");
                }, 100);
            }
        }
    });

    ball.t++;
}

function drawBackground() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function gameLoop() {
    drawBackground();
    drawStars();
    drawPath();
    drawBall();
    requestAnimationFrame(gameLoop);
}

document.getElementById("equation").addEventListener("input", updatePathFromInput);
document.getElementById("starCount").addEventListener("change", randomizeStars);

randomizeStars();
updatePathFromInput();
gameLoop();
