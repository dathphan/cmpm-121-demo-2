import "./style.css";

// Variables
interface Point {
    x: number, y: number
}

interface Command {
    cleanCopy(): Command;
    display(ctx: CanvasRenderingContext2D);
    preview(ctx: CanvasRenderingContext2D, point: Point);   // I realized I wasn't suppose to do this, but I think the code is cleaner as a result
    mouseDown(ctx: CanvasRenderingContext2D, point: Point);
    drag(ctx: CanvasRenderingContext2D, point: Point);
    mouseUp(ctx: CanvasRenderingContext2D, point: Point);
}

class Brush implements Command {
    points: Point[] = []
    size: number
    color: number[] = [0, 0, 0];

    cleanCopy(): Command {
        return new Brush(this.size);
    }

    constructor(size: number) {
        this.size = size;
    }

    mouseDown(ctx: CanvasRenderingContext2D, point: Point){
        if (currentTool == this) {
            this.color = lineColor.slice();
        }

        this.drag(ctx, point);
    };
    drag(ctx: CanvasRenderingContext2D, point: Point) {
        this.points.push(point);
        dispatchEvent(drawingChanged);
    }
    mouseUp(_ctx: CanvasRenderingContext2D, _point: Point){};

    preview(ctx: CanvasRenderingContext2D, point: Point) {
        ctx.font = this.size * 8 + "px monospace";
        ctx.fillText("+", point.x - this.size * 2, point.y + this.size * 2);
        ctx.fillStyle = `rgb(${lineColor[0]}, ${lineColor[1]}, ${lineColor[2]})`;
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
        ctx.strokeStyle = `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`;
        ctx.lineWidth = this.size;
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

class Sticker implements Command {
    sticker: string = ""
    point: Point = Point(-1, -1);
    size: number = 6;

    cleanCopy(): Command {
        return new Sticker(this.sticker);
    }

    constructor(sticker: string) {
        this.sticker = sticker;
    }

    mouseDown(ctx: CanvasRenderingContext2D, point: Point){
        this.drag(ctx, point);
    };
    drag(ctx: CanvasRenderingContext2D, point: Point) {
        this.point = point;
        dispatchEvent(drawingChanged);
    }
    mouseUp(ctx: CanvasRenderingContext2D, point: Point){};
    
    preview(ctx: CanvasRenderingContext2D, point: Point) {
        ctx.font = this.size * 8 + "px monospace";
        ctx.fillText(this.sticker, point.x - this.size * 5.3, point.y + this.size * 2);
    }

    display(ctx: CanvasRenderingContext2D) {
        if (this.point.x < 0) return;
        this.preview(ctx, this.point);
    }
}

function Point (x: number, y: number) : Point {
    return { x: x, y: y}
}

let currentTool: Command;

let displayActions: Command[] = []
let redoActions: Command[] = []
let canvasPos: Point = Point(-1, -1);
const drawingChanged: Event = new Event("drawing-changed");
const toolMoved: Event = new Event("tool-moved");

const brushSizes: number[] = [3, 5, 8]
const stickers: string[] = ["🐯", "🐻", "🦝"]
let toolButtons: HTMLButtonElement[] = [];
const lineColor: number[] = [0, 0, 0];

let isDrawing: boolean = false;

// APP TITLES
const APP_NAME = "CMPM 121 Demo 2";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

const title = document.createElement("h1");
title.textContent = "Sticker Space"
app.append(title);

// CANVAS
const canvas: HTMLCanvasElement = document.createElement("canvas") as HTMLCanvasElement;
canvas.width = 256;
canvas.height = 256;
app.append(canvas);

const brushHeader: HTMLDivElement = document.createElement("div");
brushHeader.innerHTML = "Brushes";
app.append(brushHeader);

brushSizes.forEach(size => {
    const sizeButton: HTMLButtonElement = document.createElement("button");
    sizeButton.innerHTML = "[" + size + "]";
    toolButtons.push(sizeButton);
    app.append(sizeButton);

    sizeButton.addEventListener("click", () => {
        currentTool = new Brush(size);

        toolButtons.forEach(button => {
            button.classList.remove("selectedTool");
        });
        sizeButton.classList.add("selectedTool");
    })
});

toolButtons.at(0)?.click();

const rgb = ["R", "G", "B"];
const hexLabel = document.createElement("div");
for (let i = 0; i < 3; i++) {
    app.append(document.createElement("div"));

    const label: HTMLSpanElement = document.createElement("span");
    label.textContent = rgb[i];
    label.style.position = "relative";
    label.style.marginRight = "4px";
    label.style.top = "-6px";
    app.append(label);
    
    const colorSlider: HTMLInputElement = document.createElement("input");
    colorSlider.type = "range";
    colorSlider.min = "0";
    colorSlider.max = "255";
    colorSlider.value = "0";
    app.append(colorSlider);
    
    colorSlider.addEventListener("input", () => {
        lineColor[i] = parseInt(colorSlider.value);
        hexLabel.innerHTML = `Color: ${lineColor[0]}, ${lineColor[1]}, ${lineColor[2]}`;
    });
}
hexLabel.innerHTML = `rgb()`
app.append(hexLabel);

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

// Redo
const exportButton: HTMLButtonElement = document.createElement("button");
exportButton.innerHTML = "Export";
app.append(exportButton);

exportButton.addEventListener("click", () => {
    exportCanvas();
});

const stickerHeader: HTMLDivElement = document.createElement("div");
stickerHeader.innerHTML = "Stickers";
app.append(stickerHeader);

const addStickerButton: HTMLButtonElement = document.createElement("button");
addStickerButton.innerHTML = "Add A Custom Sticker";
app.append(addStickerButton);

app.append(document.createElement("div"));

addStickerButton.addEventListener("click", () => {
    const sticker: string = prompt("Enter Custom Sticker","🐺") as string;
    if (sticker == null) return;
    addSticker(sticker);
});

stickers.forEach(sticker => {
    addSticker(sticker);
});

const context: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;

// Canvas Functions
function drawCanvas(ctx: CanvasRenderingContext2D) {
    displayActions.forEach(actions => {
        actions.display(ctx);
    });
}

function previewCanvas(ctx: CanvasRenderingContext2D) {
    if (canvasPos.x < 0) return;
    currentTool.preview(ctx, canvasPos);
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
    redoActions.push(displayActions.pop() as Command);
    dispatchEvent(drawingChanged);
}

function redo() {
    if (redoActions.length < 1) return;
    displayActions.push(redoActions.pop() as Command);
    dispatchEvent(drawingChanged);
}

function addSticker(sticker: string) {
    const stickerButton: HTMLButtonElement = document.createElement("button");
    stickerButton.innerHTML = sticker;
    toolButtons.push(stickerButton);
    stickerButton.classList.add("stickerButton");
    app.append(stickerButton);

    stickerButton.addEventListener("click", () => {
        currentTool = new Sticker(sticker);

        toolButtons.forEach(button => {
            button.classList.remove("selectedTool");
        });
        stickerButton.classList.add("selectedTool");
    })
}

function exportCanvas() {
    const canvas: HTMLCanvasElement = document.createElement("canvas") as HTMLCanvasElement;
    canvas.width = 1024;
    canvas.height = 1024;

    const context: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.scale(4, 4);

    drawCanvas(context);

    const anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png");
    anchor.download = "sketchpad.png";
    anchor.click();
}

// Canvas Inputs
canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;

    displayActions.push(currentTool);
    currentTool.mouseDown(context, Point(e.offsetX, e.offsetY));
    redoActions = [];
});

window.addEventListener("mouseup", (e) => {
    if (isDrawing) {
        currentTool = currentTool.cleanCopy();
        let command: Command = displayActions.at(-1) as Command;
        command.mouseUp(context, Point(e.offsetX, e.offsetY));
        isDrawing = false;
    }
});

canvas.addEventListener("mousemove", (e) => {
    canvasPos = Point(e.offsetX, e.offsetY);
    if (isDrawing) {
        currentTool.drag(context, canvasPos);
    }

    dispatchEvent(toolMoved);
});

canvas.addEventListener("mouseenter", () => {
    canvasPos = Point(-1, -1);
    dispatchEvent(toolMoved);
});

canvas.addEventListener("mouseout", () => {
    canvasPos = Point(-1, -1);
    dispatchEvent(toolMoved);
});

window.addEventListener("drawing-changed", () => {
    clearCanvas(context);
    drawCanvas(context);
    previewCanvas(context);
});

window.addEventListener("tool-moved", () => {
    clearCanvas(context);
    drawCanvas(context);
    previewCanvas(context);
});