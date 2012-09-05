(function () {
    'use strict';

    function ReversiGameModel(rows, columns) {
        if (rows % 2 !== 0 || columns % 2 !== 0) {
            throw new Error('Reversi games must always have even rows and columns.');
        }
        
        if (rows < 4 || columns < 4) {
            throw new Error ('Reversi games must be at least 4 by 4.');
        }
        
        GameModel.call(this, rows, columns);
    }

    ReversiGameModel.prototype = Object.create(GameModel.prototype);

    ReversiGameModel.prototype.blackScore            = 0;
    ReversiGameModel.prototype.whiteScore            = 0;
    ReversiGameModel.prototype.emptyScore            = 0;
    ReversiGameModel.prototype.blackFrontierCount    = 0;
    ReversiGameModel.prototype.whiteFrontierCount    = 0;
    ReversiGameModel.prototype.useComplexStats       = false;
    ReversiGameModel.prototype.supressTurnValidation = false;
    ReversiGameModel.prototype.safeDiscTable         = null;

    ReversiGameModel.prototype.startNewGame = function (firstTurn) {
        GameModel.prototype.startNewGame.call(this, firstTurn);

        var board = this.board,
            pieces = [],
            r1 = Math.floor(board.rows / 2),
            c1 = Math.floor(board.columns / 2),
            r2 = r1 + 1,
            c2 = c1 + 1;

        board.forEachPosition(function (value, row, column) {
            var color = PieceState.EMPTY;

            if ((row === r1 && column === c1) || (row === r2 && column === c2)) {
                color = PieceState.BLACK;
            } else if ((row === r1 && column === c2) || (row === r2 && column === c1)) {
                color = PieceState.WHITE;
            }

            pieces.push(new Change(row, column, color));
        });

        this.setPieces(pieces);
        this.onNewGame({});
    };

    ReversiGameModel.prototype.simulateMove = function (row, column, color) {
        var changes = this.getMoveChanges(row, column, color);

        if (changes.length) {
            this.setSimulation(changes);
            return true;
        }

        this.clearSimulation();
        return false;
    };

    ReversiGameModel.prototype.move = function (row, column, color) {

        var changes = this.getMoveChanges(row, column, color);

        if (changes.length) {
            this.setPieces(changes);
            // TODO: Move from passing changes to passing {changes: changes}
            this.onMove({changes: changes});
            return true;
        }

        return false;
    };

    ReversiGameModel.prototype.canMove = function (row, column, color) {

        if (this.board.getPiece(row, column) !== PieceState.EMPTY) {
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
    };

    ReversiGameModel.prototype.canMoveDirection = function (row, column, color, dr, dc) {
        var found = false,
            board = this.board,
            existing;

        for (row += dr, column += dc; true; row += dr, column += dc) {

            if (row < 1 || column < 1 || row > board.rows || column > board.columns) {
                return false;
            }

            existing = this.board.getPiece(row, column);
            if (existing === PieceState.EMPTY) {
                return false;
            }

            if (existing === color) {
                return found;
            }

            found = true;
        }
    };

    ReversiGameModel.prototype.getMoveChanges = function (row, column, color) {
        var changes = [];

        if (this.board.getPiece(row, column) !== PieceState.EMPTY) {
            return changes;
        }

        this.getDirectionChanges(row, column, color, -1, -1, changes);
        this.getDirectionChanges(row, column, color, -1,  0, changes);
        this.getDirectionChanges(row, column, color, -1,  1, changes);
        this.getDirectionChanges(row, column, color,  0,  1, changes);
        this.getDirectionChanges(row, column, color,  1,  1, changes);
        this.getDirectionChanges(row, column, color,  1,  0, changes);
        this.getDirectionChanges(row, column, color,  1, -1, changes);
        this.getDirectionChanges(row, column, color,  0, -1, changes);

        if (changes.length) {
            changes.push(new Change(row, column, color));
        }

        return changes;
    };

    // TODO: This duplicates a lot of code from canMoveDirection.
    ReversiGameModel.prototype.getDirectionChanges = function (row, column, color, dr, dc, changes) {
        var flippingPieces = [],
            board = this.board,
            existing;

        for (row += dr, column += dc; true; row += dr, column += dc) {
            if (row < 1 || column < 1 || row > board.rows || column > board.columns) {
                return;
            }

            existing = this.board.getPiece(row, column);
            if (existing === PieceState.EMPTY) {
                return;
            }

            if (existing === color) {
                break;
            }

            flippingPieces.push(new Change(row, column, color));
        }

        flippingPieces.forEach(function (piece) {
            changes.push(piece);
        });
    };

    ReversiGameModel.prototype.setBoard = function (board) {
        this.safeDiscTable = new ReversiSafeDiscTable(board);
        GameModel.prototype.setBoard.call(this, board);
    };

    ReversiGameModel.prototype.onBoardChanged = function (eventArgs) {
        this.updateStats();
        GameModel.prototype.onBoardChanged.call(this, eventArgs);
    };

    ReversiGameModel.prototype.onMove = function (eventArgs) {
        GameModel.prototype.onMove.call(this, eventArgs);

        if (this.emptySquares === 0
                || this.blackScore === 0
                || this.whiteScore === 0) {

            this.setGameOver(true);
            return;
        }

        var nextTurn = -this.turn;

        if (!this.supressTurnValidation) {
            if (!this.playerCanMove(nextTurn)) {
                nextTurn = -nextTurn;
                if (!this.playerCanMove(nextTurn)) {
                    this.setGameOver(true);
                    return;
                }
            }
        }

        this.setTurn(nextTurn);
    };

    ReversiGameModel.prototype.updateStats = function () {
        var self = this;

        self.blackScore         = 0;
        self.whiteScore         = 0;
        self.emptyScore         = 0;
        self.blackFrontierCount = 0;
        self.whiteFrontierCount = 0;
        
        self.safeDiscTable.update();

        self.board.forEachPosition(function (color, row, column) {
            var isFrontier = self.useComplexStats && self.isFrontier(row, column);

            switch (color) {

            case PieceState.BLACK:

                self.blackScore += 1;

                if (isFrontier) {
                    self.blackFrontierCount += 1;
                }

                break;

            case PieceState.WHITE:

                self.whiteScore += 1;

                if (isFrontier) {
                    self.whiteFrontierCount += 1;
                }

                break;

            default:
                self.emptyScore += 1;
            }
        });
    };

    ReversiGameModel.prototype.isFrontier = function (row, column) {
        var r, c;

        if (this.getPiece(row, column) === PieceState.EMPTY) {
            return false;
        }

        for (r = Math.max(1, row - 1); r <= Math.min(row + 1, 8); r += 1) {
            for (c = Math.max(1, column - 1); c <= Math.min(column + 1, 8); c += 1) {
                if (this.getPiece(r, c) === PieceState.EMPTY) {
                    return true;
                }
            }
        }

        return false;
    };

    ReversiGameModel.prototype.isPieceSafe = function (row, column) {
        return this.safeDiscTable.isSafe(row, column);
    };
    
    ReversiGameModel.prototype.getSafePieceCount = function (color) {
        return this.safeDiscTable.getSafeDiscCount(color);
    };

    ReversiGameModel.prototype.clone = function (target) {
        target = target || new ReversiGameModel(1, 1);

        GameModel.prototype.clone.call(this, target);

        target.blackScore            = this.blackScore;
        target.whiteScore            = this.whiteScore;
        target.emptyScore            = this.emptyScore;
        target.blackFrontierCount    = this.blackFrontierCount;
        target.whiteFrontierCount    = this.whiteFrontierCount;
        target.useComplexStats       = this.useComplexStats;
        target.supressTurnValidation = this.supressTurnValidation;

        return target;
    };

    window.ReversiGameModel = ReversiGameModel;

}());