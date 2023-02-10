const gridContainer = document.querySelector('.content-container')
const sizeElement = document.querySelector('#size')
let size = sizeElement.value
const resetButton = document.querySelector('#reset')
const contentWrapper = document.querySelector('.content-wrapper')
const opacityContainer = document.querySelector('.opacity-container')
const colorContainer = document.querySelector('.color-container')
const range = document.querySelector('.range')

// to change svg fill attribute when color is selected
const pencilPath = document.querySelector('#pen-svg')
const bucketPath = document.querySelector('#fill-svg')

// to create the colored buttons with eventListener
const colorButtons = document.querySelectorAll('.color-btn')
const colorOpacity = document.querySelector('.color-opacity')

// to check which mode is active
let draw = false
let pencilActive = true
let bucketActive = false
let eraserActive = false

// arrays for undo- and redoStacks
let undoStack = [];
let pixelIDs = [];
let redoStack = [];

// fills the grid with divs and add different eventListeners to them
function populate(size) {
    gridContainer.style.setProperty('--size', size)
    for (i = 0; i < size * size; i++) {
        const div = document.createElement('div');
        div.classList.add('pixel')
        div.setAttribute('data-color', '#FFFFFF')
        div.id = i.toString();

        div.addEventListener('mousedown', () => {

            if (pencilActive) {
                div.style.backgroundColor = color.value
                div.setAttribute("data-color", color.value);
                pixelIDs.push(div.id)
                undoButton.disabled = false;
                undoButton.classList.remove('disabled')
                undoButton.style.cursor = 'default'

                redoStack = []
                forwardsButton.disabled = true;
                forwardsButton.classList.add('disabled')
                forwardsButton.style.cursor = 'not-allowed'
            }

            if (bucketActive) {
                const row = Math.floor(div.id / sizeElement.value)
                const column = div.id % sizeElement.value
                const matrix = getMatrix();
                const newMatrix = floodFill(matrix, row, column, color.value)
                const flatMatrix = newMatrix.flat()
                const pixel = document.querySelectorAll('.pixel')
                for (let i = 0; i < flatMatrix.length; i++) {
                    pixel[i].style.backgroundColor = flatMatrix[i]
                    pixel[i].setAttribute('data-color', flatMatrix[i])
                }
                redoStack = [];
                forwardsButton.disabled = true;
                forwardsButton.classList.add('disabled');
                forwardsButton.style.cursor = 'not-allowed';
                undoButton.disabled = false;
                undoButton.classList.remove('disabled')
                undoButton.style.cursor = 'default'


                // push all the changed colors into the undoStack
                // console.log(pixelIDs, color.value)
                undoStack.push({ pixels: pixelIDs, color: color.value })
                pixelIDs = [];

            }

            if (eraserActive) {
                console.log(undoStack)
                div.style.backgroundColor = '#FFFFFF'
                div.setAttribute("data-color", '#FFFFFF');
                pixelIDs.push(div.id)
                undoButton.disabled = false;
                undoButton.classList.remove('disabled')
                undoButton.style.cursor = 'default'

                redoStack = []
                forwardsButton.disabled = true;
                forwardsButton.classList.add('disabled')
                forwardsButton.style.cursor = 'not-allowed'
            }


        })

        div.addEventListener('mouseover', () => {
            if (!draw) return;

            if (eraserActive) {
                div.style.backgroundColor = '#FFFFFF'
                div.setAttribute("data-color", '#FFFFFF');
                pixelIDs.push(div.id)

            }

            if (pencilActive) {
                div.style.backgroundColor = color.value
                div.setAttribute("data-color", color.value);
                pixelIDs.push(div.id)

            }

        })

        div.addEventListener('mouseup', () => {
            if (pencilActive || eraserActive) {
                undoStack.push({ pixels: pixelIDs, color: div.getAttribute("data-color") })
                pixelIDs = [];
            }
        })


        gridContainer.appendChild(div)
    }


}

// generate grid at start
populate(size)

window.addEventListener('mousedown', () => {
    draw = true;
})
window.addEventListener('mouseup', () => {
    draw = false;
})

// reload grid when new size is selected
sizeElement.addEventListener('change', () => {
    size = sizeElement.value;
    reset();
})

