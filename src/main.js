const fs = require("fs-extra");
const sharp = require("sharp");

let fileOpen;
let fileSave;
let thumbSizeSlider;
let numFilesEl;
let viewEl;
let featuresEl;
let showEl;

let thumbSize = "200";

let pathSrc;
let pathPreview;
let dir;

let filesArr = [];

let db = {};
let filesMap = {};

let keyShiftDown = false;

let features = ["front", "34", "side", "full"];


exports.init = function () {

    fileOpen = document.getElementById("open");
    fileSave = document.getElementById("save");
    thumbSizeSlider = document.getElementById("thumb-size");
    numFilesEl = document.getElementById("num-files");
    viewEl = document.getElementById("view");
    featuresEl = document.getElementById("features");
    showEl = document.getElementById("show");

    let str = "";
    let strShow = `<button data-id="all">all</button><button data-id="unmarked">unmarked</button><button data-id="marked">marked</button><button data-id="fav"><span class="fav" data-id="fav"></span></button><p></p>`;

    for (let i = 0; i < features.length; i++) {
        let f = features[i];
        str += `<label><input type="radio" name="r-group" data-feature="${f}">${f}</label>`;
        strShow += `<button data-id="${f}">${f}</button>`
    }

    featuresEl.innerHTML = str;
    showEl.innerHTML = strShow;

    setListeners();

};

function setListeners() {
    document.getElementById("btnOpen").addEventListener("click", onOpenDir);
    document.getElementById("btnSave").addEventListener("click", save);
    document.getElementById("select-all").addEventListener("click", selectAll);
    document.getElementById("select-none").addEventListener("click", selectNone);
    document.getElementById("bg").addEventListener("click", setBg);
    document.getElementById("fav").addEventListener("click", setFavourite);
    fileOpen.addEventListener("change", onDirSelect);
    thumbSizeSlider.addEventListener("change", onThumbSizeChange);
    viewEl.addEventListener("click", imgSelectHandler);
    featuresEl.addEventListener("click", setSelectedStatus);
    showEl.addEventListener("click", showHide);

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

}


function onOpenDir() {
    fileOpen.value = "";
    fileOpen.click();
}


function onThumbSizeChange() {
    thumbSize = thumbSizeSlider.value;
    buildView();
}

function onDirSelect(e) {

    filesArr = [];
    db = {files: []};
    filesMap = {};

    dir = e.path[0].files[0].path + "/";
    pathSrc = e.path[0].files[0].path + "/src/";
    pathPreview = e.path[0].files[0].path + "/preview/";

    let files = fs.readdirSync(pathSrc);

    let json = dir + "/db.json";
    if (fs.existsSync(json)) {
        parseDb(json);
    }

    for (let i = 0; i < files.length; i++) {

        let f = pathSrc + files[i];
        if (fs.lstatSync(f).isDirectory()) {
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
        if (f.search(/.png|.jpg/i) > -1) {
            filesArr.push({
                folder: dirName,
                fileName: files[i],
                path: f,
                feature: null
            });
        }

    }
}


function buildView() {

    let str = "";

    for (let i = 0; i < filesArr.length; i++) {
        let obj = filesArr[i];
        if (filesMap.hasOwnProperty(obj.path)) {
            obj = filesMap[obj.path];
            filesArr[i] = obj;
        }
        let f = "file:///" + obj.path;
        let feature = obj.feature ? `data-feature="${obj.feature}"` : "";
        let fav = obj.fav ? `data-fav="1"` : "";
        let favStyle = obj.fav? "fav" : "";
        let marked = obj.feature ? "marked" : "";
        let markedDiv = obj.feature ? `<div class="thumb-feature ${favStyle}">${obj.feature}</div>` : "<div class='thumb-feature'></div>";
        str += `<div class="item ${marked}" 
                    data-id="${i}" ${feature} ${fav}
                    style="background: url('${f}'); 
                    background-size: contain; 
                    background-repeat: no-repeat; 
                    background-position: center;
                    width: ${thumbSize}px;
                    height: ${thumbSize}px;">
                    ${markedDiv}
                </div>`;
    }

    viewEl.innerHTML = str;

}

function keyDownHandler(e) {
    if (e.key === "Shift") keyShiftDown = true;
}

function keyUpHandler(e) {
    if (e.key === "Shift") {
        keyShiftDown = false;
    } else {
        if (e.key === "Backspace") {
            let conf = window.confirm("OK to delete?");
            if (conf === true) {
                let selected = viewEl.querySelectorAll(".selected");
                for (let i = selected.length-1; i >= 0; i--) {
                    let id = parseInt(selected[i].getAttribute("data-id"));
                    let obj = filesArr[id];
                    let f = obj.path;
                    filesArr.splice(id, 1);
                    fs.removeSync(f);
                }
                buildView();
                numFilesEl.innerHTML = filesArr.length + "";
            }
        }
    }

}


function imgSelectHandler(e) {

    let img = e.target;
    let id = img.getAttribute("data-id");
    if (!id) return;

    if (!keyShiftDown) {
        selectNone();
    }

    if (img.classList.contains("selected")) {
        img.classList.remove("selected");
    } else {
        img.classList.add("selected");
    }
    checkSelectedStatus();
}


function selectAll() {
    let items = viewEl.querySelectorAll(".item");
    for (let i = 0; i < items.length; i++) {
        items[i].classList.add("selected");
    }
    checkSelectedStatus();
}

function selectNone() {
    let items = viewEl.querySelectorAll(".item");
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove("selected");
    }
    checkSelectedStatus();
}


