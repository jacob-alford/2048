let newGame;
let oddsOfTwo = [3,4]; //[x/y] chance
let oddsOfFour = [oddsOfTwo[1]-oddsOfTwo[0],oddsOfTwo[1]]; //[z/y] chance
let colorResolve;

function twoOrFour(){
	let oddsArray = [];
	for(i=0;i<oddsOfTwo[0];i++){
		oddsArray.push(2);
	}
	for(i=0;i<oddsOfFour[0];i++){
		oddsArray.push(4);
	}
	return random(oddsArray);
}

function postTiles(num){
	if(num == 4 || num == 3){
		return 2;
	}else if(num == 2 || num == 1){
		return 1;
	}else{
		return 0;
	}
}

function arrayFromTensor(options){
	let output = [];
	let input = options.tensor.dataSync();
	for(let q=0;q<16;q+=4){
			output.push(input.slice(q,q+4));
	}
	return output;

}

function arrayHasMiddleZeroes(options){ //a four-tile one dimensional array, returns a boolean if the array contains zeros on the side specfiied in options
	let whiteSpace = false;
	let nonzero = false;
	options.array  = new Int32Array(options.array);
	if(options.array.some((element, index, array) => element != 0)){
			nonzero = true;
	}
	if(options.direction == "right"){
	options.array.reverse();
	}
	if(nonzero && options.array[0] == 0){
		whiteSpace = true;
	}else{
		if(options.array.slice(1,4).some((element, index, array) => element != 0)){
				nonzero = true;
		}else{
			nonzero = false;
		}
		if(nonzero && options.array[1] == 0){
			whiteSpace = true;
		}else{
			if(options.array[2] != 0){
				whiteSpace = false;
			}else if(options.array[2] == 0 && options.array[3] != 0){
				whiteSpace = true;
			}
			}
		}
		return whiteSpace;
}

function reTileTranspose(array){ //Transposes an array of tiles - returns a transposed array of tiles
	let workingArray = [[],[],[],[]];
	let outputArray = [[],[],[],[]];
	const temp = outputArray;
	console.log(temp);
	for(let y=0;y<4;y++){
		for(let u=0;u<4;u++){
			outputArray[y][u] = new tile(0);
			workingArray[y][u] = array[y][u].value;
		}
	}
	console.log(outputArray);

	let tensora = tf.tensor2d(workingArray).transpose();
	let objArray = arrayFromTensor({tensor:tensora,sliceLength:4});
	for(let q=0;q<4;q++){
		for(let w=0;w<4;w++){
			outputArray[q][w].value = objArray[q][w];
		}
	}

	tf.dispose(tensora);
	return outputArray;
}

function transpose(array) {
  return array.reduce(
    (prev, next) => next.map((item, i) => (prev[i] || []).concat(next[i])),
    []
  );
}

function updateBoardState(options){ //Takes an array, returns the compressed board based on direction
	console.log(options);
	const currentState = options.array;
	console.log(currentState);
	const reverseCurrentState = arrayReverse(currentState); //For down
	const inverseState = transpose(currentState); //For left
	const inverseReverseState = arrayReverse(transpose(currentState)); //For Right

	if(options.direction == "up"){
		var choosenState = {state:currentState,direction:"left"};
	}else if(options.direction == "down"){
		var choosenState = {state:reverseCurrentState,direction:"right"};
	}else if(options.direction == "left"){
		var choosenState = {state:inverseState,direction:"left"};
	}else if(options.direction == "right"){
		var choosenState = {state:inverseReverseState,direction:"right"};
	}
	console.log(choosenState);
	for(let i=0;i<4;i++){
		if(arrayHasMiddleZeroes({array:choosenState.state[i],direction:choosenState.direction})){
			choosenState.state[i] = arrayShift(choosenState.state[i]);
		}
		for(let j=0;j<2;j++){
			if(choosenState.state[i][j].isCompatible(choosenState.state[i][j+1].value)){
				choosenState.state[i][j] = choosenState.state[i][j].merge(choosenState.state[i][j+1]);
				choosenState.state[i][j+1].clear();
			}
			if(arrayHasMiddleZeroes({array:choosenState.state[i],direction:choosenState.direction})){
				choosenState.state[i] = arrayShift(choosenState.state[i]);
			}
		}
	}
	console.log(choosenState.state);
	let output;
	if(options.direction == "up"){
		output = choosenState.state;
	}else if(options.direction == "down"){
		output = arrayReverse(choosenState.state);
	}else if(options.direction == "left"){
		output = transpose(choosenState.state);
	}else if(options.direction == "right"){
		output = transpose(arrayReverse(choosenState.state));
	}
	return output;

}

function arrayValues(arr){
	let theOut = [];
	for(let p=0;p<4;p++){
		theOut[p] = arr[p].value;
	}
	return theOut;
}

