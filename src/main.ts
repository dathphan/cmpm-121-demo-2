import "./style.css";

// Variables
interface Point {
    x: number, y: number
}

interface Command {
    display(ctx: CanvasRenderingContext2D);
}

class Line implements Command {
    points: Point[] = []
    width: number

    constructor(point: Point, width: number) {
        this.points = [point]
        this.width = width;
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
        ctx.lineWidth = this.width;
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

class Preview implements Command{
    point: Point = Point(-1, -1);
    active: boolean = false;

    move(point: Point) {
        this.point = point;
        this.active = point.x >= 0;
        dispatchEvent(drawingChanged);
    }

    display(ctx: CanvasRenderingContext2D) {
        if (!preview.active) return;
        
        ctx.font = lineWidth * 8 + "px monospace";
        ctx.fillText("+", this.point.x - lineWidth * 2, this.point.y + lineWidth * 2);
    }
}

function Point (x: number, y: number) : Point {
    return { x: x, y: y}
}

let displayActions: Command[] = []
let redoActions: Command[] = []
let preview: Preview = new Preview();
const drawingChanged: Event = new Event("drawing-changed");
const toolMoved: Event = new Event("tool-moved");

const lineWidths: number[] = [4, 6, 8]
let lineWidthButtons: HTMLButtonElement[] = [];
let lineWidth: number = 4;
const lineColor: string = "black";

let isDrawing: boolean = false;

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

const brushHeader: HTMLDivElement = document.createElement("div");
brushHeader.innerHTML = "Brushes";
app.append(brushHeader);

lineWidths.forEach(width => {
    const widthButton: HTMLButtonElement = document.createElement("button");
    widthButton.innerHTML = "[" + width + "]";
    lineWidthButtons.push(widthButton);
    app.append(widthButton);

    widthButton.addEventListener("click", () => {
        lineWidth = width;
        lineWidthButtons.forEach(button => {
            button.classList.remove("selectedTool");
        });
        widthButton.classList.add("selectedTool");
    })
});

lineWidthButtons.at(0)?.click();

const controlHeader: HTMLDivElement = document.createElement("div");
controlHeader.innerHTML = "Controls";
app.append(controlHeader);

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


const context: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;

// Canvas Functions
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

// Canvas Inputs
canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    displayActions.push(new Line(Point(e.offsetX, e.offsetY), lineWidth))
    redoActions = [];
});

canvas.addEventListener("mousemove", (e) => {

    if (isDrawing) {
        let command: Command = displayActions.at(-1) as Command;
        if (command instanceof Line) {
            (command as Line).push(Point(e.offsetX, e.offsetY));
        }
    }

    preview.move(Point(e.offsetX, e.offsetY));
    dispatchEvent(toolMoved);
});

window.addEventListener("mouseup", () => {
    if (!isDrawing) return;
    isDrawing = false;
});

canvas.addEventListener("mouseenter", () => {
    preview.move(Point(-1, -1))
});

canvas.addEventListener("mouseout", () => {
    preview.move(Point(-1, -1))
});

window.addEventListener("drawing-changed", () => {
    clearCanvas(context);
    drawCanvas(context);
});

window.addEventListener("tool-moved", () => {
    preview.display(context);
});