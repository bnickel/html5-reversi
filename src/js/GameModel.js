function GameModel(rows, columns) {
    this.__board = new Board(rows, columns, PieceState.EMPTY);
    this.__turn = PieceState.EMPTY;
    this.__blackIsInteractive = true;
    this.__whiteIsInteractive = true;
    this.__isGameOver = true;
}

GameModel.prototype.newGame = function(firstTurn) {
    this.__turn = firstTurn || PieceState.BLACK;
    this.setGameOver(false);
};

GameModel.prototype.simulateMove = function(row, column, color) {
    return false;
}

GameModel.prototype.move = function(row, column, color) {
    return false;
};

GameModel.prototype.canMove = function(row, column, color) {
    return false;
};

GameModel.prototype.playerCanMove = function(color) {
    
    for(var row = this.getRows(); row > 0; row --) {
        for(var column = this.getColumns(); column > 0; column--) {
            if(this.canMove(row, column, color)) {
                return true;
            }
        }
    }
    
    return false;
}

GameModel.prototype.getValidMoves = function(color) {

    var moves = [];
    this.getBoard().forEachPosition(function (value, row, column) {
        if (this.canMove(row, column, color)) {
            moves.push(new Change(row, column, color));
        }
    }, this);

    return moves;
}

GameModel.prototype.getValidMoveCount = function(color) {
    return this.getValidMoves(color).length;
};

GameModel.prototype.getTurn = function() {
    return this.__turn;
};

GameModel.prototype.setTurn = function(color) {
    var oldInteractive = this.isInteractive();
    var oldTurn = this.__turn;

    this.__turn = color;
    var newInteractive = this.isInteractive();

    if(oldInteractive != newInteractive) {
        this.onInteractiveChanged({
                oldValue: oldInteractive,
                newValue: newInteractive
            });
    }

    this.onTurnChanged({
            oldTurn: oldTurn,
            newTurn: color,
            isInteractive: newInteractive
        });
};

GameModel.prototype.isGameOver = function() {
    return this.__isGameOver;
};

GameModel.prototype.setGameOver = function(value) {
    var newValue = !!value;
    
    if(this.__isGameOver == newValue) {
        return;
    }
    
    this.__isGameOver = newValue;
    
    if(newValue) {
        this.setTurn(PieceState.EMPTY);
        this.onGameOver({});
    }
};

GameModel.prototype.isInteractive = function() {
    switch(this.getTurn()) {
    
    case PieceState.BLACK:
        return this.__blackIsInteractive;
    
    case PieceState.WHITE:
        return this.__whiteIsInteractive;
    
    default:
        return false;
    }
}

GameModel.prototype.setInteractive = function(color, value) {
    var oldInteractive = this.isInteractive();
    
    switch(color) {
    
    case PieceState.BLACK:
        this.__blackIsInteractive = !!value;
        break;
    
    case PieceState.WHITE:
        this.__whiteIsInteractive = !!value;
        break;
    }

    var newInteractive = this.isInteractive();
    
    if(oldInteractive != newInteractive) {
        this.onInteractiveChanged({
                oldValue: oldInteractive,
                newValue: newInteractive
            });
    }
};

GameModel.prototype.getRows = function() {
    return this.__board.getRows();
};

GameModel.prototype.getColumns = function() {
    return this.__board.getColumns();
};

GameModel.prototype.setPieces = function(changes) {
    this.__board.setPieces(changes);
    this.clearSimulation();
    this.onBoardChanged({
            changes: changes
        });
};

GameModel.prototype.getPiece = function(row, column) {
    return this.__board.getPiece(row, column);
};

GameModel.prototype.setBoard = function(board) {
    this.__board = board;
    this.clearSimulation();
    this.onBoardChanged({});
};

GameModel.prototype.getBoard = function() {
    return this.__board;
};

GameModel.prototype.setSimulation = function(changes) {
    this.__simulation = this.__board.clone();
    this.__simulation.setPieces(changes);
    this.onSimulationChanged({});
};

GameModel.prototype.clearSimulation = function() {
    if(!this.__simulation) {
        return;
    }
    
    delete this.__simulation;
    this.onSimulationChanged({});
};

GameModel.prototype.getSimulatedPiece = function(row, column) {
    if(this.__simulation) {
        return this.__simulation.getPiece(row, column);
    }
    
    return undefined;
};

GameModel.prototype.clone = function(target) {
    target || (target = new GameBoardBackend(0, 0));

    target.__board = this.__board.clone();
    target.__turn = this.__turn;
    target.__blackIsInteractive = this.__blackIsInteractive;
    target.__whiteIsInteractive = this.__whiteIsInteractive;
    target.__isGameOver = this.__isGameOver;
    
    return target;
}

GameModel.enableEventsOnPrototype();

GameModel.prototype.onMove = function(eventArgs) {
    this.evokeEvent("move", eventArgs);
};

GameModel.prototype.onNewGame = function(eventArgs) {
    this.evokeEvent("newgame", eventArgs);
};

GameModel.prototype.onGameOver = function(eventArgs) {
    this.evokeEvent("gameover", eventArgs);
};

GameModel.prototype.onTurnChanged = function(eventArgs) {
    this.evokeEvent("turnchanged", eventArgs);
};

GameModel.prototype.onInteractiveChanged = function(eventArgs) {
    this.evokeEvent("interactivechanged", eventArgs);
};

GameModel.prototype.onBoardChanged = function(eventArgs) {
    this.evokeEvent("boardchanged", eventArgs);
};

GameModel.prototype.onSimulationChanged = function(eventArgs) {
    this.evokeEvent("simulationchanged", eventArgs);
};