import "./style.css";

// Variables
interface Point {
    x: number, y: number
}

function Point (x: number, y: number) : Point {
    return { x: x, y: y}
}

let displayActions: Point[] = []
let redoStack: Point[] = []
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
const clearButton: HTMLButtonElement = document.createElement("button");
clearButton.innerHTML = "Clear";
app.append(clearButton);

clearButton.addEventListener("click", () => {
    clear();
})

// Undo
const undoButton: HTMLButtonElement = document.createElement("button");
undoButton.innerHTML = "Undo";
app.append(undoButton);

undoButton.addEventListener("click", () => {
    undo();
});

// Redo
const redoButton: HTMLButtonElement = document.createElement("button");
redoButton.innerHTML = "Redo";
app.append(redoButton);

redoButton.addEventListener("click", () => {
    redo();
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
    if (displayActions.length > 0 && (displayActions.at(-1) as Point).x >= 0) {
        addPoint(-1, -1);
    }
    addPoint(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;
    addPoint(e.offsetX, e.offsetY);
});

window.addEventListener("mouseup", () => {
    if (!isDrawing) return;
    addPoint(-1, -1);
    isDrawing = false;
});

window.addEventListener("drawing-changed", () => {
    clearCanvas();
    drawPoints();
});

function addPoint(x: number, y: number) {
    displayActions.push(Point(x, y));
    redoStack = [];
    dispatchEvent(drawingChanged);
}

function drawPoints() : void {
    let newLine : boolean = true;
    displayActions.forEach(point => {
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

function clear() {
    clearCanvas();
    while (displayActions.length > 0) {
        redoStack.push(displayActions.pop() as Point);
    }
}

function clearCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function undo() {
    if (displayActions.length < 1) return;
    redoStack.push(displayActions.pop() as Point);
    dispatchEvent(drawingChanged);

    if ((redoStack.at(-1) as Point).x < 0) {
        undo();
    }
}

function redo() {
    if (redoStack.length < 1) return;
    displayActions.push(redoStack.pop() as Point);
    dispatchEvent(drawingChanged);
    
    if ((displayActions.at(-1) as Point).x < 0) {
        redo();
    }
}