var frames = [];
const signature = [137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82];

function aweaw( buffer ) {
    let blob = new Blob( [ buffer ], { type: "image/png" } );
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL( blob );
    return imageUrl;
}

function readFile(g){
	var f = new FileReader();
	f.readAsDataURL(g.files[0]);
	f.onloadend = async function(e){
        let type = e.target.result.split(",")[0].split(";")[0].split(":")[1];
        if(type=="image/gif"){
            let gifframes = await gifFrames({url: e.target.result, frames: 'all', outputType: 'canvas'});
            console.log(gifframes);
            gifframes.forEach(frame => {
                let b64 = frame.getImage().toDataURL();
				frames.push(b64);
				var imglist = document.getElementById("imgs");
				var newImage = document.createElement("IMG");
				newImage.src=b64;
				newImage.width="64";newImage.height="64";
				newImage.className="img";
				newImage.id = frame.frameIndex;
				imglist.appendChild(newImage);
				
				var te = document.createElement("INPUT");
				te.type="text";
				te.value= Math.ceil(20 * frame.frameInfo.delay / 100)
				te.style.width="64px";
				document.getElementById("fps").appendChild(te);
            });
        }else{
            var b64 = e.target.result;
            frames.push(b64);
            var imglist = document.getElementById("imgs");
            var newImage = document.createElement("IMG");
            newImage.src=b64;
            newImage.width="64";newImage.height="64";
            newImage.className="img";
            imglist.appendChild(newImage);
            
            var te = document.createElement("INPUT");
            te.type="text";
            te.value="20";
            te.style.width="5em";
            document.getElementById("fps").appendChild(te);
        }
	}
}

function generate(){
	var canvas = document.getElementById("c");
	var ctx = canvas.getContext("2d");
	var imgs = document.getElementById("imgs").getElementsByTagName("IMG");
	var max = 0;
	for(var i=0;i!=imgs.length;i++){
		if(imgs[i].naturalWidth>max)max = imgs[i].naturalWidth;
	}
	canvas.width = max;
	canvas.height = max*imgs.length;
	ctx.imageSmoothingEnabled = false;
	for(var i=0;i!=imgs.length;i++){
        ctx.drawImage(imgs[i],0,i*max);
		ctx.drawImage(imgs[i],0,max*i,max,max);
	}
	document.getElementById("links").style.display = "inline";
	var b64 = canvas.toDataURL();
	document.getElementById("pngd").href = b64;
	document.getElementById("mcmeta").href = "data:text/plain;charset=utf-8,"+createMCMETA();
	document.getElementById("pngd").download = document.getElementById("tname").value+".png";
	document.getElementById("mcmeta").download = document.getElementById("tname").value+".png.mcmeta";
}

function createMCMETA(){

    var start = '{"animation":{"frames": [';
	
	var frameBase = '{"index": ';
	var frameMid = ', "time": ';
	var frameEnd = '},';
	
	var res = start;
	
	var fpss = document.getElementById("fps").getElementsByTagName("INPUT");
	for(var i=0;i!=fpss.length;i++){
		var tmp = frameBase;
		tmp+=i;
		tmp+=frameMid;
		tmp+=fpss[i].value;
		tmp+=frameEnd;
		res+=tmp;
	}
	res = res.substring(0,res.length-1);
	res+="]}}";
	return res;
}