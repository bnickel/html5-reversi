var MAX_RANK = 2147483583;
var DEFAULT_ALPHA = MAX_RANK + 64;
var DEFAULT_BETA  = -DEFAULT_ALPHA;

if(importScripts != undefined)
	importScripts("Helper.js", "Board.js", "GameModel.js", "ReversiGameModel.js");

onmessage = function(event)
{
	var data = event.data.split(";");
	var model = new ReversiGameModel(0,0);
	model.setBoard(Board.deserialize(data[2]));
	model.useComplexStats(true);
	model.supressTurnValidation(true);
	
	var color = parseInt(data[1]);
	var difficulty = data[0];
	var bestMove = getBestMove(model, color, difficulty);
	postMessage(bestMove.row + "," + bestMove.column + "," + bestMove.color);
}

function getBestMove(model, color, difficulty)
{
	var ai = new AILevel(difficulty, model);
	return model.getBestMove(ai, color, 0, DEFAULT_ALPHA, DEFAULT_BETA);
}

function rand(num)
{
	return Math.floor(Math.random() * num);
}


ReversiGameModel.prototype.getBestMove = function(ai, color, depth, alpha, beta)
{
	var bestMove = undefined;

	var validMoves = this.getValidMoves(color);

	// Choose a random starting place on the board.
	var randOffset = rand(validMoves.length);
	
	// Check every move.
	for(var i = 0; i < validMoves.length; i++)
	{
		// Make the move.
		var testMove = validMoves[(randOffset + i) % validMoves.length];
		var testModel = this.clone();
		testModel.move(testMove.row, testMove.column, testMove.color);
		var score = testModel.getWhiteScore() - testModel.getBlackScore();

		// Check the board.
		var nextColor = -color;
		var forfeit = 0;
		var isEndGame = false;
		var opponentValidMoves = testModel.getValidMoveCount(nextColor);
		if (opponentValidMoves == 0)
		{
			// The opponent cannot move, count the forfeit.
			forfeit = color;

			// Switch back to the original color.
			nextColor = -nextColor;

			// If that player cannot make a move either, the
			// game is over.
			if (!testModel.getValidMoveCount(nextColor) > 0)
				isEndGame = true;
		}

		// If we reached the end of the look ahead (end game or
		// max depth), evaluate the board and set the move
		// rank.
		if (isEndGame || depth == ai.lookAheadDepth)
		{
			// For an end game, max the ranking and add on the
			// final score.
			if (isEndGame)
			{
				// Negative value for black win.
				if (score < 0)
					testMove.rank = -MAX_RANK + score;

				// Positive value for white win.
				else if (score > 0)
					testMove.rank = MAX_RANK + score;

				// Zero for a draw.
				else
					testMove.rank = 0;
			}

			// It's not an end game so calculate the move rank.
			else
				testMove.rank =
					ai.forfeitWeight   * forfeit +
					ai.frontierWeight  * (testModel.getBlackFrontierCount() - testModel.getWhiteFrontierCount()) +
					ai.mobilityWeight  * color * (validMoves.length - opponentValidMoves) +
					ai.stabilityWeight * (testModel.getWhiteSafeCount() - testModel.getBlackSafeCount()) +
										 score;
		}

		// Otherwise, perform a look ahead.
		else
		{
			var nextMove = testModel.getBestMove(ai, nextColor, depth + 1, alpha, beta);

			// Pull up the rank.
			testMove.rank = nextMove.rank;

			// Forfeits are cumulative, so if the move did not
			// result in an end game, add any current forfeit
			// value to the rank.
			if (forfeit != 0 && Math.abs(testMove.rank) < MAX_RANK)
				testMove.rank += ai.forfeitWeight * forfeit;

			// Adjust the alpha and beta values, if necessary.
			if (color == PieceState.WHITE && testMove.rank > beta)
				beta = testMove.rank;
			if (color == PieceState.BLACK && testMove.rank < alpha)
				alpha = testMove.rank;
		}

		// Perform a cutoff if the rank is outside tha alpha-beta range.
		if (color == PieceState.WHITE && testMove.rank > alpha)
		{
			testMove.rank = alpha;
			return testMove;
		}

		if (color == BLACK && testMove.rank < beta)
		{
			testMove.rank = beta;
			return testMove;
		}

		// If this is the first move tested, assume it is the
		// best for now.
		if (bestMove == undefined)
			bestMove = testMove;

		// Otherwise, compare the test move to the current
		// best move and take the one that is better for this
		// color.
		else if (color * testMove.rank > color * bestMove.rank)
			bestMove = testMove;
	}

	// Return the best move found.
	return bestMove;
}

Change.prototype.rank = 0;

function AILevel(difficulty, model)
{
	if(difficulty == "easy")
	{
		this.forfeitWeight      =  2;
		this.frontierWeight     =  1;
		this.mobilityWeight     =  0;
		this.stabilityWeight    =  3;
		this.difficulty         =  1;
	}
	else if(difficulty == "medium")
	{
		this.forfeitWeight      =  3;
		this.frontierWeight     =  1;
		this.mobilityWeight     =  0;
		this.stabilityWeight    =  5;
		this.difficulty         =  2;
	}
	else if(difficulty == "hard")
	{
		this.forfeitWeight      =  7;
		this.frontierWeight     =  2;
		this.mobilityWeight     =  1;
		this.stabilityWeight    = 10;
		this.difficulty         =  3;
	}
	else if(difficulty == "expert")
	{
		this.forfeitWeight      = 35;
		this.frontierWeight     = 10;
		this.mobilityWeight     =  5;
		this.stabilityWeight    = 50;
		this.difficulty         =  4;
	}
	else
	{
		this.forfeitWeight      =  0;
		this.frontierWeight     =  0;
		this.mobilityWeight     =  0;
		this.stabilityWeight    =  0;
		this.difficulty         =  0;
	}

	// Set the look-ahead depth.
	this.lookAheadDepth = this.difficulty + 3;

	// Near the end of the game, when there are relatively few moves
	// left, set the look-ahead depth to do an exhaustive search.
	if (model.getEmptySquares() <= this.difficulty + 9)
		this.lookAheadDepth = model.getEmptySquares();
}

