/**
 * @preserve
 * Copyright 2010-2012 Brian Nickel
 * This source may be freely distributed under the MIT license.
 */

describe("ReversiGameModel", function () {

    var model;
    
    beforeEach(function () {
        model = new ReversiGameModel(8, 8);
    });
    
    describe("creating a new board", function () {
        
        it("throws an error on odd sizes", function () {
            var rowError, colError;
            
            try {
                new ReversiGameModel(5, 4);
            } catch (e) {
                rowError = e;
            }
            
            try {
                new ReversiGameModel(4, 5);
            } catch (e) {
                colError = e;
            }
            
            expect(rowError).toBeDefined();
            expect(colError).toBeDefined();
        });
        
        it("throws an error on small sizes", function () {
            var rowError, colError;
            
            try {
                new ReversiGameModel(2, 4);
            } catch (e) {
                rowError = e;
            }
            
            try {
                new ReversiGameModel(4, 2);
            } catch (e) {
                colError = e;
            }
            
            expect(rowError).toBeDefined();
            expect(colError).toBeDefined();
        });
    });
    
    describe("starting a new game", function () {
    
        it("sets up the board correctly for a standard size", function () {
            model.startNewGame();
            expect(model.getScore(PieceState.BLACK)).toBe(2);
            expect(model.getScore(PieceState.WHITE)).toBe(2);
            expect(model.getScore(PieceState.EMPTY)).toBe(60);
            expect(model.turn).toBe(PieceState.BLACK);
            expect(model.getPiece(4, 4)).toBe(PieceState.BLACK);
            expect(model.getPiece(5, 5)).toBe(PieceState.BLACK);
            expect(model.getPiece(4, 5)).toBe(PieceState.WHITE);
            expect(model.getPiece(5, 4)).toBe(PieceState.WHITE);
        });
        
        it("triggers a callback", function () {
            var spy = jasmine.createSpy('callback');
            model.addEventListener('newgame', spy);
            model.startNewGame();
            expect(spy).toHaveBeenCalled();
        });
        
        it("can start a white game", function () {
            model.startNewGame(PieceState.WHITE);
            expect(model.turn).toBe(PieceState.WHITE);
        });
        
        it("switches from game over", function () {
            model.setGameOver(true);
            model.startNewGame();
            expect(model.isGameOver).toBe(false);
        });
        
        it("clears the current game", function () {
            model.startNewGame();
            model.move(4, 6, PieceState.BLACK);
            expect(model.getScore(PieceState.BLACK)).toBe(4);
            model.startNewGame();
            expect(model.getScore(PieceState.BLACK)).toBe(2);
            expect(model.turn).toBe(PieceState.BLACK);
        });
        
        it("clears the simulation", function () {
            model.startNewGame();
            model.simulateMove(4, 6, PieceState.BLACK);
            expect(model.simulation).toBeDefined();
            model.startNewGame();
            expect(model.simulation).toBeNull();
        });
    });
    
    describe("moving", function () {
    
        beforeEach(function () {
            model.startNewGame();
        });
    
        describe("successfully", function() {
        
            describe("in different directions", function() {
                it("can move up", function () {
                    var result = model.move(3, 4, PieceState.WHITE);
                    expect(result).toBe(true);
                    expect(model.getScore(PieceState.WHITE)).toBe(4);
                });
            
                it("can move down", function () {
                    var result = model.move(6, 5, PieceState.WHITE);
                    expect(result).toBe(true);
                    expect(model.getScore(PieceState.WHITE)).toBe(4);
                });
            
                it("can move left", function () {
                    var result = model.move(4, 3, PieceState.WHITE);
                    expect(result).toBe(true);
                    expect(model.getScore(PieceState.WHITE)).toBe(4);
                });
            
                it("can move right", function () {
                    var result = model.move(5, 6, PieceState.WHITE);
                    expect(result).toBe(true);
                    expect(model.getScore(PieceState.WHITE)).toBe(4);
                });
            
                it("can move up-left", function () {
                    model.board.setPiece(4, 4, PieceState.WHITE);
                    var result = model.move(3, 3, PieceState.BLACK);
                    expect(result).toBe(true);
                    expect(model.getScore(PieceState.WHITE)).toBe(2);
                });
            
                it("can move down-right", function () {
                    model.board.setPiece(5, 5, PieceState.WHITE);
                    var result = model.move(6, 6, PieceState.BLACK);
                    expect(result).toBe(true);
                    expect(model.getScore(PieceState.WHITE)).toBe(2);
                });
            
                it("can move down-left", function () {
                    model.board.setPiece(5, 4, PieceState.BLACK);
                    var result = model.move(6, 3, PieceState.WHITE);
                    expect(result).toBe(true);
                    expect(model.getScore(PieceState.BLACK)).toBe(2);
                });
            
                it("can move up-right", function () {
                    model.board.setPiece(4, 5, PieceState.BLACK);
                    var result = model.move(3, 6, PieceState.WHITE);
                    expect(result).toBe(true);
                    expect(model.getScore(PieceState.BLACK)).toBe(2);
                });
            });
            
            it("changes the turn", function () {
                model.move(3, 5, PieceState.BLACK);
                expect(model.turn).toBe(PieceState.WHITE);
            });
            
            it("triggers a 'move' callback with the changes", function () {
                var spy = jasmine.createSpy('callback');
                model.addEventListener('move', spy);
                model.move(3, 4, PieceState.WHITE);
                
                expect(spy).toHaveBeenCalled();
                
                var call = spy.mostRecentCall;
                var changes = call.args[0].changes;
                expect(call.object).toBe(model);
                expect(changes.length).toBe(2);
            });
            
            it("triggers a 'boardchanged' callback with the changes", function () {
                var spy = jasmine.createSpy('callback');
                model.addEventListener('boardchanged', spy);
                model.move(3, 4, PieceState.WHITE);
                
                expect(spy).toHaveBeenCalled();
                
                var call = spy.mostRecentCall;
                var changes = call.args[0].changes;
                expect(call.object).toBe(model);
                expect(changes.length).toBe(2);
            });
            
            it("clears a simulation", function () {
                model.simulateMove(3, 4, PieceState.WHITE);
                model.move(3, 4, PieceState.WHITE);
                expect(model.simulation).toBeNull();
            });
            
            it("causes game over when only one color remains", function () {
                model.move(3, 4, PieceState.WHITE);
                model.move(6, 5, PieceState.WHITE);
                expect(model.isGameOver).toBe(true);
            });
            
            it("causes game over when the board is full", function () {
                var board = model.board,
                    r, c;
                
                for (r = 1; r <= board.rows; r += 1) {
                    for (c = 1; c <= board.columns; c += 1) {
                        if (r !== 1 || c !== 1) {
                            board.setPiece(r, c, PieceState.WHITE);
                        }
                    }
                }
                
                board.setPiece(board.rows, board.columns, PieceState.BLACK);
                
                model.move(1, 1, PieceState.BLACK);
                
                expect(model.isGameOver).toBe(true);
            });
        });
    
        describe("unsuccessfully", function() {
        
            it("reports when it cannot move", function () {
                var result = model.move(1, 1, PieceState.WHITE);
                expect(result).toBe(false);
            });
        });
    });
    
    describe("simulating a move", function () {
        
        beforeEach(function () {
            model.startNewGame();
        });
        
        it("works on valid moves", function () {
            var result = model.simulateMove(3, 4, PieceState.WHITE);
            expect(result).toBe(true);
            expect(model.simulation).not.toBe(null);
        });
        
        it("doesn't work on invalid moves", function () {
            var result = model.simulateMove(2, 4, PieceState.WHITE);
            expect(result).toBe(false);
            expect(model.simulation).toBe(null);
        });
        
        it("triggers a 'simulationchanged' callback", function () {
            var spy = jasmine.createSpy('callback');
            model.addEventListener('simulationchanged', spy);
            model.simulateMove(3, 4, PieceState.WHITE);
            
            expect(spy).toHaveBeenCalled();
        });
    });
    
    describe("the safe disc count", function () {
        it("increases when you reach a corner", function () {
            model.startNewGame();
            model.move(3, 5, PieceState.BLACK);
            model.move(3, 6, PieceState.WHITE);
            model.move(3, 7, PieceState.BLACK);
            model.move(2, 7, PieceState.WHITE);
            model.move(1, 7, PieceState.BLACK);
            model.move(1, 8, PieceState.WHITE);
            
            expect(model.isPieceSafe(1, 8)).toBe(true);
            expect(model.getSafePieceCount(PieceState.WHITE)).toBe(1);
        });
    });
    
    describe("the frontier", function () {
        
        beforeEach(function () {
            model.startNewGame();
        });
        
        it("includes all the pieces at the start of the game", function () {
            expect(model.getFrontierPieceCount(PieceState.WHITE)).toBe(2);
            expect(model.getFrontierPieceCount(PieceState.BLACK)).toBe(2);
        });
        
        it("doesn't include empty pieces", function () {
            expect(model.isPieceOnTheFrontier(1, 1)).toBe(false);
        });
        
        it("keeps its status until all spaces are blocked", function () {
            model.move(3, 5, PieceState.BLACK);
            model.move(3, 6, PieceState.WHITE);
            model.move(4, 6, PieceState.BLACK);
            model.move(5, 6, PieceState.WHITE);
            model.move(6, 7, PieceState.BLACK);
            expect(model.isPieceOnTheFrontier(4, 5)).toBe(true);
            model.move(3, 4, PieceState.WHITE);
            expect(model.isPieceOnTheFrontier(4, 5)).toBe(false);
        });
    });
});