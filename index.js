
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
app.use(fileUpload());


app.use(express.static(__dirname + "/public"));
var fs = require('fs');



app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());


app.get("/", function(req,res){
	res.render("fileupload");
})



function processText(text){
	ngrams = {};
	beginnings = [];
	text = text.replace(/\n/g, " ");
	text = text.replace(/\\\//g, "/");
	text = text.replace(/(\r\n|\n|\r)/gm," ");
	text = text.replace(/\s\s+/g, ' ');
	text = text.replace("(\\t|\\r?\\n)+", " ");
	console.log(text);
	sentences = text.split(".");
	// sentences = sentences.splice(0, sentences.length -1);
	sentences.forEach(function(sentence){
		sentence = sentence.replace(/(\r\n|\n|\r)/gm,"");
		sentence = sentence.replace(/\s\s+/g, ' ');
		words = sentence.trim().split(" ");
		
		beginnings.push(words[0]);
	});
	
	words = text.trim().split(" ");
	for(var i = 0; i <= words.length - 3; i++){
		
			if(!(words[i] in ngrams)){
				
				ngrams[words[i]] = [];
			}
			ngrams[words[i]].push(words[i+1] + " " + words[i+2]);
		}
	
	for(var i = 0; i < beginnings.length; i++){
		if(!(beginnings[i] in ngrams)){
			beginnings.splice(i, 1);
		}
	}
	
	return {ngrams: ngrams, beginnings: beginnings};
	}



app.post("/upload", function(req,res){
        var sampleFile = req.files.sampleFile;
        var name = sampleFile.name;
        var extension = name.substr(name.length - 3);
        var nameWithoutExtension = name.slice(0,-4);

        console.log(name);
        console.log(extension);
        console.log(nameWithoutExtension);

        if ((extension !== "txt")){
            res.send("Please upload in .txt format.");
            return;
        }
        
        
        sampleFile.mv(name, function(err) {
            if (err){res.send("Error uploading file.");}
          
            else{
                res.redirect("/generateText/" + nameWithoutExtension)
            }
      });
    
});

app.get("/data/:filename", function(req,res){
	filename = req.params.filename;
	console.log("READING: "+filename)
	fs.readFile(filename,'utf8', function(err,data){
		text = data.replace(/(\r\n|\n|\r)/gm,""); // remove newline characters
		text = text.replace(/  +/g, ' '); // remove excess spaces
		obj = processText(text);
		res.json(obj);
})
})


app.get("/generateText/:filename", function(req,res){
	res.render("generateText", {filename: req.params.filename + '.txt'});
	

})

const PORT = process.env.PORT || 3000;

app.listen(PORT);