var BLACK = -1;
var WHITE =  1;
var EMPTY =  0;

function Board(rows, columns, value)
{
	this.rows = rows;
	this.columns = columns;
	for(var i = 0; i < rows * columns; i ++)
		this[i] = value;
}

Board.inheritsFrom(Array);

Board.prototype.clone = function()
{
	var output = new Board(0, 0);
	output.rows = this.rows;
	output.columns = this.columns;
	for(var i = 0; i < this.rows * this.columns; i ++)
		output[i] = this[i];
	return output;
}

Board.prototype.getPiece = function(row, column)
{
	return this[this.rows * (row - 1) + (column - 1)];
}

Board.prototype.setPiece = function(row, column, color)
{
	this[this.rows * (row - 1) + (column - 1)] = color;
}

Board.prototype.setPieces = function(changes)
{
	for(var i = 0; i < changes.length; i ++)
		this.setPiece(changes[i].row, changes[i].column, changes[i].color);
}

Board.prototype.serialize = function()
{
	var size = this.rows * this.columns;
	var output = this.rows + "," + this.columns;
	for(var i = 0; i < size; i++)
		output += "," + this[i];
	return output;
}

Board.deserialize = function(data)
{
	var arr = data.split(",");
	function _(x) {return parseInt(arr[x]);}
	var rows = _(0);
	var cols = _(1);
	var board = new Board(rows, cols, EMPTY);
	for(var i = 0; i < rows * cols; i++)
		board[i] = _(i+2);
	return board;
}


function Change(row, column, color)
{
	this.row = row;
	this.column = column;
	this.color = color;
}