function arrayReverse(array){ //Takes a 4x4 matrix, reverses the columns
	let output = [];
	for(cols in array){
		output.push(array[cols].reverse());
	}
	return output;
}

function arrayShift(array){ //Takes an array of 1x4 tiles, returns an array where the zeroes have been replaced by the next object
	let workingArray = [];
	for(let l = 0;l<array.length;l++){
		workingArray.push(array[l].value);
	}
	let counter = 0;
	for(let x=0;x<array.length;x++){
		if(workingArray[x] == 0){
			counter++;
		}
	}
	for(let j=0;j<counter;j++){
		workingArray.splice(workingArray.indexOf(0),1);
		workingArray.push(0);
	}
	let output = [];
	for(let k=0;k<workingArray.length;k++){
		output[k] = new tile(workingArray[k]);
	}
	return output;
}

function gameboard(){ //Game board object constructor/initializer
	this.grid = [[],[],[],[]];
	for(array in this.grid){
		for(i=0;i<4;i++){
			this.grid[i].push(new tile(0));
		}
	}
	this.grid[Math.floor(random(0,4))][Math.floor(random(0,4))] = new tile();
	this.generate = () => {
		let positionsOfZero = [];
		for(cols in this.grid){
			for(rows in this.grid[cols]){
				if(this.grid[cols][rows].value == 0){
					positionsOfZero.push([cols,rows]);
				}
			}
		}
			let randomPosition = random(positionsOfZero);
			this.grid[randomPosition[0]][randomPosition[1]] = new tile();
	}
	this.hasMoves = () => {
		let output = 0;
		if(this.whitespace() == 0){
			for(cols in this.grid){
				for(rows=0;rows<3;rows++){
					if(!this.grid[cols][rows].isCompatible(this.grid[cols][rows + 1].value)){
						output++;
					}
					if(!this.grid[rows][cols].isCompatible(this.grid[rows + 1][cols].value)){
						output++;
					}
				}
			}
			if(output == 24){
				return false;
			}else{
				return true;
			}
		}else{
			return true;
		}
	}
	this.whitespace = () => {
		let output = 0;
		for(cols in this.grid){
			for(rows in this.grid[cols]){
				if(this.grid[cols][rows].value == 0){
					output++;
				}
			}
		}
		return output;
	}
	this.action = (options) => {
		const printLn3 = this.grid;
		console.log(printLn3);
		const updatedBoardState = updateBoardState({array:this.grid,direction:options.direction});
		console.log(updatedBoardState);
		this.generate();
	}
}

function tile(init){
	if(init === undefined){
		this.value = twoOrFour();
	}else{
		this.value = init;
	}
	this.add = (num) => this.value += num;
	this.isCompatible = (num) => (num == this.value) ? true:false;
	this.clear = () => this.value = 0;
	this.merge = (t) => {
	}
}


function setup() {
	colorResolve = {
		"2":color(185,156,107),
		"4":color(219,202,105),
		"8":color(213,117,0),
		"16":color(143,59,27),
		"32":color(189,208,156),
		"64":color(102,141,60),
		"128":color(64,79,36),
		"256":color(163,173,184),
		"512":color(131,146,159),
		"1024":color(78,97,114),
		"2048":color(255,76,255),
		"4096":color(204,0,204),
		"8192":color(127,38,127),
		"16384":color(138,215,243),
		"32768":color(64,193,241),
		"65536":color(30,91,113)
	};
	createCanvas(800, 800);
	newGame = new gameboard();
	const printLn1 = newGame;
	console.log(printLn1);
}

function keyPressed(){
	const printLn2 = newGame;
	console.log(printLn2);
	if(keyCode === UP_ARROW){
		newGame.action({direction:"up"});
	}else if(keyCode === RIGHT_ARROW){
		newGame.action({direction:"right"});
	}else if(keyCode === LEFT_ARROW){
		newGame.action({direction:"left"});
	}else if(keyCode === DOWN_ARROW){
		newGame.action({direction:"down"});
	}
}

function draw() {
	if(!newGame.gameOver){
		stroke(0);
		textAlign(CENTER,CENTER);
		textSize(64);
		for(cols in newGame.grid){
			for(rows in newGame.grid[cols]){
				if(!(colorResolve[newGame.grid[cols][rows].value.toString()]===undefined)){
					fill(colorResolve[newGame.grid[cols][rows].value.toString()]);
					rect(cols*200,rows*200,200,200);
					fill(0);
					text(newGame.grid[cols][rows].value,cols*200 + 100, rows*200 + 100);
				}else{
					fill(255);
					rect(cols*200,rows*200,200,200);
					fill(0);
					text(`${cols}, ${rows}`,cols*200 + 100, rows*200 + 100);
				}
			}
		}
	}else{
		text("Game over!", 400, 400);
	}
}