// make template buttons sticky on mobile and grid sticky on web
const navbar = document.querySelector(".nav-btn-container");
const navbarTop = navbar.offsetTop;
let palceholderNavbar = document.createElement("div");
palceholderNavbar.style.height = navbar.offsetHeight + "px";
palceholderNavbar.style.display = "none";
navbar.parentNode.insertBefore(palceholderNavbar, navbar);

const gridWrapper = document.querySelector('.left-wrapper')
const gridWrapperTop = gridWrapper.offsetTop
let palceholderGrid = document.createElement("div");
palceholderGrid.style.height = gridWrapper.offsetHeight + "px";
palceholderGrid.style.display = "none";
gridWrapper.parentNode.insertBefore(palceholderGrid, gridWrapper);

window.onscroll = function () {
    if (window.innerWidth < 800) {

        if (window.pageYOffset >= navbarTop) {
            navbar.classList.add("fixed");
            palceholderNavbar.style.display = "block";
        } else {
            navbar.classList.remove("fixed");
            palceholderNavbar.style.display = "none";
        }

    } else {

        if (window.pageYOffset >= gridWrapperTop) {
            gridWrapper.classList.add("fixed");
            palceholderGrid.style.display = "block";
        } else {
            gridWrapper.classList.remove("fixed");
            palceholderGrid.style.display = "none";
        }

    }
};


// to load up the templates
const changeBackground = (color) => {
    const allPixel = document.querySelectorAll('.pixel');
    for (let i = 0; i < allPixel.length; i++) {
        allPixel[i].style.backgroundColor = color[i];
        allPixel[i].setAttribute('data-color', color[i]);
    }
};

const handleClick = (event, size, color) => {
    const activeButton = document.querySelector('.nav-btn-active');
    if (activeButton === event.target) {
        activeButton.classList.remove('nav-btn-active');
        gridContainer.innerHTML = '';
        populate(size);
        return;
    }
    if (activeButton) {
        activeButton.classList.remove('nav-btn-active');
    }
    gridContainer.style.gap = '0px'
    gridImg.setAttribute('src', '/svgs/gridOn.svg')
    gridImg.style.left = '0px'
    gridImg.style.top = '0px'
    gridIsVisible = false
    event.target.classList.add('nav-btn-active');
    gridContainer.innerHTML = '';
    populate(size);
    sizeElement.value = size;
    changeBackground(color);
};

const surpriseButton = document.querySelector('#surprise');
surpriseButton.addEventListener('click', (event) => { handleClick(event, 32, surprise) });

const toadButton = document.querySelector('#toad');
toadButton.addEventListener('click', (event) => handleClick(event, 16, toad));

const marioButton = document.querySelector('#mario');
marioButton.addEventListener('click', (event) => handleClick(event, 16, mario));


// all the buttons for section TOOLS & SETTINGS start here

const penButton = document.querySelector('#pen')
penButton.addEventListener('click', () => {
    pencilActive = true;
    eraserActive = false;
    bucketActive = false;
    const activeTool = document.querySelector('.active-tool');
    if (activeTool) {
        activeTool.classList.remove('active-tool');
    }
    penButton.classList.add('active-tool');
    contentWrapper.style.cursor = 'url(svgs/penCursor.svg), grab';
    colorContainer.classList.remove('disabled')
    color.classList.remove('disabled')
    opacityContainer.classList.remove('disabled')
})

penButton.classList.add('active-tool');
contentWrapper.style.cursor = 'url(svgs/penCursor.svg), grab';

const fillButton = document.querySelector('#bucket')
fillButton.addEventListener('click', () => {
    bucketActive = true;
    pencilActive = false;
    eraserActive = false;
    const activeTool = document.querySelector('.active-tool');
    if (activeTool) {
        activeTool.classList.remove('active-tool');
    }
    fillButton.classList.add('active-tool');
    contentWrapper.style.cursor = 'url(svgs/bucket.svg), grab';
    colorContainer.classList.remove('disabled')
    color.classList.remove('disabled')
    opacityContainer.classList.remove('disabled')

})

