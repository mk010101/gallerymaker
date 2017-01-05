const fs = require("fs-extra");
const sharp = require("sharp");

let btnOpen;

let pathSrc;
let pathPreview;
let dir;

let filesArr = [];


exports.init = function() {

    let features = ["face", "side", "34", "other"];

    btnOpen = document.getElementById("open");

    let str = "";

    for (let i = 0; i < features.length; i++) {
        let f = features[i];
        str += `<label><input type="checkbox" data-id="${f}">${f}</label>`;
    }

    document.getElementById("features").innerHTML = str;

    setListeners();

};

function setListeners() {
    btnOpen.addEventListener("change", onDirSelect);
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
                path: f
            });
        }

    }
}


function buildView() {

    let str = "";

    for (let i = 0; i < filesArr.length; i++) {
        let obj = filesArr[i];
        let f = "file:///" + obj.path;
        str += `<div class="item"><img src="${f}" data-folder="${obj.folder}"></div>`;
    }

    document.getElementById("view").innerHTML = str;

}











