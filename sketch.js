let newGame;
let oddsOfTwo = [3,4]; //Determines the odds that a 2-valued tile wil be generated.  e.g. [3,4] represents a three/four chance.
let oddsOfFour = [oddsOfTwo[1]-oddsOfTwo[0],oddsOfTwo[1]]; //The odds that a 4-valued tile will be generated.
let colorResolve;
let gameOverState = [];
let gameboardDimensions = 800; //The size of the full board
let tileDimensions = gameboardDimensions/4; //The size of an individual tile

//randomly chooses either a two or a four based on the above odds.
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

//Takes an array of tiles in 'array' and returns an array of their values
function arrayValues(array){
	const	input = array;
	let output = [];
		for(let j=0;j<4;j++){
			output.push(input[j].value);
		}
	return output;
}

//Takes a four-item array (of numbers) and checks if the array has zeroes in between two nonzero values.
//Useful to tell if the array can/needs to be shifted.
function arrayHasMiddleZeroes(options){
	const tempArray = options
	let whiteSpace = false;
	let nonzero = false;
	let workingArray  = new Int32Array(arrayValues(tempArray));
	if(workingArray.some((element, index, array) => element != 0)){
			nonzero = true;
	}
	if(nonzero && workingArray[0] == 0){
		whiteSpace = true;
	}else{
		if(workingArray.slice(1,4).some((element, index, array) => element != 0)){
				nonzero = true;
		}else{
			nonzero = false;
		}
		if(nonzero && workingArray[1] == 0){
			whiteSpace = true;
		}else{
			if(workingArray[2] != 0){
				whiteSpace = false;
			}else if(workingArray[2] == 0 && workingArray[3] != 0){
				whiteSpace = true;
			}
			}
		}
		return whiteSpace;
}

//Transposes a 4x4 matrix of any type
function transpose(array){
	let output = [[],[],[],[]];
	for(let p=0;p<array.length;p++){
		for(let q=0;q<array.length;q++){
			output[p].push(array[q][p]);
		}
	}
	return output;
}

//The primary function called when an action is executed.
//Takes an argument 'options' which references a particular direction.
//Will transpose and/or reverse based on options
//Returns a 4x4 array of a compressed game state
function updateBoardState(options){
	if(options.direction == "up"){
		const currentState = options.array;
		var choosenState = currentState;
	}else if(options.direction == "down"){
		const reverseCurrentState = arrayReverse(options.array);
		var choosenState = reverseCurrentState;
	}else if(options.direction == "left"){
		const inverseState = transpose(options.array);
		var choosenState = inverseState;
	}else if(options.direction == "right"){
		const inverseReverseState = arrayReverse(transpose(options.array));
		var choosenState = inverseReverseState;
	}
	for(let i=0;i<4;i++){
		if(arrayHasMiddleZeroes(choosenState[i])){
			choosenState[i] = arrayShift(choosenState[i]);
		}
		for(let j=0;j<3;j++){
			if(choosenState[i][j].value == choosenState[i][j+1].value){
				choosenState[i][j] = new tile(choosenState[i][j].value + choosenState[i][j+1].value);
				choosenState[i][j+1].clear();
			}
			if(arrayHasMiddleZeroes(choosenState[i])){
				choosenState[i] = arrayShift(choosenState[i]);
			}
		}
	}
	if(options.direction == "up"){
		var output = choosenState;
	}else if(options.direction == "down"){
		var output = arrayReverse(choosenState);
	}else if(options.direction == "left"){
		var output = transpose(choosenState);
	}else if(options.direction == "right"){
		var output = transpose(arrayReverse(choosenState));
	}
	return output;
}

//Reverses the collumns of a 4x4 array of any type.
function arrayReverse(array){
	const input = array;
	let output = [];
	for(let h=0;h<4;h++){
		output.push(input[h].reverse());
	}
	return output;
}

