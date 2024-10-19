import "./style.css";

// Variables
interface Point {
    x: number, y: number
}

function Point (x: number, y: number) : Point {
    return { x: x, y: y}
}

let userPoints: Point[] = []
const drawingChanged: Event = new Event("drawing-changed");

const lineWidth: number = 3;
const lineColor: string = "black";

let isDrawing: boolean = false;
let mousePos: Point = {x: 0, y: 0}

// APP TITLES
const APP_NAME = "CMPM 121 Demo 2";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

const title = document.createElement("h1");
title.textContent = "[APP_TITLE]"
app.append(title);

// CANVAS
const canvas: HTMLCanvasElement = document.createElement("canvas") as HTMLCanvasElement;
canvas.width = 256;
canvas.height = 256;
app.append(canvas);

// Clear
const clear: HTMLButtonElement = document.createElement("button");
clear.innerHTML = "Clear";
app.append(clear);

clear.addEventListener("click", () => {
    clearCanvas();
})

// Debug
const debug: HTMLButtonElement = document.createElement("button");
debug.innerHTML = "DEBUG";
app.append(debug);

debug.addEventListener("click", () => {
    clearCanvas();
    drawPoints();
});

// Draw on Canvas
const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;

function startLine(point: Point){
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.moveTo(point.x, point.y);
}

function nextLinePoint(point: Point){
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
}

function endLine(){
    ctx.closePath();
}

canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    addPoint(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;
    addPoint(e.offsetX, e.offsetY);
});

window.addEventListener("mouseup", () => {
    userPoints.push(Point(-1, -1));
    isDrawing = false;
});

window.addEventListener("drawing-changed", () => {
    clearCanvas();
    drawPoints();
});

function addPoint(x: number, y: number) {
    userPoints.push(Point(x, y));
    dispatchEvent(drawingChanged);
}

function drawPoints() : void {
    let newLine : boolean = true;
    userPoints.forEach(point => {
        if (point.x < 0) {
            endLine();
            newLine = true;
        }
        else if (newLine) {
            startLine(point);
            newLine = false;
        }
        else {
            nextLinePoint(point);
        }
    });
}

function clearCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}