function checkSelectedStatus() {

    let selected = viewEl.querySelectorAll(".selected");
    document.getElementById("num-selected").innerHTML = selected.length + "";
    let fea = null;
    for (let i = 0; i < selected.length; i++) {
        let id = parseInt(selected[i].getAttribute("data-id"));
        let obj = filesArr[id];
        if (obj.feature !== null) {
            if (fea !== null && fea !== obj.feature) {
                let inp = document.querySelector("#features input:checked");
                if (inp) inp.checked = false;
                return;
            }
            fea = obj.feature;
        } else {
            let inp = document.querySelector("#features input:checked");
            if (inp) inp.checked = false;
        }
    }
    if (fea) document.querySelector(`#features input[data-feature="${fea}"]`).checked = true;
}

function setSelectedStatus() {

    let el = document.querySelector("#features input:checked");
    if (!el) return;

    let feature = el.getAttribute("data-feature");
    let selected = viewEl.querySelectorAll(".selected");

    for (let i = 0; i < selected.length; i++) {
        let id = parseInt(selected[i].getAttribute("data-id"));
        let obj = filesArr[id];
        obj.feature = feature;
        selected[i].classList.add("marked");
        selected[i].setAttribute("data-feature", obj.feature);
        selected[i].querySelector(".thumb-feature").innerHTML = obj.feature;
    }
}

function setFavourite() {

    let selected = viewEl.querySelectorAll(".selected");

    for (let i = 0; i < selected.length; i++) {
        let el = selected[i];
        let id = parseInt(el.getAttribute("data-id"));
        let obj = filesArr[id];
        let isFav = el.getAttribute("data-fav");
        let div = selected[i].querySelector(".thumb-feature");
        if (!isFav) {
            div.classList.add("fav");
            el.setAttribute("data-fav", 1);
            obj.fav = 1;
        } else {
            div.classList.remove("fav");
            el.removeAttribute("data-fav");
            delete obj.fav;
        }
    }
}

function showHide(e) {

    let id = e.target.getAttribute("data-id");
    if (!id) return;

    selectNone();

    if (id === "all") {
        showAll();
    } else {
        hideAll();

        let items = viewEl.querySelectorAll(`.item[data-feature="${id}"]`);
        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove("hidden");
        }

        if (id === "unmarked") {
            showAll();
            let items = viewEl.querySelectorAll(".item");
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                if (!item.getAttribute("data-feature")) {
                    item.classList.remove("hidden");
                } else {
                    item.classList.add("hidden");
                }
            }
        } else if (id === "marked") {
            let items = viewEl.querySelectorAll(".item");
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                if (item.getAttribute("data-feature")) {
                    item.classList.remove("hidden");
                }
            }
        } else if (id === "fav") {
            let items = viewEl.querySelectorAll(".item");
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                if (item.getAttribute("data-fav")) {
                    item.classList.remove("hidden");
                }
            }
        }

    }


}

function hideAll() {
    let items = viewEl.querySelectorAll(".item");
    for (let i = 0; i < items.length; i++) {
        items[i].classList.add("hidden");
    }
}

function showAll() {
    let items = viewEl.querySelectorAll(".item");
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove("hidden");
    }
}


function setBg(e) {

    let bg = e.target.getAttribute("data-id");

    if (bg) {
        viewEl.style.backgroundColor = bg;
    }
}


function save() {
    let obj = {};
    obj.files = filesArr;
    obj.features = features;
    let json = JSON.stringify(obj);
    fs.writeFileSync(dir + "db.json", json, "utf8");

    let str = fs.readFileSync("./src/viewer.html").toString();
    str = str.replace(`"__FILES__"`, json);
    fs.writeFileSync(dir + "index.html", str, "utf8");
}

function parseDb(file) {
    let files = fs.readJsonSync(file).files;
    for (let i = 0; i < files.length; i++) {
        let obj = files[i];
        filesMap[obj.path] = obj;
    }
}
