//Shifts tiles such that the spaces that contain zero are replaced with the relevant index.
//Takes an array of four values, returns a shifted 4x1 array
function arrayShift(array){
	const input = array;
	let workingArray = [];
	for(let l = 0;l<input.length;l++){
		workingArray.push(input[l].value);
	}
	let counter = 0;
	for(let x=0;x<input.length;x++){
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

//The primary gameboard constructor
function gameboard(){
	this.grid = [[],[],[],[]];
	for(array in this.grid){
		for(i=0;i<4;i++){
			this.grid[i].push(new tile(0));
		}
	}
	this.grid[Math.floor(random(0,4))][Math.floor(random(0,4))] = new tile();
	//Generates new zero-tiles in random available spots
	this.generate = () => {
		if(this.whitespace()){
			let positionsOfZero = [];
			for(let z=0;z<4;z++){
				for(let x=0;x<4;x++){
					if(this.grid[z][x].value == 0){
						positionsOfZero.push([z,x]);
					}
				}
			}
				let randomPosition = random(positionsOfZero);
				this.grid[randomPosition[0]][randomPosition[1]] = new tile();
		}
	}
	//The number of zero-tiles in this.grid
		this.whitespace = () => {
			let output = 0;
			for(let p=0;p<4;p++){
				for(let q=0;q<4;q++){
					if(this.grid[p][q].value == 0){
						output++;
					}
				}
			}
			return output;
		}
	//Returns true or false given the avaible moves on the board
	this.hasMoves = () => {
		if(this.whitespace() == 0){
			for(let x=0;x<3;x++){
				for(let y=0;y<3;y++){
					if(this.grid[x][y].value == this.grid[x][y + 1].value){
						return true;
					}
					if(this.grid[x][y] == this.grid[x + 1][y].value){
						return true;
					}
				}
				if(this.grid[x][3].value == this.grid[x+1][3].value){
					return true;
				}
				if(this.grid[3][x].value == this.grid[3][x+1].value){
					return true;
				}
			}
			let tempGameOverState = [];
			for(let p=0;p<4;p++){
				for(let e=0;e<4;e++){
					tempGameOverState.push(this.grid[p][e].value);
				}
			}
			gameOverState = tempGameOverState.toString();
			return false;
	}else{
		return true;
	}
}
//The primary command execution
	this.action = (options) => {
		let tempConfig = [];
		for(let no=0;no<4;no++){
			for(let u=0;u<4;u++){
				tempConfig.push(this.grid[no][u].value);
			}
		}
		const pastConfig = tempConfig.toString();
		this.grid = updateBoardState({array:this.grid,direction:options.direction});
		tempConfig = [];
		for(let o=0;o<4;o++){
			for(let k=0;k<4;k++){
				tempConfig.push(this.grid[o][k].value);
			}
		}
		const currentConfig = tempConfig.toString();
		if(pastConfig != currentConfig){
			setTimeout(()=>this.generate(),100);
		}
	}
}

//The tiles that are instanciated in the above gameboard constructor's this.grid.
function tile(init){
	if(init === undefined){
		this.value = twoOrFour();
	}else{
		this.value = init;
	}
	this.add = (num) => this.value += num;
	this.clear = () => this.value = 0;
	this.merge = t => new tile(this.value + t.value);
}

//p5 setup function
function setup() {
	//The colors of different valued tiles
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
	createCanvas(gameboardDimensions, gameboardDimensions);
	newGame = new gameboard();
}

//[p5] Execute the relevant action given keyboard input
function keyPressed(){
	const printLn2 = newGame;
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

//[p5] Redraw the canvas
function draw() {
	if(newGame.hasMoves()){
		stroke(0);
		textAlign(CENTER,CENTER);
		textSize(64);
		for(cols in newGame.grid){
			for(rows in newGame.grid[cols]){
				if(!(colorResolve[newGame.grid[cols][rows].value.toString()]===undefined)){
					fill(colorResolve[newGame.grid[cols][rows].value.toString()]);
					rect(cols*tileDimensions,rows*tileDimensions,tileDimensions,tileDimensions);
					fill(0);
					text(newGame.grid[cols][rows].value,cols*tileDimensions + tileDimensions/2, rows*tileDimensions + tileDimensions/2);
				}else{
					fill(240);
					rect(cols*tileDimensions,rows*tileDimensions,tileDimensions,tileDimensions);
				}
			}
		}
	}else{
		let finalGrid = gameOverState.split(",");
		let preTileGrid = [];
		for(let j=0;j<4;j++){
				preTileGrid.push(finalGrid.slice(4*j,4*j+4));
		}
		for(let a=0;a<4;a++){
			for(let b=0;b<4;b++){
				newGame.grid[a][b] = new tile(preTileGrid[a][b]);
			}
		}
		stroke(0);
		textAlign(CENTER,CENTER);
		textSize(64);
		for(cols in newGame.grid){
			for(rows in newGame.grid[cols]){
				if(!(colorResolve[newGame.grid[cols][rows].value.toString()]===undefined)){
					fill(colorResolve[newGame.grid[cols][rows].value.toString()]);
					rect(cols*tileDimensions,rows*tileDimensions,tileDimensions,tileDimensions);
					fill(0);
					text(newGame.grid[cols][rows].value,cols*tileDimensions + tileDimensions/2, rows*tileDimensions + tileDimensions/2);
				}else{
					fill(240);
					rect(cols*tileDimensions,rows*tileDimensions,tileDimensions,tileDimensions);
				}
			}
		}
		fill('rgba(255,204,0,.4)');
		rect(0,0,width,height);
		fill(0);
		text("Game over!", gameboardDimensions/2, gameboardDimensions/2);
		noLoop();
	}
}
