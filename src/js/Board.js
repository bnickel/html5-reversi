var PieceState = {
        BLACK: -1,
        WHITE:  1,
        EMPTY:  0
    };

function Board(rows, columns, state) {
    var pieces = [];
    for (var index = rows * columns; index --;) {
        pieces[index] = state;
    }
    
    this.__rows    = rows;
    this.__columns = columns;
    this.__pieces  = pieces;
}

Board.prototype.getRows = function() {
    return this.__rows;
};

Board.prototype.getColumns = function() {
    return this.__columns;
};

/**
 * Performs a callback at every position in the game board.
 * 
 * 
 * @param {function(number piece, number row, number column, number index)}
 */
Board.prototype.forEachPosition = function (callback, thisArg) {
    var rows = this.getRows();
    var columns = this.getColumns();
    
    for (var row = rows; row > 0; row --) {
        for (var column = columns; column > 0; column --) {
            var index = this.positionToIndex(row, column);
        
            callback.call(thisArg || this, this.__pieces[index], row, column, index);
        }
    }
};

Board.prototype.clone = function() {
    var output = new Board(0, 0);
    output.__rows    = this.__rows;
    output.__columns = this.__columns;
    output.__pieces  = this.__pieces.slice(0);
    return output;
};

Board.prototype.positionToIndex = function (row, column) {
    return this.__columns * (row - 1) + (column - 1);
};

Board.prototype.getPiece = function(row, column) {
    return this.__pieces[this.positionToIndex(row, column)];
};

Board.prototype.setPiece = function(row, column, color) {
    return this.__pieces[this.positionToIndex(row, column)] = color;
};

Board.prototype.setPieces = function(changes) {
    changes.forEach(function(change) {
            this.setPiece(change.row, change.column, change.color);
        }, this);
};

Board.prototype.serialize = function() {
    return this.__rows + ',' + this.__columns + ',' + this.__pieces.join(',');
};

Board.deserialize = function(data) {
    var items = data.split(',').map(function(n){return Number(n)});
    var output = new Board(0, 0);
    output.__rows    = items[0];
    output.__columns = items[1];
    output.__pieces  = items.slice(2);
    return output;
};


function Change(row, column, color) {
    this.row = row;
    this.column = column;
    this.color = color;
};