const eraserButton = document.querySelector('#eraser')
eraserButton.addEventListener('click', () => {
    eraserActive = true;
    pencilActive = false;
    bucketActive = false;
    const activeTool = document.querySelector('.active-tool');
    if (activeTool) {
        activeTool.classList.remove('active-tool');
    }
    eraserButton.classList.add('active-tool');
    contentWrapper.style.cursor = 'url(svgs/eraser.svg), grab';
    colorContainer.classList.add('disabled')
    color.classList.add('disabled')
    opacityContainer.classList.add('disabled')
})

const undoButton = document.querySelector('#backwards');
undoButton.disabled = true;
undoButton.classList.add('disabled')
undoButton.style.cursor = 'not-allowed'
undoButton.addEventListener('click', () => {
    const lastStep = undoStack.pop()
    redoStack.push(lastStep)
    forwardsButton.disabled = false;
    forwardsButton.classList.remove('disabled')
    forwardsButton.style.cursor = 'default'

    for (let i = 0; i < lastStep.pixels.length; i++) {
        const pixel = lastStep.pixels[i];
        let found = false;
        for (let j = undoStack.length - 1; j >= 0; j--) {
            if (undoStack[j].pixels.includes(pixel)) {
                found = true;
                document.getElementById(`${lastStep.pixels[i]}`).style.backgroundColor = undoStack[j].color;
                document.getElementById(`${lastStep.pixels[i]}`).setAttribute("data-color", undoStack[j].color);

                break;
            }
        }
        if (!found) {
            document.getElementById(`${lastStep.pixels[i]}`).style.backgroundColor = '#FFFFFF';
            document.getElementById(`${lastStep.pixels[i]}`).setAttribute("data-color", '#FFFFFF');
        }
    }
    if (undoStack.length === 0) {
        undoButton.disabled = true;
        undoButton.classList.add('disabled')
        undoButton.style.cursor = 'not-allowed'

    }
})

const forwardsButton = document.querySelector('#forwards');
forwardsButton.disabled = true;
forwardsButton.classList.add('disabled')
forwardsButton.style.cursor = 'not-allowed'
forwardsButton.addEventListener('click', () => {
    const nextStep = redoStack.pop();
    undoStack.push(nextStep)
    undoButton.disabled = false;
    undoButton.classList.remove('disabled')
    undoButton.style.cursor = 'default'

    for (let i = 0; i < nextStep.pixels.length; i++) {
        document.getElementById(`${nextStep.pixels[i]}`).style.backgroundColor = nextStep.color;
        document.getElementById(`${nextStep.pixels[i]}`).setAttribute("data-color", nextStep.color);
    }
    if (redoStack.length === 0) {
        forwardsButton.disabled = true;
        forwardsButton.classList.add('disabled')
        forwardsButton.style.cursor = 'not-allowed'
    }
})

let gridIsVisible = true;
const gridImg = document.querySelector('.grid-img')
const gridButton = document.querySelector('#grid')
gridButton.addEventListener('click', () => {
    if (gridIsVisible) {
        gridContainer.style.gap = '0px'
        gridImg.setAttribute('src', '/svgs/gridOn.svg')
        gridImg.style.left = '0px'
        gridImg.style.top = '0px'

    } else {
        gridContainer.style.gap = '3px'
        gridImg.setAttribute('src', '/svgs/gridOff.svg')
        gridImg.style.left = '-1px'
        gridImg.style.top = '1px'

    }
    gridIsVisible = !gridIsVisible
})

gridImg.style.left = '-1px'
gridImg.style.top = '1px'

resetButton.addEventListener('click', reset)
function reset() {
    gridContainer.innerHTML = '';
    populate(size)
    sizeElement.value = size
    redoStack = []
    forwardsButton.disabled = true;
    forwardsButton.classList.add('disabled')
    forwardsButton.style.cursor = 'not-allowed'
    const activeButton = document.querySelector('.nav-btn-active');
    if (activeButton) {
        activeButton.classList.remove('nav-btn-active');
    }
}

const color = document.querySelector('.color')
color.addEventListener('input', () => {
    colorOpacity.style.background = `linear-gradient(90deg, ${color.value}, #ffffff)`
    range.value = 2
    rangeColor = color.value
    document.querySelector('.range').style.setProperty('--color', invertColor(color.value))
    pencilPath.setAttribute('fill', color.value)
    bucketPath.setAttribute('fill', color.value)

})


