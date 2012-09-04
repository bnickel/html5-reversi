(function () {
    'use strict';
    
    var HAS_EMPTY = 2,
        HAS_UNSAFE = 1,
        IS_SAFE = 0;
    
    
    function ReversiSafeDiscTable(board) {
        this.setBoard(board);
    }

    ReversiSafeDiscTable.prototype.board = null;
    ReversiSafeDiscTable.prototype.table = null;
    ReversiSafeDiscTable.prototype.safeDiscCounts = null;
    
    ReversiSafeDiscTable.prototype.isSafe = function (row, column) {
        return this.table.getPiece(row, column);
    };
    
    ReversiSafeDiscTable.prototype.isSafeForColor = function (row, column, color) {
        return this.board.getPiece(row, column) === color && this.isSafe(row, column);
    };
    
    ReversiSafeDiscTable.prototype.markAsSafe = function (row, column) {
        var state = this.board.getPiece(row, column);
        this.safeDiscCounts[state] = this.getSafeDiscCount(state) + 1;
        return this.table.setPiece(row, column, true);
    };
    
    ReversiSafeDiscTable.prototype.getSafeDiscCount = function (state) {
        return this.safeDiscCounts[state] || 0;
    };
    
    ReversiSafeDiscTable.prototype.setBoard = function (board) {
        this.board = board;
        this.table = new Board(board.rows, board.columns, false);
        this.safeDiscCounts = {};
        this.update();
    };
    
    function getDegreeOfSafety(safeDiscTable, row, column, dr, dc, color) {
        var board = safeDiscTable.board,
            result = IS_SAFE,
            r,
            c;

        for (r = row + dr, c = column + dc; board.contains(r, c); r += dr, c += dc) {
        
            if (board.getPiece(r, c) === PieceState.EMPTY) {
                return HAS_EMPTY;
            }
            
            if (!safeDiscTable.isSafeForColor(r, c, color)) {
                result = HAS_UNSAFE;
            }
        }

        return result;
    };

    function isDiscDirectionallyOutflankable(safeDiscTable, row, column, dr, dc, color) {
        var side1 = getDegreeOfSafety(safeDiscTable, row, column,  dr,  dc, color),
            side2 = getDegreeOfSafety(safeDiscTable, row, column, -dr, -dc, color);
        
        return (side1 === HAS_EMPTY && side2 !== IS_SAFE) || (side2 === HAS_EMPTY && side1 !== IS_SAFE);
    };

    function isDiscOutflankable(safeDiscTable, row, column) {
        var color = safeDiscTable.board.getPiece(row, column);

        return isDiscDirectionallyOutflankable(safeDiscTable, row, column,  0,  1, color) ||
               isDiscDirectionallyOutflankable(safeDiscTable, row, column,  1,  0, color) ||
               isDiscDirectionallyOutflankable(safeDiscTable, row, column,  1,  1, color) ||
               isDiscDirectionallyOutflankable(safeDiscTable, row, column,  1, -1, color);
    };
    
    ReversiSafeDiscTable.prototype.update = function () {
        var newSafeDiscDetected = false;
        
        this.board.forEachPosition(function (color, row, column) {
        
            if (color === PieceState.EMPTY
                    || this.isSafe(row, column)
                    || isDiscOutflankable(this, row, column)) {
                return;
            }
                
            this.markAsSafe(row, column);
            newSafeDiscDetected = true;
        }, this);
            
        if (newSafeDiscDetected) {
            this.update();
        }
    };
    
    window.ReversiSafeDiscTable = ReversiSafeDiscTable;

}());