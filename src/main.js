const fs = require("fs-extra");
const sharp = require("sharp");

let fileOpen;
let thumbSizeSlider;
let numFilesEl;

let thumbSize = "150";

let pathSrc;
let pathPreview;
let dir;

let filesArr = [];


exports.init = function() {

    let features = ["face", "side", "34", "other"];

    fileOpen = document.getElementById("open");
    thumbSizeSlider = document.getElementById("thumb-size");
    numFilesEl = document.getElementById("num-files");

    let str = "";

    for (let i = 0; i < features.length; i++) {
        let f = features[i];
        str += `<label><input type="checkbox" data-id="${f}">${f}</label>`;
    }

    document.getElementById("features").innerHTML = str;

    setListeners();

};

function setListeners() {
    document.getElementById("btnOpen").addEventListener("click", onOpenDir);
    fileOpen.addEventListener("change", onDirSelect);
    thumbSizeSlider.addEventListener("change", onThumbSizeChange);

}


function onOpenDir() {
    fileOpen.click();
}

function onThumbSizeChange() {
    thumbSize = thumbSizeSlider.value;
    buildView();
}

function onDirSelect(e) {

    dir = e.path[0].files[0].path + "/";
    pathSrc = e.path[0].files[0].path + "/src/";
    pathPreview = e.path[0].files[0].path + "/preview/";

    let files = fs.readdirSync(pathSrc);

    for (let i = 0; i < files.length; i++) {

        let f = pathSrc + files[i];
        if(fs.lstatSync(f).isDirectory()) {
            parseDirectory(f, files[i]);
        }

    }

    numFilesEl.innerHTML = filesArr.length + "";

    buildView();

}



function parseDirectory(dir, dirName) {

    let files = fs.readdirSync(dir);

    for (let i = 0; i < files.length; i++) {

        let f = dir + "/" + files[i];
        if(f.search(/.png|.jpg/i) > -1) {
            filesArr.push({
                folder: dirName,
                fileName: files[i],
                path: f,
                marked: false,
                rotation: ""
            });
        }

    }
}


function buildView() {

    let str = "";

    for (let i = 0; i < filesArr.length; i++) {
        let obj = filesArr[i];
        let f = "file:///" + obj.path;
        let marked = obj.marked? "marked" : "";
        //str += `<div class="item"><img src="${f}" data-folder="${obj.folder}"></div>`;
        str += `<div class="item ${marked}" 
                    data-id="${i}" 
                    style="background: url('${f}'); 
                    background-size: contain; 
                    background-repeat: no-repeat; 
                    background-position: center;
                    width: ${thumbSize}px;
                    height: ${thumbSize}px;
                    ">
                </div>`;
    }

    document.getElementById("view").innerHTML = str;

}