const retroColors = [
    "#7D4071",
    "#DB5A6B",
    "#E49E61",
    "#FFC107",
    "#00C853",
    "#008CBA",
    "#2196F3",
    "#9C27B0",
    "#FF5722",
    "#795548",
    "#607D8B",
    "#4CAF50"
];

// give the buttons the right color of the palette and add eventListeners
for (let i = 0; i < colorButtons.length; i++) {
    colorButtons[i].style.backgroundColor = retroColors[i];
    // saved as attribute, cause backgroundColor is transformed to rgb when getting back
    colorButtons[i].setAttribute("data-color", retroColors[i]);
    colorButtons[i].addEventListener('click', (event) => {
        const pickedColor = event.target.getAttribute("data-color")
        color.value = pickedColor
        rangeColor = color.value
        range.value = 2
        colorOpacity.style.background = `linear-gradient(90deg, ${pickedColor}, #ffffff)`
        pencilPath.setAttribute('fill', pickedColor)
        bucketPath.setAttribute('fill', pickedColor)

        document.querySelector('.range').style.setProperty('--color', invertColor(color.value))
    })
}


// when color opacity is changed
range.addEventListener('input', () => {
    color.value = adjustBrightness(rangeColor, range.value)
    pencilPath.setAttribute('fill', color.value)
    bucketPath.setAttribute('fill', color.value)
})

// to load up initial color
let rangeColor;
color.value = '#154050'
rangeColor = color.value

// get the value of the range (on the opacity div) and calculate the selected brightness
function adjustBrightness(hex, brightness) {

    // convert hex to RGB
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    // adjust brightness
    r = Math.round((1 - (brightness / 100)) * r + (brightness / 100) * 255);
    g = Math.round((1 - (brightness / 100)) * g + (brightness / 100) * 255);
    b = Math.round((1 - (brightness / 100)) * b + (brightness / 100) * 255);

    // convert RGB back to hex
    r = r.toString(16).padStart(2, '0');
    g = g.toString(16).padStart(2, '0');
    b = b.toString(16).padStart(2, '0');

    return `#${r}${g}${b}`;
}

// invert the color of the range handle, so it is always visible
function invertColor(hex) {

    // convert hex to RGB
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    // invert brightness
    r = 255 - r;
    g = 255 - g;
    b = 255 - b;

    // convert RGB back to hex
    r = r.toString(16).padStart(2, '0');
    g = g.toString(16).padStart(2, '0');
    b = b.toString(16).padStart(2, '0');

    return `#${r}${g}${b}`;
}

// fill algorithm starts here
// to check if a row and column are within the matrix
function isValidIndex(matrix, row, column) {
    return row >= 0 && row < matrix.length && column >= 0 && column < matrix[row].length;
}

// to get an n*n matrix with the color values inside, for the algorithm
function getMatrix() {
    let arrayMatrix = [];
    const pixel = document.querySelectorAll('.pixel');
    let rowArray = [];
    for (let i = 0; i < pixel.length; i++) {
        rowArray.push(pixel[i].getAttribute('data-color'));
        if (rowArray.length % sizeElement.value === 0) {
            arrayMatrix.push(rowArray);
            rowArray = [];
        }
    }
    return arrayMatrix;
}

function floodFill(matrix, row, column, targetColor) {
    // get the current color, which needs to be replaced
    const currentColor = matrix[row][column];
    // if targetColor is same as the existing, return the original matrix
    if (currentColor === targetColor) {
        return matrix;
    }
    // else call the recursive function 
    floodFillRecursive(matrix, row, column, targetColor, currentColor);

    // return the filled matrix
    return matrix;
}

// recursive function
function floodFillRecursive(matrix, row, column, targetColor, currentColor) {
    // check if current row and column are inside of the matrix
    if (!isValidIndex(matrix, row, column)) {
        return;
    }
    // if the pixel has not the currentColor (which we are replacing) then return
    if (matrix[row][column] !== currentColor) {
        return;
    }
    // update the new color
    matrix[row][column] = targetColor;

    // needed for undo/redo stacks
    let divID = row * size + column
    pixelIDs.push(divID.toString())

    // call the same function recursively, in all 4 directions
    // previous row
    floodFillRecursive(matrix, row - 1, column, targetColor, currentColor);
    // next row
    floodFillRecursive(matrix, row + 1, column, targetColor, currentColor);
    // previous column
    floodFillRecursive(matrix, row, column - 1, targetColor, currentColor);
    // next column
    floodFillRecursive(matrix, row, column + 1, targetColor, currentColor);
}


