/*******************************************************************************
 ** main.js
 ** Copyright (C) 2015, Max Wang <_mw@outlook.com>
 *******************************************************************************/
var mainCanvas, canvasOverlay, mainContainer,
    guideCanvas, backgroundDiv, cursorContainer, toolbox, cursor;

/**
 * function init
 * @param src - default image (jpg, png) to initialize canvas with
 * @param element <optional>
 *      string: searches for element matching ID (if any) otherwise first element with matching class
 *      DOM object (div)
 *      Writes canvas lib into div
 *      defaults into body
 * @param offsets <optional>
 *      precomputed offsets for the image (if any)
 */
function init(src, element, offsets) {
    mainPeaks = offsets;
    writeHTML(element);
    initVars();
    loadEditorScripts(src);
    loadEditorCSS();

    document.getElementById('img_save_btn').addEventListener("click", function() {
        saveImage();
    }, false);

    document.getElementById('img_open_btn').addEventListener("click", function() {
        var fileSelector = document.getElementById("open-selector");
        fileSelector.click();
    }, false);

    document.getElementById('open-selector').onchange = function () {
        var file = this.files[0];
        var fr = new FileReader();
        fr.onload = function(){
            loadImage(fr.result);
        }
        fr.readAsDataURL(file);
    };
}

function writeHTML(el) {
    var element = el ?
        document.getElementById(el) :
        document.getElementsByTagName("body")[0];
    element.setAttribute("oncontextmenu", "return false;");
    element.innerHTML += `
     <div id="background"></div>
    <div id="backgroundDarkener"></div>

    <div id="topmenu">
        <button class="topmenu_btn" id="img_open_btn">Open</button>
        <button class="topmenu_btn" id="img_save_btn">Save</button>
    </div>

    <div id="toolbox">
        <div id="toolboxHead">Tools</div>
        <div id="statInpaintTool">inpaint</div>
        <div id="cloneTool">clone</div>
    </div>

    <div id="mainContainer">
        <div id="mainContainerHead">
            Drag to Move,  + and - to zoom in and out.  Press z to undo, y to redo.
        </div>
        <div>
            <canvas id="mainCanvas"></canvas>
            <canvas id="guideCanvas"></canvas>
            <canvas id="paintCanvas"></canvas>
        </div>
    </div>

    <div id="settings" style="position:fixed;bottom:4px;left:8px;">
        <p class="settingsLabel">
            Quality:
            <input type="range" id="qualitySlider" min="15" value="40" max="200" step="1" />
        </p>
    </div>
    <div class="instructions">
        <ul class="instructionsList">
            <li>Left click to paint</li>
            <li>Right click to erase</li>
            <li>] to increase radius</li>
            <li>[ to decrease radius</li>
            <li>[ENTER] to inpaint</li>
            <li>Z to undo</li>
        </ul>
    </div>

    <div id="progress">
        <div id="progressBar"></div>
        <div id="progressText"></div>
    </div>

    <svg id="cursorContainer">
        <filter id="dropshadow" height="200%">
            <!-- DropShadow Filter -->
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" /> <!-- stdDeviation is how much to blur -->
            <feMerge>
                <feMergeNode /> <!-- this contains the offset blurred image -->
                <feMergeNode in="SourceGraphic" /> <!-- this contains the element that the filter is applied to -->
            </feMerge>
        </filter>
        <circle r="16" stroke="white" stroke-width="1.5" fill-opacity="0" id="cursor" style="filter:url(#dropshadow)" />
    </svg>


    <input type="file" name="open-selector" id="open-selector" style="opacity: 0; position:fixed; width:0; height:0">
    `
}

function initVars() {
    mainCanvas = document.getElementById("mainCanvas");
    canvasOverlay = document.getElementById("paintCanvas");
    guideCanvas = document.getElementById("guideCanvas");
    mainContainer = document.getElementById("mainContainer");
    backgroundDiv = document.getElementById("background");
    cursorContainer = document.getElementById("cursorContainer");
    toolbox = document.getElementById("toolbox");
    cursor = document.getElementById("cursor");
}

function loadEditorScripts(src){
    loadScripts([
    "https://code.jquery.com/jquery-3.1.1.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/interact.js/1.2.6/interact.min.js",
    "./scripts/hadamard-transform.js",
    "./scripts/kdtree.js",
    "./scripts/flow-graph.js",
    "./scripts/image-helpers.js",
    "./scripts/nearest-neighbour.js",
    "./scripts/nearest-neighbour-stats.js",
    "./scripts/photomontage-blend.js",
    "./scripts/photomontage-graphcut.js",
    "./scripts/gui.js",
    "./scripts/editor.js",
    "./scripts/editor-tools/stat-inpaint.js",
    "./scripts/editor-tools/clone-stamp.js",
    "./scripts/tool.js"],
    function(){
        initializeCanvas(src);
        window.onresize = function (event) {
            HandleResize();
        };
        mainCanvas.onchange = function (event) {
            HandleResize();
        };
        HandleResize();
    });
}

function loadScripts(srcList, callback) {
    if(srcList.length == 1){
        loadScript(srcList[0], callback);
    }
    else{
        var src = srcList[0];
        srcList = srcList.slice(1);
        loadScript(src, function(){loadScripts(srcList, callback)});
    }
}

function loadEditorCSS(){
    loadCSS("https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,400italic,600,700,300,200");
    loadCSS("./css/css.css");
}
function loadScript(src, callback) {
    var script = document.createElement('script');
    script.onload = callback;
    script.onerror = function(e){console.log(e)};
    script.src = src;
    document.head.appendChild(script);
}

function loadCSS(src) {
    var link = document.createElement("link");
    link.href = src;
    link.type = "text/css";
    link.rel = "stylesheet";
    link.media = "screen,print";

    document.getElementsByTagName("head")[0].appendChild(link);
}
