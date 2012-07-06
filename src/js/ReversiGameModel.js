function ReversiGameModel(rows, columns) {

    GameModel.call(this, rows, columns);
    
    this.__blackScore            = 0;
    this.__whiteScore            = 0;
    this.__emptyScore            = 0;
    this.__blackFrontierCount    = 0;
    this.__whiteFrontierCount    = 0;
    this.__blackSafeCount        = 0;
    this.__whiteSafeCount        = 0;
    this.__useComplexStats       = false;
    this.__supressTurnValidation = false;
};

ReversiGameModel.prototype = Object.create(GameModel.prototype);

ReversiGameModel.prototype.newGame = function(firstTurn) {
    
    GameModel.prototype.newGame.call(this, firstTurn);
    
    var pieces = [];
    var rows = this.getRows();
    var columns = this.getColumns();
    var r1 = Math.floor(rows / 2);
    var c1 = Math.floor(columns / 2);
    var r2 = r1 + 1;
    var c2 = c1 + 1;

    for(var r = 1; r <= rows; r ++) {
        for(var c = 1; c <= columns; c ++) {
            if((r == r1 && c == c1) || (r == r2 && c == c2)) {
                pieces.push(new Change(r, c, PieceState.BLACK));
            } else if((r == r1 && c == c2) || (r == r2 && c == c1)) {
                pieces.push(new Change(r, c, PieceState.WHITE));
            } else {
                pieces.push(new Change(r, c, PieceState.EMPTY));
            }
        }
    }
    
    this.setPieces(pieces);
    
    this.onNewGame({});
}

ReversiGameModel.prototype.simulateMove = function(row, column, color) {

    var changes = this.getMoveChanges(row, column, color);
    
    if(changes.length) {
        this.setSimulation(changes);
        return true;
    }
    
    this.clearSimulation();
    return false;
}

ReversiGameModel.prototype.move = function(row, column, color) {
    
    var changes = this.getMoveChanges(row, column, color);
    
    if(changes.length) {
        this.setPieces(changes);
        this.onMove(changes);
        return true;
    }
    
    return false;
}

ReversiGameModel.prototype.canMove = function(row, column, color) {
    
    if(this.__board.getPiece(row, column) != PieceState.EMPTY) {
        return false;
    }
    
    return this.canMoveDirection(row, column, color, -1, -1) ||
           this.canMoveDirection(row, column, color, -1,  0) ||
           this.canMoveDirection(row, column, color, -1,  1) ||
           this.canMoveDirection(row, column, color,  0,  1) ||
           this.canMoveDirection(row, column, color,  1,  1) ||
           this.canMoveDirection(row, column, color,  1,  0) ||
           this.canMoveDirection(row, column, color,  1, -1) ||
           this.canMoveDirection(row, column, color,  0, -1);
}

ReversiGameModel.prototype.canMoveDirection = function(row, column, color, dr, dc) {
    var found = false;
    
    for(row += dr, column += dc; true; row += dr, column += dc) {
    
        if(row < 1 || column < 1 || row > 8 || column > 8) {
            return false;
        }
        
        var existing = this.__board.getPiece(row, column);
        if(existing == PieceState.EMPTY) {
            return false;
        }
        
        if(existing == color) {
            return found;
        }
        
        found = true;
    }
};

ReversiGameModel.prototype.getMoveChanges = function(row, column, color) {

    if(this.__board.getPiece(row, column) != PieceState.EMPTY) {
        return [];
    }
    
    var changes = [];
    this.getDirectionChanges(row, column, color, -1, -1, changes);
    this.getDirectionChanges(row, column, color, -1,  0, changes);
    this.getDirectionChanges(row, column, color, -1,  1, changes);
    this.getDirectionChanges(row, column, color,  0,  1, changes);
    this.getDirectionChanges(row, column, color,  1,  1, changes);
    this.getDirectionChanges(row, column, color,  1,  0, changes);
    this.getDirectionChanges(row, column, color,  1, -1, changes);
    this.getDirectionChanges(row, column, color,  0, -1, changes);
    
    if(changes.length > 0) {
        changes.push(new Change(row, column, color));
    }
    
    return changes;
}

