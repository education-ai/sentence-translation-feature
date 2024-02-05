
	
function maketask(x,a1){	
	// make first p element
	var p = document.createElement('p');
		p.setAttribute('id', x);
		p.setAttribute('style', 'display:none');
		document.getElementById('tasks').appendChild(p);
			
	for (var i = 0; i < a1.length; i++){
		if (a1[i][0]=='h'){
			// text only
			var p = document.createElement('p');
			p.innerHTML = a1[i][1]+' ';
			document.getElementById(x).appendChild(p);
		}else if (a1[i][0]=='t'){
			// text only
			var span = document.createElement('span');
			span.innerHTML = a1[i][1]+' ';
			document.getElementById(x).appendChild(span);
		}else if (a1[i][0]=='w'){
			// writing
			var inp = document.createElement('input');
			inp.setAttribute('typ', 'text');
			inp.setAttribute('id', x+'_'+i);
			inp.setAttribute('maxlength', a1[i][1][0].length+4);
			inp.setAttribute('size', a1[i][1][0].length+4);
			inp.setAttribute('placeholder', '✎');
			inp.innerHTML = a1[i][1];
			document.getElementById(x).appendChild(inp);
			inp.onkeydown = function(){makereset(x);};
		}else if (a1[i][0]=='s'){
			// select
			var sel = document.createElement('select');
			sel.setAttribute('id', x+'_'+i);
			// first is empty
			var option = document.createElement('option');
			sel.add(option); 
			// shuffle options
			var clone = [...a1[i][1]];
			var op_shuffled = shuffle(clone);
			for (var j = 0; j < op_shuffled.length; j++){
				var option = document.createElement('option');
				option.text = op_shuffled[j];
				option.value= op_shuffled[j];
				sel.add(option); 
			}
			
			sel.onchange = function(){makereset(x);};
			document.getElementById(x).appendChild(sel);
			
		}
		// placeholder for feedback
		if (a1[i][0]!='t' && a1[i][0]!='h' && a1[i][0]!='onerror'){
			var span = document.createElement('span');
			span.setAttribute('id', x+'_'+i+'c');
			span.innerHTML = ' ';
			document.getElementById(x).appendChild(span);
		}
	}
	var but = document.createElement('button');
	but.setAttribute('id', x+'b');
	but.innerHTML = 'ok';
	but.onclick=function () {check1(x,a1); };
	document.getElementById(x).appendChild(but);
	
}

function makereset(x){
	var i = 0;
	while (i < 15) {
		if (document.getElementById(x+'_'+i+'c') != null) document.getElementById(x+'_'+i+'c').className='';
		i++;
	}
	
}

function logalldata(){
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", "log.php", true); 
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.onreadystatechange = function() {
	   if (this.readyState == 4 && this.status == 200) {
		 // Response
		 var response = this.responseText;
	   }
	};
	var data = {data:logger};
	xhttp.send(JSON.stringify(data));
}
var errorcnter_max = 2;
function check1(x,a1){
	var allcorrect = true;
	var onerrorvideo = null;
	for (var i = 0; i < a1.length; i++){
		//alert(a1[i]);
		var iscorrect = true;
		var isnearlycorrect = false;
		var response = '';
		if (a1[i][0]=='w'){
			response = document.getElementById(x+'_'+i).value.trim();
			if (a1[i][1].includes(response)) document.getElementById(x+'_'+i+'c').className = 'rescorr';
			else if (ld(a1[i][1][0], response) <= 2)  {
				document.getElementById(x+'_'+i+'c').className = 'rescorr2';
				isnearlycorrect = true;
				iscorrect = false;
				allcorrect = false;
			}else {
				document.getElementById(x+'_'+i+'c').className = 'resfalse';
				allcorrect = false;
				iscorrect = false;
			}
		
		}else if (a1[i][0]=='s'){
			response = document.getElementById(x+'_'+i).value;
			if (response  == a1[i][1][0]) document.getElementById(x+'_'+i+'c').className = 'rescorrbg';
			else {
				document.getElementById(x+'_'+i+'c').className = 'resfalsebg';
				allcorrect = false;
				iscorrect = false;
			}
			
		}else if (a1[i][0]=='onerror'){
			onerrorvideo = a1[i][1];
		}
		
		if (a1[i][0]=='w' || a1[i][0]=='s'){
			// add to log
			logger.push([iscorrect,x+'_'+i,Math.floor(Date.now() / 1000),response]);
		}
		
		if (a1[i][0]=='w' && isnearlycorrect && errorcnter == 2){
			document.getElementById(x+'_'+i).value = a1[i][1][0];
		}
	}
	// nur wenn alles richtig
	if (allcorrect || errorcnter == errorcnter_max) {
		for (var i = 0; i < a1.length; i++){
			if (a1[i][0]=='w' || a1[i][0]=='s'){
				document.getElementById(x+'_'+i).disabled = true;
			}
		}
		hide(x+'b');
		taskNext();
	}else {
		if (errorcnter == 0 && onerrorvideo != null){
			tutorStart(onerrorvideo);
		}
		
		errorcnter++;
	}
}

function taskNext(){
	var next = tasklist.shift();
	if (next == null) {
		logalldata();
		makeend();
	}else view(next);
	window.scrollTo(0, document.body.scrollHeight);
	errorcnter = 0;
}