// export file
var exportBtn = document.getElementById("export-btn");
exportBtn.addEventListener("click", function () {
    // Get a reference to the canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = sizeElement.value * 64;
    canvas.height = sizeElement.value * 64;

    const pixels = document.querySelectorAll('.pixel');

    // loop through the pixels and draw them on the canvas
    for (let i = 0; i < pixels.length; i++) {
        const x = i % sizeElement.value;
        const y = Math.floor(i / sizeElement.value);
        const color = pixels[i].getAttribute('data-color');

        ctx.fillStyle = color;
        ctx.fillRect(x * 64, y * 64, 64, 64);
    }
    // get the selected format
    const format = document.getElementById('image-format')

    // check if the format is 'png'
    if (format.value === 'png') {
        // make all white pixels transparent
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) {
                data[i + 3] = 0;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    if (format.value === 'txt') {
        let output = [];
        for (let i = 0; i < pixels.length; i++) {
            output.push(pixels[i].getAttribute('data-color'))
        }
        // convert the output array to a string
        const outputString = output.join(',');

        // create a Blob object with the string as its content
        const blob = new Blob([outputString], { type: 'text/plain' });

        // create a URL object that can be used to refer to the Blob
        const url = URL.createObjectURL(blob);

        // create a link to download the text file
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'pixelArt.txt';

        // add the link to the DOM and click it to start the download
        document.body.appendChild(downloadLink);
        downloadLink.click();

        return;
    }

    // convert the canvas content to selected type
    const pngImage = canvas.toDataURL(`image/${format.value}`);

    // create a link to download the image
    const downloadLink = document.createElement('a');
    downloadLink.href = pngImage;
    downloadLink.download = `pixelArt.${format.value}`;

    // add the link to the DOM and click it to start the download
    document.body.appendChild(downloadLink);
    downloadLink.click();

});


const uploadText = document.querySelector('.upload-btn');
const fileInput = document.querySelector('input[type="file"]');

// import file
uploadText.addEventListener('click', () => {
    // because fileInput has display property to 'none'
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/plain") {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
            const output = e.target.result;
            const pixels = output.split(",");
            const size = Math.sqrt(pixels.length);
            sizeElement.value = size;
            gridContainer.innerHTML = '';
            populate(size);
            const allPixel = document.querySelectorAll('.pixel')
            for (let i = 0; i < allPixel.length; i++) {
                allPixel[i].style.backgroundColor = pixels[i];
                allPixel[i].setAttribute('data-color', pixels[i]);
            }
        };
    } else {
        // should be never triggered
        alert("Invalid file type. Please select a .txt file.");
    }
});



// templates start here

