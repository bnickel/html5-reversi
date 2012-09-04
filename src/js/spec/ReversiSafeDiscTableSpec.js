/**
 * @preserve
 * Copyright 2010-2012 Brian Nickel
 * This source may be freely distributed under the MIT license.
 */

describe("ReversiSafeDiscTable", function () {
    
    var board;
    var table;
    
    beforeEach(function () {
        board = new Board(4, 4, PieceState.EMPTY);
        table = new ReversiSafeDiscTable(board);
    });
    
    function populateBoard(board, pieces) {
        pieces.forEach(function (contents, rowIndex) {
            var row = rowIndex + 1,
                column;
            
            for (column = 1; column <= contents.length; column += 1) {
                switch(contents.charAt(column - 1)) {
                case 'B':
                    board.setPiece(row, column, PieceState.BLACK);
                    break;
                case 'W':
                    board.setPiece(row, column, PieceState.WHITE);
                    break;
                }
            }
        });
    }
    
    describe("safe discs", function () {
    
        it("exist in corners", function () {
            populateBoard(board, ['B']);
            table.update();
            expect(table.isSafe(1, 1)).toBe(true);
        });
    
        it("exist on sides connected corners", function () {
            populateBoard(board, ['BB']);
            table.update();
            expect(table.isSafe(1, 2)).toBe(true);
        });
    
        it("exist when diagonally safe on one side and walled on the other", function () {
            populateBoard(board, [
                    'BBB ',
                    'BB  '
                ]);
            table.update();
            expect(table.isSafe(2, 2)).toBe(true);
        });
    });
    
    describe("unsafe discs", function () {
    
        it("exist when blank", function () {
            expect(table.isSafe(1, 1)).toBe(false);
        });
        
        it("exist when one diagonally outflankable /", function () {
            populateBoard(board, [
                    'BB  ',
                    'BBB ',
                    'W   '
                ]);
            table.update();
            expect(table.isSafe(2, 2)).toBe(false);
        });
        
        it("exist when one diagonally outflankable \\", function () {
            populateBoard(board, [
                    'BBB ',
                    'BBBB',
                    'BBBB',
                    ' BBB'
                ]);
            table.update();
            expect(table.isSafe(2, 3)).toBe(false);
        });
        
        it("exist when vertically outflankable", function () {
            populateBoard(board, [
                    'BB B',
                    'BBBB',
                    'BBBB',
                    'BB B'
                ]);
            table.update();
            expect(table.isSafe(2, 3)).toBe(false);
        });
        
        it("exist when horizontally outflankable", function () {
            populateBoard(board, [
                    'BBBB',
                    ' BB ',
                    'BBBB',
                    'BBBB'
                ]);
            table.update();
            expect(table.isSafe(2, 3)).toBe(false);
        });
    });
        
    it("tracks the safe disc count", function () {
        expect(table.getSafeDiscCount(PieceState.BLACK)).toBe(0);
        expect(table.getSafeDiscCount(PieceState.WHITE)).toBe(0);
        populateBoard(board, [
                'WWW ',
                'WWW ',
                ' BBB',
                ' BBB'
            ]);
        table.update();
        expect(table.getSafeDiscCount(PieceState.BLACK)).toBe(5);
        expect(table.getSafeDiscCount(PieceState.WHITE)).toBe(5);
    });
});