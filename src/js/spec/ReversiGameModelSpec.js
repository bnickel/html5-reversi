describe("ReversiGameModel", function () {

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
    
        var model;
        
        beforeEach(function () {
            model = new ReversiGameModel(8, 8);
        });
    
        it("sets up the board correctly for a standard size", function () {
            model.startNewGame();
            expect(model.blackScore).toBe(2);
            expect(model.whiteScore).toBe(2);
            expect(model.emptyScore).toBe(60);
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
            expect(model.blackScore).toBe(4);
            model.startNewGame();
            expect(model.blackScore).toBe(2);
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
    
        var model;
        
        beforeEach(function () {
            model = new ReversiGameModel(8, 8);
            model.startNewGame();
        });
    
        describe("successful moves", function() {
        
            it("can move up", function () {
                var result = model.move(3, 4, PieceState.WHITE);
                expect(result).toBe(true);
                expect(model.whiteScore).toBe(4);
            });
        
            it("can move down", function () {
                var result = model.move(6, 5, PieceState.WHITE);
                expect(result).toBe(true);
                expect(model.whiteScore).toBe(4);
            });
        
            it("can move left", function () {
                var result = model.move(4, 3, PieceState.WHITE);
                expect(result).toBe(true);
                expect(model.whiteScore).toBe(4);
            });
        
            it("can move right", function () {
                var result = model.move(5, 6, PieceState.WHITE);
                expect(result).toBe(true);
                expect(model.whiteScore).toBe(4);
            });
        
            it("can move up-left", function () {
                model.board.setPiece(4, 4, PieceState.WHITE);
                var result = model.move(3, 3, PieceState.BLACK);
                expect(result).toBe(true);
                expect(model.whiteScore).toBe(2);
            });
        
            it("can move down-right", function () {
                model.board.setPiece(5, 5, PieceState.WHITE);
                var result = model.move(6, 6, PieceState.BLACK);
                expect(result).toBe(true);
                expect(model.whiteScore).toBe(2);
            });
        
            it("can move down-left", function () {
                model.board.setPiece(5, 4, PieceState.BLACK);
                var result = model.move(6, 3, PieceState.WHITE);
                expect(result).toBe(true);
                expect(model.blackScore).toBe(2);
            });
        
            it("can move up-right", function () {
                model.board.setPiece(4, 5, PieceState.BLACK);
                var result = model.move(3, 6, PieceState.WHITE);
                expect(result).toBe(true);
                expect(model.blackScore).toBe(2);
            });
            
            it("triggers a callback with the changes", function () {
                var spy = jasmine.createSpy('callback');
                model.addEventListener('move', spy);
                model.move(3, 4, PieceState.WHITE);
                
                var call = spy.mostRecentCall;
                var changes = call.args[0];
                expect(call.object).toBe(model);
                expect(changes.length).toBe(2);
            });
        });
    
        describe("unsuccessful move attempts", function() {
        
            it("reports when it cannot move", function () {
                var result = model.move(1, 1, PieceState.WHITE);
                expect(result).toBe(false);
            });
        });
    });
    
    describe("simulating", function () {
    });
});