const mario = [
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ee1d24",
    "#ee1d24",
    "#ee1d24",
    "#ee1d24",
    "#ee1d24",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ee1d24",
    "#ee1d24",
    "#ee1d24",
    "#ee1d24",
    "#ee1d24",
    "#ee1d24",
    "#ee1d24",
    "#ee1d24",
    "#ee1d24",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#452400",
    "#452400",
    "#452400",
    "#ffc20c",
    "#ffc20c",
    "#000000",
    "#ffc20c",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#452400",
    "#ffc20c",
    "#452400",
    "#ffc20c",
    "#ffc20c",
    "#ffc20c",
    "#000000",
    "#ffc20c",
    "#ffc20c",
    "#ffc20c",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#452400",
    "#ffc20c",
    "#452400",
    "#452400",
    "#ffc20c",
    "#ffc20c",
    "#ffc20c",
    "#000000",
    "#ffc20c",
    "#ffc20c",
    "#ffc20c",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#452400",
    "#ffc20c",
    "#ffc20c",
    "#ffc20c",
    "#ffc20c",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ffc20c",
    "#ffc20c",
    "#ffc20c",
    "#ffc20c",
    "#ffc20c",
    "#ffc20c",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ee1e23",
    "#ee1e23",
    "#1500ff",
    "#ee1e23",
    "#ee1e23",
    "#1500ff",
    "#ee1e23",
    "#ee1e23",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ee1e23",
    "#ee1e23",
    "#ee1e23",
    "#1500ff",
    "#ee1e23",
    "#ee1e23",
    "#1500ff",
    "#ee1e23",
    "#ee1e23",
    "#ee1e23",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ee1e23",
    "#ee1e23",
    "#ee1e23",
    "#ee1e23",
    "#1500ff",
    "#1500ff",
    "#1500ff",
    "#1500ff",
    "#ee1e23",
    "#ee1e23",
    "#ee1e23",
    "#ee1e23",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ffc20c",
    "#ffc20c",
    "#ee1e23",
    "#1500ff",
    "#fff104",
    "#1500ff",
    "#1500ff",
    "#fff104",
    "#1500ff",
    "#ee1e23",
    "#ffc20c",
    "#ffc20c",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ffc20c",
    "#ffc20c",
    "#ffc20c",
    "#1500ff",
    "#1500ff",
    "#1500ff",
    "#1500ff",
    "#1500ff",
    "#1500ff",
    "#ffc20c",
    "#ffc20c",
    "#ffc20c",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ffc20c",
    "#ffc20c",
    "#1500ff",
    "#1500ff",
    "#1500ff",
    "#1500ff",
    "#1500ff",
    "#1500ff",
    "#1500ff",
    "#1500ff",
    "#ffc20c",
    "#ffc20c",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#1500ff",
    "#1500ff",
    "#1500ff",
    "#FFFFFF",
    "#FFFFFF",
    "#1500ff",
    "#1500ff",
    "#1500ff",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#452400",
    "#452400",
    "#452400",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#452400",
    "#452400",
    "#452400",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#452400",
    "#452400",
    "#452400",
    "#452400",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#452400",
    "#452400",
    "#452400",
    "#452400",
    "#FFFFFF",
    "#FFFFFF"
]

const toad = [
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#000000",
    "#870001",
    "#870001",
    "#870001",
    "#870001",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#b80100",
    "#b80100",
    "#b80100",
    "#b80100",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#b80100",
    "#f90000",
    "#f90000",
    "#f90000",
    "#f90000",
    "#f90000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#b80100",
    "#f90000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#f90000",
    "#f90000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#000000",
    "#870001",
    "#b80100",
    "#f90000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#f90000",
    "#f90000",
    "#f90000",
    "#b80100",
    "#870001",
    "#000000",
    "#000000",
    "#870001",
    "#b80100",
    "#f90000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#f90000",
    "#f90000",
    "#FFFFFF",
    "#FFFFFF",
    "#870001",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#b80100",
    "#f90000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#f90000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#b80100",
    "#b80100",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#b80100",
    "#b80100",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#870001",
    "#870001",
    "#870001",
    "#870001",
    "#870001",
    "#870001",
    "#870001",
    "#870001",
    "#870001",
    "#FFFFFF",
    "#FFFFFF",
    "#870001",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#870001",
    "#870001",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#870001",
    "#870001",
    "#870001",
    "#000000",
    "#FFFFFF",
    "#000000",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF"
]

const surprise = [
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#000000",
    "#FFFFFF",
    "#000000",
    "#000000",
    "#000000",
    "#000000",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ffffff",
    "#FFFFFF",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#30d6f8",
    "#ffffff",
    "#ffffff",
    "#FFFFFF",
    "#30d6f8",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ffffff",
    "#30d6f8",
    "#FFFFFF",
    "#ffffff",
    "#ffffff",
    "#30d6f8",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#30d6f8",
    "#FFFFFF",
    "#FFFFFF",
    "#ffffff",
    "#30d6f8",
    "#ffffff",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ffffff",
    "#FFFFFF",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#FFFFFF",
    "#ffffff",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ffffff",
    "#ffffff",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ffffff",
    "#ffffff",
    "#FFFFFF",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ffffff",
    "#30d6f8",
    "#30d6f8",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#30d6f8",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#30d6f8",
    "#30d6f8",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#30d6f8",
    "#30d6f8",
    "#30d6f8",
    "#30d6f8",
    "#30d6f8",
    "#30d6f8",
    "#ffffff",
    "#ffffff",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#FFFFFF",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#ffffff",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF"
]

