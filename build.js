const drawings = require("./drawings.json");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const urlSlug = require("url-slug");

const TEMPLATE_DIR = "./templates/";
const BUILD_DIR = "./build/";

drawings.forEach((drawing) => {
	drawing.link = urlSlug(drawing.name) + ".html";
	drawing.thumb_150 = get_thumb_name(drawing.file);
});

let res, tpl;
tpl = fs.readFileSync(TEMPLATE_DIR + "index.html", { encoding: "utf-8" });
res = ejs.render(tpl, {
	drawings,
	drawing: drawings[Math.floor(Math.random() * drawings.length)],
	is_index: true,
	title: "Cristina Cojocaru",
});
fs.writeFileSync(BUILD_DIR + "index.html", res);

tpl = fs.readFileSync(TEMPLATE_DIR + "drawings.html", { encoding: "utf-8" });
res = ejs.render(tpl, { drawings });
fs.writeFileSync(BUILD_DIR + "drawings.html", res);

if (!fs.existsSync(BUILD_DIR + "drawings")) {
	fs.mkdirSync(BUILD_DIR + "drawings/");
}
tpl = fs.readFileSync(TEMPLATE_DIR + "index.html", { encoding: "utf-8" });

drawings.forEach((drawing, idx) => {
	console.log("render", drawing.name);
	res = ejs.render(tpl, {
		drawing,
		title: drawing.name + " - Cristina Cojocaru",
		is_index: false,
		prevD: idx > 0 ? drawings[idx - 1] : null,
		nextD: idx + 1 < drawings.length ? drawings[idx + 1] : null,
	});
	fs.writeFileSync(BUILD_DIR + "drawings/" + drawing.link, res);
});

// generate thumbnails images
const IMG_DIR = BUILD_DIR + "images/";
fs.readdir(IMG_DIR, function (err, files) {
	//handling error
	if (err) {
		return console.log("Unable to scan directory: " + err);
	}

	files.forEach(async (file) => {
		if (file.startsWith(".")) {
			return;
		}

		if (file.indexOf("@150.") !== -1) {
			return;
		}

		const thumb_path = IMG_DIR + get_thumb_name(file);
		if (fs.existsSync(thumb_path)) {
			return;
		}

		console.log("Generate thumbs for", file);

		await sharp(path.resolve(__dirname, IMG_DIR, file))
			.resize(200, 300, {
				fit: "inside",
			})
			.toFile(thumb_path);
	});
});

function get_thumb_name(file) {
	const extension = path.extname(file);
	return file.replace(extension, "@150" + extension);
}
