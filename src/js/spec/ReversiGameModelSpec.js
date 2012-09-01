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
    });
    
    describe("starting a new game", function () {
    
        it("set up the board correctly for a standard size", function () {
            
            var model = new ReversiGameModel(8, 8);
            model.newGame();
            
            expect(model.blackScore).toBe(2);
            expect(model.whiteScore).toBe(2);
            expect(model.emptyScore).toBe(60);
            expect(model.getPiece(4, 4)).toBe(PieceState.BLACK);
            expect(model.getPiece(5, 5)).toBe(PieceState.BLACK);
            expect(model.getPiece(4, 5)).toBe(PieceState.WHITE);
            expect(model.getPiece(5, 4)).toBe(PieceState.WHITE);
        });
    });
});