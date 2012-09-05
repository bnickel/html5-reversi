var PieceState = {
    BLACK: -1,
    WHITE:  1,
    EMPTY:  0
};

(function (window) {
    'use strict';

    function Board(rows, columns, state) {
        var pieces = [],
            index;

        for (index = rows * columns - 1; index >= 0; index -= 1) {
            pieces[index] = state;
        }

        this.rows    = rows;
        this.columns = columns;
        this.pieces  = pieces;
    }

    Board.prototype.rows = 0;
    Board.prototype.columns = 0;
    Board.prototype.pieces = null;

    /**
     * Performs a callback at every position in the game board.
     * 
     * @param {function(number piece, number row, number column, number index)} callback
     */
    Board.prototype.forEachPosition = function (callback, thisArg) {
        var row,
            column,
            index,
            result;

        for (row = this.rows; row > 0; row -= 1) {
            for (column = this.columns; column > 0; column -= 1) {
                index = this.positionToIndex(row, column);
                result = callback.call(thisArg || this, this.pieces[index], row, column, index);
                
                if (result === false) {
                    return;
                }
            }
        }
    };
    
    Board.prototype.forEachAroundPosition = function (row, column, callback, thisArg) {
        var r, c, index, result;
        
        for (r = row - 1; r <= row + 1; r += 1) {
            for (c = column - 1; c <= column + 1; c += 1) {
                if (r !== row && c !== column && this.contains(r, c)) {
                    index = this.positionToIndex(r, c);
                    result = callback.call(thisArg || this, this.pieces[index], r, c, index);
                
                    if (result === false) {
                        return;
                    }
                }
            }
        }
    };

    Board.prototype.forEachInDirection = function (row, column, deltaRow, deltaColumn, callback, thisArg) {
        var index,
            result;
        
        while (true) {
            row += deltaRow;
            column += deltaColumn;
            
            if (!this.contains(row, column)) {
                return;
            }
            
            index = this.positionToIndex(row, column);
            result = callback.call(thisArg || this, this.pieces[index], row, column, index);
            
            if (result === false) {
                return;
            }
        }
    };

    Board.prototype.clone = function () {
        var output = new Board(0, 0);

        output.rows    = this.rows;
        output.columns = this.columns;
        output.pieces  = this.pieces.slice(0);

        return output;
    };

    Board.prototype.positionToIndex = function (row, column) {
        return this.columns * (row - 1) + (column - 1);
    };

    Board.prototype.getPiece = function (row, column) {
        return this.pieces[this.positionToIndex(row, column)];
    };

    Board.prototype.setPiece = function (row, column, color) {
        this.pieces[this.positionToIndex(row, column)] = color;
    };

    Board.prototype.setPieces = function (changes) {
        changes.forEach(function (change) {
            this.setPiece(change.row, change.column, change.color);
        }, this);
    };
    
    Board.prototype.contains = function (row, column) {
        return row >= 1 && column >= 1 && row <= this.rows && column <= this.columns;
    };

    Board.prototype.serialize = function () {
        return this.rows + ',' + this.columns + ',' + this.pieces.join(',');
    };

    Board.deserialize = function (data) {
        var items = data.split(',').map(function (n) {
            return Number(n);
        }),
            output = new Board(0, 0);

        output.rows    = items[0];
        output.columns = items[1];
        output.pieces  = items.slice(2);

        return output;
    };


    function Change(row, column, color) {
        this.row = row;
        this.column = column;
        this.color = color;
    }

    window.Board = Board;
    window.Change = Change;

}(window));