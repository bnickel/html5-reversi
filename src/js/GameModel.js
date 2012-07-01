function GameModel(rows, columns)
{
	this.__board = new Board(rows, columns, EMPTY);
	this.__turn = EMPTY;
	this.__blackIsInteractive = true;
	this.__whiteIsInteractive = true;
	this.__isGameOver = true;
}

__enableEvents(GameModel);



GameModel.prototype.newGame = function(firstTurn)
{
	this.__turn = firstTurn != undefined ? firstTurn : BLACK;
	this.setGameOver(false);
}

GameModel.prototype.simulateMove = function(row, column, color)
{
	return false;
}

GameModel.prototype.move = function(row, column, color)
{
	return false;
}

GameModel.prototype.canMove = function(row, column, color)
{
	return false;
}

GameModel.prototype.playerCanMove = function(color)
{
	var rows = this.getRows();
	var columns = this.getColumns();
	for(var r = 1; r <= rows; r ++)
		for(var c = 1; c <= columns; c++)
			if(this.canMove(r, c, color))
				return true;
	
	return false;
}

GameModel.prototype.getValidMoves = function(color)
{
	var moves = [];
	var rows = this.getRows();
	var columns = this.getColumns();
	for(var r = 1; r <= rows; r ++)
		for(var c = 1; c <= columns; c++)
			if(this.canMove(r, c, color))
				moves.push(new Change(r, c, color));
	
	return moves;
}

GameModel.prototype.getValidMoveCount = function(color)
{
	return this.getValidMoves(color).length;
}

GameModel.prototype.getTurn = function()
{
	return this.__turn;
}

GameModel.prototype.setTurn = function(color)
{
	var oldInteractive = this.isInteractive();
	var oldTurn = this.__turn;
	this.__turn = color;
	var newInteractive = this.isInteractive();
	
	if(oldInteractive != newInteractive)
		this.onInteractiveChanged({oldValue: oldInteractive, newValue: newInteractive});
	this.onTurnChanged({oldTurn: oldTurn, newTurn: color, isInteractive: newInteractive});
}



GameModel.prototype.isGameOver = function()
{
	return this.__isGameOver;
}

GameModel.prototype.setGameOver = function(value)
{
	var newValue = value ? true : false;
	
	if(this.__isGameOver == newValue)
		return;
	
	this.__isGameOver = newValue;
	
	if(newValue)
	{
		this.setTurn(EMPTY);
		this.onGameOver({});
	}
}



GameModel.prototype.isInteractive = function()
{
	if(this.getTurn() == BLACK)
		return this.__blackIsInteractive;
	
	if(this.getTurn() == WHITE)
		return this.__whiteIsInteractive;
	
	return false;
}

GameModel.prototype.setInteractive = function(color, value)
{
	var oldInteractive = this.isInteractive();
	
	if(color == BLACK)
		this.__blackIsInteractive = value ? true : false;
	
	if(color == WHITE)
		this.__whiteIsInteractive = value ? true : false;

	var newInteractive = this.isInteractive();
	
	if(oldInteractive != newInteractive)
		this.onInteractiveChanged({oldValue: oldInteractive, newValue: newInteractive});
}



GameModel.prototype.getRows = function()
{
	return this.__board.rows;
}

GameModel.prototype.getColumns = function()
{
	return this.__board.columns;
}

GameModel.prototype.setPieces = function(changes)
{
	this.__board.setPieces(changes);
	this.clearSimulation();
	this.onBoardChanged({changes: changes});
}

GameModel.prototype.getPiece = function(row, column)
{
	return this.__board.getPiece(row, column);
}

GameModel.prototype.setBoard = function(board)
{
	this.__board = board;
	this.clearSimulation();
	this.onBoardChanged({});
}

GameModel.prototype.getBoard = function()
{
	return this.__board;
}

GameModel.prototype.setSimulation = function(changes)
{
	this.__simulation = this.__board.clone();
	this.__simulation.setPieces(changes);
	this.onSimulationChanged({});
}

GameModel.prototype.clearSimulation = function()
{
	if(this.__simulation == undefined)
		return;
	
	this.__simulation = undefined;
	this.onSimulationChanged({});
}

GameModel.prototype.getSimulatedPiece = function(row, column)
{
	if(this.__simulation)
		return this.__simulation.getPiece(row, column);
	return undefined;
}



GameModel.prototype.clone = function(model)
{
	if(model == undefined)
		model = new GameBoardBackend(0,0);

	model.__board = this.__board.clone();
	model.__turn = this.__turn;
	model.__blackIsInteractive = this.__blackIsInteractive;
	model.__whiteIsInteractive = this.__whiteIsInteractive;
	
	return model;
}



GameModel.prototype.onMove = function(eventArgs)
{
	this.evokeEvent("move", eventArgs);
}

GameModel.prototype.onNewGame = function(eventArgs)
{
	this.evokeEvent("newgame", eventArgs);
}

GameModel.prototype.onGameOver = function(eventArgs)
{
	this.evokeEvent("gameover", eventArgs);
}

GameModel.prototype.onTurnChanged = function(eventArgs)
{
	this.evokeEvent("turnchanged", eventArgs);
}

GameModel.prototype.onInteractiveChanged = function(eventArgs)
{
	this.evokeEvent("interactivechanged", eventArgs);
}

GameModel.prototype.onBoardChanged = function(eventArgs)
{
	this.evokeEvent("boardchanged", eventArgs);
}

GameModel.prototype.onSimulationChanged = function(eventArgs)
{
	this.evokeEvent("simulationchanged", eventArgs);
}