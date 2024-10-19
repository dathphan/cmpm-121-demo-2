import "./style.css";

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
app.append(canvas)
canvas.width = 256;
canvas.height = 256;