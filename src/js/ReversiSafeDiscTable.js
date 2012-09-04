(function () {
    'use strict';

    function ReversiSafeDiscTable(board) {
        this.setBoard(board);
    }

    ReversiSafeDiscTable.prototype.board = null;
    ReversiSafeDiscTable.prototype.table = null;
    
    ReversiSafeDiscTable.prototype.update = function () {
        var newSafeDiscDetected = false;
        
        this.board.forEachPosition(function (color, row, column) {
        
            if (color === PieceState.EMPTY
                    || this.isSafe(row, column)
                    || this.isOutflankable(row, column)) {
                return;
            }
                
            this.markAsSafe(row, column);
            newSafeDiscDetected = true;
        }, this);
            
        if (newSafeDiscDetected) {
            this.update();
        }
    };
    
    ReversiSafeDiscTable.prototype.isSafe = function (row, column) {
        return this.table.getPiece(row, column);
    };
    
    ReversiSafeDiscTable.prototype.markAsSafe = function (row, column) {
        return this.table.setPiece(row, column, true);
    };
    
    ReversiSafeDiscTable.prototype.setBoard = function (board) {
        this.board = board;
        this.table = new Board(board.rows, board.columns, false);
        this.update();
    };
    
    ReversiSafeDiscTable.prototype.isUnsafe = function (row, column, color) {
        return this.board.getPiece(row, column) !== color || !this.isSafe(row, column);
    };

    ReversiSafeDiscTable.prototype.isEmpty = function (row, column) {
        return this.board.getPiece(row, column) === PieceState.EMPTY;
    };

    
    ReversiSafeDiscTable.prototype.checkSafety = function (row, column, dr, dc, color) {
        var result = {
                hasSpace: false,
                isUnsafe: false
            },
            r,
            c;

        for (r = row + dr, c = column + dc; r >= 1 && r <= this.board.rows && c >= 1 && c <= this.board.columns && !result.hasSpace; r += dr, c += dc) {
            if (this.isEmpty(r, c)) {
                result.hasSpace = true;
            } else if (this.isUnsafe(r, c, color)) {
                result.isUnsafe = true;
            }
        }

        return result;
    };
    
    ReversiSafeDiscTable.prototype.isOutflankable = function (row, column) {
        var color = this.board.getPiece(row, column);

        return this.isDirectionallyOutflankable(row, column,  0,  1, color) ||
               this.isDirectionallyOutflankable(row, column,  1,  0, color) ||
               this.isDirectionallyOutflankable(row, column,  1,  1, color) ||
               this.isDirectionallyOutflankable(row, column,  1, -1, color);
    };

    ReversiSafeDiscTable.prototype.isDirectionallyOutflankable = function (row, column, dr, dc, color) {
        var side1 = this.checkSafety(row, column,  dr,  dc, color),
            side2 = this.checkSafety(row, column, -dr, -dc, color);

        return (side1.hasSpace && side2.hasSpace) ||
               (side1.hasSpace && side2.isUnsafe) ||
               (side1.isUnsafe && side2.hasSpace);
    };

    window.ReversiSafeDiscTable = ReversiSafeDiscTable;

}());