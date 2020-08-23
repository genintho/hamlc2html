const drawings = require('./drawings.json');
const ejs = require('ejs');
const fs = require('fs');
const urlSlug = require('url-slug');

drawings.forEach((drawing) => {
    drawing.link = urlSlug(drawing.name) + '.html';
});

let res, tpl;
tpl = fs.readFileSync('./templates/index.html', {encoding: 'utf-8'});
res = ejs.render(tpl, {drawings});
fs.writeFileSync("./build/index.html", res);

tpl = fs.readFileSync('./templates/drawings.html', {encoding: 'utf-8'});
res = ejs.render(tpl, {drawings});
fs.writeFileSync("./build/drawings.html", res);

if (!fs.existsSync("./build/drawings")) {
    fs.mkdirSync("./build/drawings/");
}
tpl = fs.readFileSync('./templates/drawing.html', {encoding: 'utf-8'});

drawings.forEach((drawing, idx) => {
    console.log("render", drawing.name);
    res = ejs.render(tpl, {
        drawing,
        prevD: idx >0 ? drawings[idx-1]: null,
        nextD: idx+1 < drawings.length ? drawings[idx+1] : null
    });
    fs.writeFileSync("./build/drawings/" + drawing.link, res);
});