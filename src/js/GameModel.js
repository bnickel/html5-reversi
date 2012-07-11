/**
 * @preserve
 * Copyright 2010-2012 Brian Nickel
 * This source may be freely distributed under the MIT license.
 */

(function (window) {

    /**
     * An abstract model for a two color game grid like Reversi or Go.
     * 
     * @class
     * @abstract
     * @param {number} rows The number of rows in the game.
     * @param {number} columns The number of columns in the game.
     */
    function GameModel(rows, columns) {
        this.board = new Board(rows, columns, PieceState.EMPTY);
    }

    /**
     * The board serving as a backend for this model.  Should only be set using {GameModel.prototype.setBoard}.
     * @type {Board}
     */
    GameModel.prototype.board = null;

    /**
     * The current turn.  Should only be set using {GameModel.prototype.setTurn}.
     * @type {number}
     */
    GameModel.prototype.turn = PieceState.EMPTY;

    /**
     * Whether or not the game is over.  Should only be set using {GameModel.prototype.setGameOver}.
     * @type {boolean}
     */
    GameModel.prototype.isGameOver = true;

    /**
     * Whether or not the black player is interactive.  Should only be set using {GameModel.prototype.setInteractive}.
     * @type {boolean}
     * @private
     */
    GameModel.prototype.blackIsInteractive = true;

    /**
     * Whether or not the white player is interactive.  Should only be set using {GameModel.prototype.setInteractive}.
     * @type {boolean}
     * @private
     */
    GameModel.prototype.whiteIsInteractive = true;

    /**
     * Starts a new game with a specific piece going first.
     *
     * @param {number} [firstTurn=PieceState.BLACK] The first piece to move.
     */
    GameModel.prototype.newGame = function (firstTurn) {
        this.turn = firstTurn || PieceState.BLACK;
        this.setGameOver(false);
    };

    /**
     * Simulates a move, updating the model's simulation and returning true if the move would
     * occur.
     * 
     * @param {number} row The row to place the piece at.
     * @param {number} column The column to place the piece at.
     * @param {number} color The color of piece to place.
     * @returns {boolean} True if a move would occur.
     * @abstract
     */
    GameModel.prototype.simulateMove = function (row, column, color) {
        return false;
    };

    /**
     * Performs a move, updating the model and returning true if the move occurs.
     * 
     * @param {number} row The row to place the piece at.
     * @param {number} column The column to place the piece at.
     * @param {number} color The color of piece to place.
     * @returns {boolean} True if a move occured.
     * @abstract
     */
    GameModel.prototype.move = function (row, column, color) {
        return false;
    };

    /**
     * Evaluates if a move can be performed.
     * 
     * @param {number} row The row to place the piece at.
     * @param {number} column The column to place the piece at.
     * @param {number} color The color of piece to place.
     * @returns {boolean} True if a move would occur.
     * @abstract
     */
    GameModel.prototype.canMove = function (row, column, color) {
        return false;
    };

    /**
     * Evaluates whether or not a player can move.
     * 
     * @param {number} color The player color.
     * @returns {boolean} True if the player can move.
     */
    GameModel.prototype.playerCanMove = function (color) {

        // TODO: Board.forEachPosition
        for(var row = this.getRows(); row > 0; row --) {
            for(var column = this.getColumns(); column > 0; column--) {
                if(this.canMove(row, column, color)) {
                    return true;
                }
            }
        }

        return false;
    };

    /**
     * Gets all valid moves for a player.
     * 
     * @param {number} color The player color.
     * @returns {Array[Change]} An array of possible moves.
     */
    GameModel.prototype.getValidMoves = function (color) {

        var moves = [];
        this.board.forEachPosition(function (value, row, column) {
            if (this.canMove(row, column, color)) {
                moves.push(new Change(row, column, color));
            }
        }, this);

        return moves;
    };

    /**
     * Gets the number of valid moves for a player.
     * 
     * @param {number} color The player color.
     * @returns {number} The number of valid moves.
     */
    GameModel.prototype.getValidMoveCount = function (color) {
        return this.getValidMoves(color).length;
    };

    /**
     * Changes the current turn to a specified color.
     * 
     * @param {number} color The player color.
     */
    GameModel.prototype.setTurn = function (color) {
        var oldInteractive = this.isInteractive();
        var oldTurn = this.turn;

        this.turn = color;
        var newInteractive = this.isInteractive();

        if (oldInteractive != newInteractive) {
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

    /**
     * Sets whether or not the game is over.
     * @param {boolean} value Sets the game over status.
     */
    GameModel.prototype.setGameOver = function (value) {
        var newValue = !!value;
    
        if (this.isGameOver == newValue) {
            return;
        }
    
        this.isGameOver = newValue;
    
        if (newValue) {
            this.setTurn(PieceState.EMPTY);
            this.onGameOver({});
        }
    };

    /**
     * Gets whether or not the game board is currently interactive.
     */
    GameModel.prototype.isInteractive = function () {
        switch (this.turn) {

        case PieceState.BLACK:
            return this.blackIsInteractive;

        case PieceState.WHITE:
            return this.whiteIsInteractive;

        default:
            return false;
        }
    };

    /**
     * Sets whether or not a player is interactive.  If not, the player's turns should be
     * managed with AI.
     * @param {number} color The player's color.
     * @param {boolean} value Whether or not the player should be interactive.
     */
    GameModel.prototype.setInteractive = function (color, value) {
        var oldInteractive = this.isInteractive();

        switch (color) {

        case PieceState.BLACK:
            this.blackIsInteractive = !!value;
            break;

        case PieceState.WHITE:
            this.whiteIsInteractive = !!value;
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

    /**
     * Gets the number of rows on the board.
     * @returns {number} The number of rows.
     */
    GameModel.prototype.getRows = function () {
        return this.board.getRows();
    };

    /**
     * Gets the number of columns on the board.
     * @returns {number} The number of columns.
     */
    GameModel.prototype.getColumns = function() {
        return this.board.getColumns();
    };

    /**
     * Sets the pieces on the board, clearing the simulation.
     * @param {Array[Change]} changes The changes to make to the board.
     */
    GameModel.prototype.setPieces = function (changes) {
        this.board.setPieces(changes);
        this.clearSimulation();
        this.onBoardChanged({
                changes: changes
            });
    };

    /**
     * Gets the pieces on the board.
     * @param {number} row The row to look up.
     * @param {number} column The column to look up.
     * @returns {number} The color of the piece at that position.
     */
    GameModel.prototype.getPiece = function (row, column) {
        return this.board.getPiece(row, column);
    };

    /**
     * Replaces the current board with a new one.
     * @param {Board} board The board to use for this model.
     */
    GameModel.prototype.setBoard = function (board) {
        this.board = board;
        this.clearSimulation();
        this.onBoardChanged({});
    };

GameModel.prototype.setSimulation = function(changes) {
    this.__simulation = this.board.clone();
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

    target.board = this.board.clone();
    target.turn = this.turn;
    target.__blackIsInteractive = this.__blackIsInteractive;
    target.__whiteIsInteractive = this.__whiteIsInteractive;
    target.isGameOver = this.isGameOver;
    
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

window.GameModel = GameModel;

}(window));