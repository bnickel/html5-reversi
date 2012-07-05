var PieceState = {
        BLACK: -1,
        WHITE:  1,
        EMPTY:  0
    };

function Board(rows, columns, state) {
    var pieces = [];
    for(var i = 0, count = rows * columns; i < count; i ++) {
        pieces[i] = state;
    }
    
	this.__rows    = rows;
	this.__columns = columns;
    this.__pieces  = pieces;
}

Board.prototype = {
        getRows: function() { return this.__rows; },
        getColumns: function() { return this.__columns; },
    };

Board.prototype.clone = function() {
	var output = new Board(0, 0);
	output.__rows    = this.__rows;
	output.__columns = this.__columns;
    output.__pieces  = this.__pieces.slice(0);
	return output;
}

Board.prototype.getPiece = function(row, column) {
	return this.__pieces[this.__rows * (row - 1) + (column - 1)];
};

Board.prototype.setPiece = function(row, column, color) {
	return this.__pieces[this.__rows * (row - 1) + (column - 1)] = color;
};

Board.prototype.setPieces = function(changes) {
    changes.forEach(function(change) {
            this.setPiece(change.row, change.column, change.color);
        }, this);
};

Board.prototype.serialize = function() {
	return this.__rows + ',' + this.__columns + ',' + this.__pieces.join(',');
}

Board.deserialize = function(data) {
    var items = data.split(',').map(function(n){return Number(n)});
    var output = new Board(0, 0);
    output.__rows    = items[0];
    output.__columns = items[1];
    output.__pieces  = items.slice(2);
    return output;
}

function Change(row, column, color) {
	this.row = row;
	this.column = column;
	this.color = color;
}
