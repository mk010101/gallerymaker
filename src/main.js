//const fs = require("fs-extra");
//const sharp = require("sharp");

//const pathIn = process.argv[2];


function Main() {

    let features = ["face", "side", "3/4", "other"];

    let str = "";

    for (let i = 0; i < features.length; i++) {
        let f = features[i];
        str += `<label><input type="checkbox" data-id="${f}">${f}</label>`;
    }

    document.getElementById("features").innerHTML = str;



}