ReversiGameModel.prototype.getDirectionChanges = function(row, column, color, dr, dc, changes) {

    var flippingPieces = [];
    
    for(row += dr, column += dc; true; row += dr, column += dc) {
        if(row < 1 || column < 1 || row > 8 || column > 8) {
            return;
        }
        
        var existing = this.__board.getPiece(row, column);
        if(existing == PieceState.EMPTY) {
            return;
        }
        
        if(existing == color) {
            break;
        }
        
        flippingPieces.push(new Change(row, column, color));
    }
    
    for(var i = 0; i < flippingPieces.length; i ++) {
        changes.push(flippingPieces[i]);
    }
}

ReversiGameModel.prototype.setBoard = function(board) {
    delete this.__safeDiscs;
    GameModel.prototype.setBoard.call(this, board);
}

ReversiGameModel.prototype.onBoardChanged = function(eventArgs) {
    this.updateStats();
    GameModel.prototype.onBoardChanged.call(this, eventArgs);
};

ReversiGameModel.prototype.onMove = function(eventArgs) {
    GameModel.prototype.onMove.call(this, eventArgs);
    
    if(this.getEmptySquares() == 0
            || this.getBlackScore() == 0
            || this.getWhiteScore() == 0) {
        
        this.setGameOver(true);
        return;
    }
    
    var nextTurn = -this.getTurn();
    
    if(!this.__supressTurnValidation) {
        if(!this.playerCanMove(nextTurn)) {
            nextTurn = -nextTurn;
            if(!this.playerCanMove(nextTurn)) {
                this.setGameOver(true);
                return;
            }
        }
    }
    
    this.setTurn(nextTurn);
};



ReversiGameModel.prototype.updateStats = function() {
    this.__blackScore         = 0;
    this.__whiteScore         = 0;
    this.__emptyScore         = 0;
    this.__blackFrontierCount = 0;
    this.__whiteFrontierCount = 0;
    this.__blackSafeCount     = 0;
    this.__whiteSafeCount     = 0;
    
    var rows    = this.getRows();
    var columns = this.getColumns();

    if(this.__useComplexStats) {
    
        var statusChanged = true;
        
        while (statusChanged) {
            statusChanged = false;
            
            for(var r = 1; r <= rows; r ++) {
                for(var c = 1; c <= columns; c ++) {
                    if (this.getPiece(r, c) != PieceState.EMPTY && !this.getSafeDisc(r, c) && !this.isOutflankable(r, c)) {
                        this.setSafeDisc(r, c, true);
                        statusChanged = true;
                    }
                }
            }
        }
    }
    
    for(var r = 1; r <= rows; r ++) {
        for(var c = 1; c <= columns; c ++) {
            var color = this.getPiece(r, c);
            var isFrontier = this.__useComplexStats && this.isFrontier(r, c);
            
            switch(color) {
            
            case PieceState.BLACK:
                
                this.__blackScore ++;
                
                if(isFrontier) {
                    this.__blackFrontierCount ++;
                }
                
                if(this.getSafeDisc(r, c)) {
                    this.__blackSafeCount ++;
                }
                
                break;
            
            case PieceState.WHITE:
                
                this.__whiteScore ++;
                
                if(isFrontier) {
                    this.__whiteFrontierCount ++;
                }
                
                if(this.getSafeDisc(r, c)) {
                    this.__whiteSafeCount ++;
                }
                
                break;
            
            default:
                this.__emptyScore ++;
            }
        }
    }
};

ReversiGameModel.prototype.isFrontier = function(row, column) {
    if(this.isEmpty(row, column)) {
        return false;
    }
    
    for (var r = Math.max(1, row - 1); r <= Math.min(row + 1, 8); r++) {
        for (var c = Math.max(1, column - 1); c <= Math.min(column + 1, 8); c++) {
            if (this.isEmpty(r, c)) {
                return true;
            }
        }
    }
    
    return false;
};

