const canvas = document.querySelector("canvas"),
toolBtns = document.querySelectorAll(".tool"), 
fillColor = document.querySelector("#fill-color"),
sizeslider = document.querySelector("#size-slider"),
colorBtns = document.querySelectorAll(".colors .option"),
colorPicker = document.querySelector("#color-picker"),
clearCanvas = document.querySelector(".clear-canvas"),
saveImg = document.querySelector(".save-img"),
ctx = canvas.getContext("2d");

let prevMouseX, prevMouseY, snapshot,
isDrawing = false,
selectedTool = "brush",
brushwidth = 5,
data,
selectedColor = "#000";

const setCanvasBackground = () =>{
    ctx.fillStyle =   "#fff";
    ctx.fillRect(0, 0,canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
}


window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;     
    setCanvasBackground();
});
function putPixel(x, y, r, g, b, a = 255) {
            if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
            const index = (y * canvas.width + x) * 4;
            data[index] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = a;
        }

        function drawLine(x1, y1, x2, y2, r, g, b, size, a = 255) {
            const dx = Math.abs(x2 - x1);
            const dy = Math.abs(y2 - y1);

            if (dx > dy) {
                const m = dx === 0 ? 0 : (y2 - y1) / (x2 - x1);
                const c = y1 - m * x1;
                for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                    const y = Math.round(m * x + c);
                    drawBrush(x, y, r, g, b, size, a);
                }
            } else {
                const m = dy === 0 ? 0 : (x2 - x1) / (y2 - y1);
                const c = x1 - m * y1;
                for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                    const x = Math.round(m * y + c);
                    drawBrush(x, y, r, g, b, size, a);
                }
            }
        }
         function drawBrush(cx, cy, r, g, b, size, a = 255) {
            const radius = size / 2;
            const bound = Math.ceil(radius);
            const threshold = radius * radius + 0.5;
            for (let y = -bound; y <= bound; y++) {
                for (let x = -bound; x <= bound; x++) {
                    if (x * x + y * y <= threshold) {
                        putPixel(cx + x, cy + y, r, g, b, a);
                    }
                }
            }
        }
function drawRectShape(x1, y1, x2, y2, r, g, b, size) {
            drawLine(x1, y1, x2, y1, r, g, b, size);
            drawLine(x2, y1, x2, y2, r, g, b, size);
            drawLine(x2, y2, x1, y2, r, g, b, size);
            drawLine(x1, y2, x1, y1, r, g, b, size);
        }

        function drawEllipseShape(x1, y1, x2, y2, r, g, b, size) {
            const cx = (x1 + x2) / 2;
            const cy = (y1 + y2) / 2;
            const rx = Math.abs(x2 - x1) / 2;
            const ry = Math.abs(y2 - y1) / 2;
            const steps = 120;
            for (let i = 0; i < steps; i++) {
                const angle = (i / steps) * 2 * Math.PI;
                const px = Math.round(cx + rx * Math.cos(angle));
                const py = Math.round(cy + ry * Math.sin(angle));
                drawBrush(px, py, r, g, b, size);
            }
        }

        function drawTriangleShape(x1, y1, x2, y2, r, g, b, size) {
            const topX = Math.round((x1 + x2) / 2);
            drawLine(topX, y1, x1, y2, r, g, b, size);
            drawLine(x1, y2, x2, y2, r, g, b, size);
            drawLine(x2, y2, topX, y1, r, g, b, size);
        }
  function drawLineShape(e){
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
}      

function drawRect(e){
    const width = e.offsetX - prevMouseX;
    const height = e.offsetY - prevMouseY;

    if(fillColor.checked){
        ctx.fillRect(prevMouseX, prevMouseY, width, height);
    }else{
        ctx.strokeRect(prevMouseX, prevMouseY, width, height);
    }
}

function drawCircle(e){
    const radius = Math.sqrt(
        Math.pow(e.offsetX - prevMouseX,2) +
        Math.pow(e.offsetY - prevMouseY,2)
    );

    ctx.beginPath();
    ctx.arc(prevMouseX, prevMouseY, radius, 0, Math.PI * 2);

    if(fillColor.checked){
        ctx.fill();
    }else{
        ctx.stroke();
    }
}
function drawTriangle(e){
    ctx.beginPath();

    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
    ctx.closePath();

    if(fillColor.checked){
        ctx.fill();
    }else{
        ctx.stroke();
    }
}




const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY;
    ctx.beginPath();
    ctx.lineWidth = brushwidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot  = ctx.getImageData(0, 0, canvas.width, canvas.height);
}
const drawing = (e) => {
    if(!isDrawing) return;
    ctx.putImageData(snapshot, 0, 0);
    if(selectedTool === "brush" || selectedTool === "eraser" ) {
         ctx.strokeStyle = selectedTool === "eraser"? "#fff" : selectedColor;
         ctx.lineTo(e.offsetX, e.offsetY);
         ctx.stroke();
    } else if(selectedTool === "rectangle"){
        drawRect(e);
    } else if(selectedTool === "circle"){
        drawCircle(e);
    } else if(selectedTool === "triangle"){
        drawTriangle(e);
    }else if(selectedTool === "line"){
        drawLineShape(e);
    }
   
}

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
        console.log(selectedTool);
    });
}); 

sizeslider.addEventListener("change",() => brushwidth = sizeslider.value);

colorBtns.forEach(btn => {
    btn.addEventListener('click', () =>{
        document.querySelector(".colors .selected").classList.remove("selected");
        btn.classList.add("selected");
        selectedColor= window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click",() =>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
});
saveImg.addEventListener("click",() =>{
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
})

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup",() => isDrawing = false);