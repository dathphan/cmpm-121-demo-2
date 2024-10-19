import "./style.css";

// Variables
const lineWidth: number = 3;
const lineColor: string = "black";

let isDrawing: boolean = false;
let mouseX: number = 0;
let mouseY: number = 0;

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})

// Draw on Canvas
const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;

function startLine(x: number, y: number){
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.moveTo(x, y);
}

function nextLinePoint(x: number, y: number){
    ctx.lineTo(x, y);
    ctx.stroke();
}

function endLine(){
    ctx.closePath();
}

canvas.addEventListener("mousedown", (e) => {
    mouseX = e.offsetX;
    mouseY = e.offsetY;
    isDrawing = true;
    startLine(mouseX, mouseY);
});

canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;
    mouseX = e.offsetX;
    mouseY = e.offsetY;
    nextLinePoint(mouseX, mouseY);
});

canvas.addEventListener("mouseup", (e) => {
    endLine();
    isDrawing = false;
});