ReversiGameModel.prototype.getSafeDisc = function(row, column) {
    return this.__safeDiscs ? this.__safeDiscs.getPiece(row, column) : false;
};

ReversiGameModel.prototype.setSafeDisc = function(row, column, value) {
    this.__safeDiscs || (this.__safeDiscs = new Board(this.getRows(), this.getColumns(), false));
    
    this.__safeDiscs.setPiece(row, column, value);
};

ReversiGameModel.prototype.isUnsafe = function(row, column, color) {
    return this.getPiece(row, column) != color || !this.getSafeDisc(row, column);
};

ReversiGameModel.prototype.isEmpty = function(row, column) {
    return this.getPiece(row, column) == PieceState.EMPTY;
};

ReversiGameModel.prototype.checkSafety = function(row, column, dr, dc, color) {
    
    var result = {hasSpace: false, isUnsafe: false};
    
    for(var r = row + dr, c = column + dc; r >= 1 && r <= 8 && c >= 1 && c <= 8 && !result.hasSpace; r += dr, c += dc) {
        if (this.isEmpty(r, c)) {
            result.hasSpace = true;
        } else if(this.isUnsafe(r, c)) {
            result.isUnsafe = true;
        }
    }
    
    return result;
};


ReversiGameModel.prototype.isOutflankable = function(row, column) {
    
    var color = this.getPiece(row, column);
    
    return this.isDirectionallyOutflankable(row, column,  0,  1, color) ||
           this.isDirectionallyOutflankable(row, column,  1,  0, color) ||
           this.isDirectionallyOutflankable(row, column,  1,  1, color) ||
           this.isDirectionallyOutflankable(row, column,  1, -1, color);
};

ReversiGameModel.prototype.isDirectionallyOutflankable = function(row, column, dr, dc, color) {
    
    var side1 = this.checkSafety(row, column,  dr,  dc);
    var side2 = this.checkSafety(row, column, -dr, -dc);
    
    return (side1.hasSpace && side2.hasSpace) ||
           (side1.hasSpace && side2.isUnsafe) ||
           (side1.isUnsafe && side2.hasSpace);

};

ReversiGameModel.prototype.useComplexStats = function(value) {
    
    this.__useComplexStats = !!value;
    
    if(value) {
        this.updateStats();
    }
};

ReversiGameModel.prototype.supressTurnValidation = function(value) {
    this.__supressTurnValidation = !!value;
};

ReversiGameModel.prototype.getBlackScore = function() {
    return this.__blackScore;
};

ReversiGameModel.prototype.getWhiteScore = function() {
    return this.__whiteScore;
};

ReversiGameModel.prototype.getEmptySquares = function() {
    return this.__emptyScore;
};

ReversiGameModel.prototype.getBlackFrontierCount = function() {
    return this.__blackFrontierCount;
};

ReversiGameModel.prototype.getWhiteFrontierCount = function() {
    return this.__whiteFrontierCount;
};

ReversiGameModel.prototype.getBlackSafeCount = function() {
    return this.__blackSafeCount;
};

ReversiGameModel.prototype.getWhiteSafeCount = function() {
    return this.__whiteSafeCount;
};



ReversiGameModel.prototype.clone = function(target) {
    
    target || (target = new ReversiGameModel(1, 1));
    
    GameModel.prototype.clone.call(this, target);
    
    target.__blackScore            = this.__blackScore;
    target.__whiteScore            = this.__whiteScore;
    target.__emptyScore            = this.__emptyScore;
    target.__blackFrontierCount    = this.__blackFrontierCount;
    target.__whiteFrontierCount    = this.__whiteFrontierCount;
    target.__blackSafeCount        = this.__blackSafeCount;
    target.__whiteSafeCount        = this.__whiteSafeCount;
    target.__useComplexStats       = this.__useComplexStats;
    target.__supressTurnValidation = this.__supressTurnValidation;
    
    return target;
}