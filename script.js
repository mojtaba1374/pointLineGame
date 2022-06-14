const N = 4;
const M = 4;

let turn = "R";
let selectedLines = [];
const score = {
	blue: 0,
	red: 0
};

const createGameStateArray = () => {
	let gameStateArray = new Array(N - 1);
	for(let i = 0; i < N - 1; i++) {
		gameStateArray[i] = new Array(M - 1);
	}
	
	for (let i = 0; i < gameStateArray.length; i++) {
		for(let j = 0; j < gameStateArray[0].length; j++) {
			gameStateArray[i][j] = {
				top: {tick: false, color: ''},
				right: {tick: false, color: ''},
				bottom: {tick: false, color: ''},
				left: {tick: false, color: ''}

			}
		}
	}
	return gameStateArray;
};

let gameStateArray = createGameStateArray();

const hoverClasses = { R: "hover-red", B: "hover-blue" };
const bgClasses = { R: "bg-red", B: "bg-blue" };

const playersTurnText = (turn) =>
	`It's ${turn === "R" ? "Red" : "Blue"}'s turn`;

const isLineSelected = (line) =>
	line.classList.contains(bgClasses.R) || line.classList.contains(bgClasses.B);

const createGameGrid = () => {
	const gameGridContainer = document.getElementsByClassName(
		"game-grid-container"
	)[0];

	const rows = Array(N)
		.fill(0)
		.map((_, i) => i);
	const cols = Array(M)
		.fill(0)
		.map((_, i) => i);


	rows.forEach((row) => {
		cols.forEach((col) => {
			const dot = document.createElement("div");
			dot.setAttribute("class", "dot");

			const hLine = document.createElement("div");
			hLine.setAttribute("class", `line-horizontal ${hoverClasses[turn]}`);
			hLine.setAttribute("id", `h-${row}-${col}`);
			hLine.addEventListener("click", handleLineClick);

			gameGridContainer.appendChild(dot);
			if (col < M - 1) gameGridContainer.appendChild(hLine);
		});

		if (row < N - 1) {
			cols.forEach((col) => {
				const vLine = document.createElement("div");
				vLine.setAttribute("class", `line-vertical ${hoverClasses[turn]}`);
				vLine.setAttribute("id", `v-${row}-${col}`);
				vLine.addEventListener("click", handleLineClick);

				const box = document.createElement("div");
				box.setAttribute("class", "box");
				box.setAttribute("id", `box-${row}-${col}`);
				
				gameGridContainer.appendChild(vLine);
				if (col < M - 1) gameGridContainer.appendChild(box);
			});
		}
	});
	document.getElementById("game-status").innerHTML = playersTurnText(turn);
};

const changeTurn = (color) => {
	if(color) {
		turn = color;
		return;
	}
	let nextTurn = turn === "R" ? "B" : "R";
	
	const lines = document.querySelectorAll(".line-vertical, .line-horizontal");
	
	lines.forEach((l) => {
		//if line was not already selected, change it's hover color according to the next turn
		if (!isLineSelected(l)) {
			l.classList.replace(hoverClasses[turn], hoverClasses[nextTurn]);
		}
	});
	turn = nextTurn;
};

const fillGameStateArray = (id, color) => {
	const idArr = id.split('-');
	
	const [typeId, rId, cId] = idArr;
	
	if(typeId === 'h') {
		if(+rId < gameStateArray.length) {
			gameStateArray[rId][cId].top = {tick: true, color: color};
		}
		if(+rId - 1 >= 0) {
			gameStateArray[rId - 1][cId].bottom = {tick: true, color: color};
		}
	}

	if(typeId === 'v') {
		if(+cId < gameStateArray[0].length) {
			gameStateArray[rId][cId].left = {tick: true, color: color};
		}
		if(+cId - 1 >= 0) {
			gameStateArray[rId][cId - 1].right = {tick: true, color: color};
		}
	}
};

const winnerFinder = (color) => {
	let boxWinned;

	let i = 0;
	for(const row of gameStateArray) {
		let j = 0;
		for(const box of row) {
			boxWinned = true;
			for(const dir in box) {
				if(box[dir].tick) {
					continue;
				} else {
					boxWinned = false;
				}
			}
			boxWinned &&updateWinnerUi(color, i, j);
			j++;
		}
		i++;
	}
};

const updateWinnerUi = (color, row, col) => {
	let box = document.getElementById(`box-${row}-${col}`);

	
	// turn = color === 'red' ? 'B' : 'R';
	
	if(box.classList.contains('blue-box') || box.classList.contains('red-box')) {
		return;
	};
	
	document.getElementById("game-status").innerHTML = 
		playersTurnText(color === 'red' ? 'R' : 'B');
	changeTurn(color === 'red' ? 'B' : 'R');

	let classAdded = color === 'blue' ? 'blue' : 'red';

	box.classList.add(`${classAdded}-box`);

	updateUsersScore(color);
}

const updateUsersScore = (color) => {

	const redElement = document.querySelector('.red-score span');
	const blueElement = document.querySelector('.blue-score span');
	let redScore = parseInt(redElement.innerText);
	let blueScore = parseInt(blueElement.innerText);

	if(color === 'red') {
		redScore  += 1;
		redElement.innerHTML = redScore;
	} else if(color === 'blue') {
		blueScore  += 1;
		blueElement.innerHTML = blueScore;
	}

	if(redScore + blueScore === gameStateArray.length ** 2) {
		Modal(redScore, blueScore);
	}
}

const Modal = (redScore, blueScore) => {

	let winner = redScore > blueScore ? 'red' : 'blue';

	const body = document.body;
	const modal = document.createElement('div');
	const backdrop = document.createElement('div');
	modal.classList.add('modal');
	backdrop.classList.add('backdrop');
	modal.innerHTML = `
		<div class="winner-box">
			<h2>${winner} player win</h2>
		</div>
		<div class="red">
			<h3>red score <span>${redScore}</span></h3>
		</div>
		<div class="blue">
			<h3>blue score <span>${blueScore}</span></h3>
		</div>
		<button class="retry-game">Retry Game</button>
	`;
	body.append(backdrop);
	body.append(modal);

	const retryButton = document.querySelector('.retry-game');
	retryButton.addEventListener('click', retryGameHandler)
};

const retryGameHandler = () => {
	location.reload();
}

const handleLineClick = (e) => {

	const lineId = e.target.id;
	
	const selectedLine = document.getElementById(lineId);
	
	if (isLineSelected(selectedLine)) {
		//if line was already selected, return
		return;
	}
	
	selectedLines = [...selectedLines, lineId];
	// console.log(selectedLines);
	
	colorLine(selectedLine);
	
	const lineColor = e.target.classList.contains('bg-red') ? 'red' : 'blue';

	document.getElementById("game-status").innerHTML = 
		playersTurnText(lineColor === 'red' ? 'B' : 'R');
	
	// check whether winner is find
	fillGameStateArray(lineId, lineColor);
	winnerFinder(lineColor);

	changeTurn();
};

const colorLine = (selectedLine) => {
	selectedLine.classList.remove(hoverClasses[turn]);
	selectedLine.classList.add(bgClasses[turn]);
};

createGameGrid();
