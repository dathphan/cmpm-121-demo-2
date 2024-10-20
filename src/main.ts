import "./style.css";

// Variables
interface Point {
    x: number, y: number
}

class Line{
    points: Point[] = []

    constructor(point: Point) {
        this.points = [point]
    }

    push(point: Point) {
        this.points.push(point);
        dispatchEvent(drawingChanged);
    }

    display(ctx: CanvasRenderingContext2D) {
        if (this.points.length < 1) return;

        this.start(ctx, this.points.at(0) as Point);
        this.points.forEach(point => {
            this.continue(ctx, point);
        });
    }

    start(ctx: CanvasRenderingContext2D, point: Point){
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
        ctx.moveTo(point.x, point.y);
    }

    continue(ctx: CanvasRenderingContext2D, point: Point){
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    }

    end(ctx: CanvasRenderingContext2D) {
        ctx.closePath()
    }
}

function Point (x: number, y: number) : Point {
    return { x: x, y: y}
}

let displayActions: Line[] = []
let redoActions: Line[] = []
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
    clear(context);
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
const context: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    displayActions.push(new Line(Point(e.offsetX, e.offsetY)))
    redoActions = [];
});

canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;
    displayActions.at(-1)?.push(Point(e.offsetX, e.offsetY));
});

window.addEventListener("mouseup", () => {
    if (!isDrawing) return;
    isDrawing = false;
});

window.addEventListener("drawing-changed", () => {
    clearCanvas(context);
    drawCanvas(context);
});

function drawCanvas(ctx: CanvasRenderingContext2D) {
    displayActions.forEach(actions => {
        actions.display(ctx);
    });
}

function clear(ctx: CanvasRenderingContext2D) {
    clearCanvas(ctx);
    displayActions = [];
    redoActions = [];
}

function clearCanvas(ctx: CanvasRenderingContext2D){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function undo() {
    if (displayActions.length < 1) return;
    redoActions.push(displayActions.pop() as Line);
    dispatchEvent(drawingChanged);
}

function redo() {
    if (redoActions.length < 1) return;
    displayActions.push(redoActions.pop() as Line);
    dispatchEvent(drawingChanged);
}