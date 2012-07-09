Math.mod0 = function (value) {
    return value - Math.floor(value);
};

function GameView (canvasSelector, model) {
    
    var self = this;
    var canvasElement = document.querySelector(canvasSelector);
    
    this.__canvasElement  = canvasElement;
    this.__model          = model;
    this.__visualPieces   = [];
    this.__redrawInterval = undefined;
    this.__redrawList     = [];
    this.__hoverPosition  = undefined;
    
    model.getBoard().forEachPosition(function(value, row, column) {
        var rowPieces = this.__visualPieces[row - 1] || (this.__visualPieces[row - 1] = []);
        rowPieces[column - 1] = new GameView.Piece(this, row, column);
    }, this);
    
    this.drawBackground();
    
    canvasElement.addEventListener('click', function (event) {
        self.onClick(event);
    }, false);
    
    canvasElement.addEventListener('mousemove', function (event) {
        self.onMouseMove(event);
    }, false);
    
    canvasElement.addEventListener('mouseout', function (event) {
        self.onMouseOut(event);
    }, false);
    
    canvasElement.addEventListener('mousein', function (event) {
        self.onMouseMove(event);
    }, false);
    
    model.addEventListener('boardchanged', function (event) {
        self.updateDisplay();
    }, false);
    
    model.addEventListener('simulationchanged', function (event) {
        self.updateDisplay();
    }, false);
    
    model.addEventListener('interactivechanged', function (event) {
        self.onInteractiveChanged(event);
    }, false);
    
    model.addEventListener('gameover', function (event) {
        self.onGameOver(event);
    }, false);
}

GameView.enableEventsOnPrototype();

/**
 * @private
 */
GameView.prototype.__borderWidth = 2;

/**
 * @private
 */
GameView.prototype.__borderStyle = "rgb(0,113,0)";

/**
 * @private
 */
GameView.prototype.__backgroundStyle = "rgb(0,92,0)";

/**
 * Gets the canvas stroke style used for rendering the border between board sections.
 * 
 * @returns {object}
 */
GameView.prototype.getBorderStyle = function() {
    return this.__borderStyle;
};

/**
 * Gets the pixel width of the border between board sections.
 * 
 * @returns {number}
 */
GameView.prototype.getBorderWidth = function() {
    return this.__borderWidth;
};

/**
 * Gets the canvas fill style used for rendering the game's background.
 * 
 * @returns {Object}
 */
GameView.prototype.getBackgroundStyle = function() {
    return this.__backgroundStyle;
};

/**
 * Gets the canvas the game view is being rendered on.
 * 
 * @returns {CanvasElement}
 */
GameView.prototype.getCanvasElement = function() {
    return this.__canvasElement;
};

/**
 * Gets the drawing context used for rendering the game view on the canvas.
 * 
 * @returns {CanvasRenderingContext2D}
 * @private
 */
GameView.prototype.getDrawingContext = function() {
    return this.getCanvasElement().getContext("2d");
};

/**
 * Gets the game model.
 *
 * @returns {Model} The game model driving the view.
 */
GameView.prototype.getModel = function() {
    return this.__model;
};

/**
 * Gets the number of rows in the game.
 *
 * @returns {number}
 */
GameView.prototype.getRows = function() {
    return this.__model.getRows();
};

/**
 * Gets the number of columns in the game.
 *
 * @returns {number}
 */
GameView.prototype.getColumns = function() {
    return this.__model.getColumns();
};

/**
 * Gets the width of the canvas element rendering the {GameView}.
 *
 * @returns {number}
 */
GameView.prototype.getWidth = function() {
    return this.__canvasElement.width;
};

/**
 * Gets the height of the canvas element rendering the {GameView}.
 *
 * @returns {number}
 */
GameView.prototype.getHeight = function() {
    return this.__canvasElement.height;
};

/**
 * Gets the metrics for the internal game area to avoid multiple lookups.
 *
 * @param {function(number border, number offset, number width, number height, number rows,
 * number columns)} callback A callback to provide the metrics to.  The callback will be
 * executed synchronously.
 * @private
 */
GameView.prototype.getMetrics = function (callback) {
    var border = this.getBorderWidth();
    var offset = Math.ceil(border / 2);
    var width  = this.getWidth() - border;
    var height = this.getHeight() - border;
    var rows = this.getRows();
    var columns = this.getColumns();
    
    callback.call(this, border, offset, width, height, rows, columns);
};

/**
 * Draws the game board background.
 * 
 * @param {CanvasRenderingContext2D} [ctx] The context to draw the background on.
 * @private
 */
GameView.prototype.drawBackground = function (ctx) {
    
    this.getMetrics(function (border, offset, width, height, rows, columns) {
        
        ctx = ctx || this.getDrawingContext();
        ctx.globalCompositeOperation = "source-over";
        
        // Fill background
        ctx.fillStyle = this.getBackgroundStyle();
        ctx.fillRect(offset, offset, width, height);
        
        ctx.strokeStyle = this.getBorderStyle();
        ctx.lineWidth = border;
        
        var index, position;
        
        // Draw horizontal dividing lines.
        for (index = 0; index <= rows; index ++) {
            position = Math.floor(height * (index / rows) + offset) - Math.mod0(border / 2);
            ctx.moveTo(0, position);
            ctx.lineTo(width + border, position);
        }
        
        // Draw vertical dividing lines.
        for (index = 0; index <= columns; index ++) {
            position = Math.floor(width * (index / columns) + offset) - Math.mod0(border / 2);
            ctx.moveTo(position, 0);
            ctx.lineTo(position, height + border);
        }
        
        ctx.stroke();
    });
};

/**
 * Gets the drawing area for a given row and column.
 * 
 * @param {number} row
 * @param {number} column
 * @private
 */
GameView.prototype.getPieceArea = function (row, column) {
    
    var pieceTop, pieceLeft, pieceWidth, pieceHeight;

    this.getMetrics(function (border, offset, width, height, rows, columns) {

        pieceLeft   = border + width  * ((column - 1) / columns);
        pieceTop    = border + height * ((row    - 1) / rows);
        pieceWidth  = width  / columns - border;
        pieceHeight = height / rows    - border;
        
        if (pieceWidth > pieceHeight) {
            pieceLeft += (pieceWidth - pieceHeight) / 2;
            pieceWidth = pieceHeight;
        } else {
            pieceTop += (pieceHeight - pieceWidth) / 2;
            pieceHeight = pieceWidth;
        }
    });
    
    return {
            x: Math.floor(pieceLeft),
            y: Math.floor(pieceTop),
            w: Math.floor(pieceWidth),
            h: Math.floor(pieceHeight)
        };
};

/**
 * Gets the board position from a pixel position on the canvas.
 *
 * @param {number} x A pixel distance from the left of the canvas element.
 * @param {number} y A pixel distance from the top of the canvas element.
 * @private
 */
GameView.prototype.getPositionFromXY = function (x, y) {
    
    var row, column;

    this.getMetrics(function (border, offset, width, height, rows, columns) {
        
        row    = Math.floor((y - offset) / (height / rows   )) + 1;
        column = Math.floor((x - offset) / (width  / columns)) + 1;
        
        row    = Math.min(Math.max(1, row), rows),
        column = Math.min(Math.max(1, column), columns)
    });
    
    return {
            row: row,
            column: column
        };
};

/**
 * Adds a piece to the drawing queue and starts the redraw process if necessary.
 * 
 * @param {GameView.Piece} piece A piece to animate.
 * @private
 */
GameView.prototype.queueDrawing = function (piece) {
    var self = this;
    self.__redrawList.push(piece);
    self.__redrawInterval = this.__redrawInterval || setInterval(function () { self.draw(); }, 10);
};

/**
 * Draws all queued changes.  If not changes are queued, the redraw interval is cleared.
 * @private
 */
GameView.prototype.draw = function () {
    var ctx = this.getDrawingContext();
    var newList = [];
    var oldList = this.__redrawList;
    
    // Consume the redraw list one at a time, rendering the piece and moving the piece to the new
    // redraw list *if* further animation is required.
    while(oldList.length > 0) {
        var item = oldList.shift();
        var rect = this.getPieceArea(item.row, item.column);
        
        // Translate and scale the context around the selected piece.
        // This gives `draw` a consistent 100x100 area to work with.
        ctx.save();
        ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
        ctx.scale(rect.w / 100, rect.h / 100);
        
        // Draw the item
        if(item.draw(ctx)) {
            newList.push(item);
        }
        
        ctx.restore();
    }
    
    // Set the redraw list to the new list of animating pieces.
    // If the list is empty, stop the animation interval.
    this.__redrawList = newList;
    
    if (newList.length == 0) {
        clearInterval(this.__redrawInterval);
        delete this.__redrawInterval;
    }
};

/**
 * Forces a visual update to every piece on the board.
 * @private
 */
GameView.prototype.updateDisplay = function () {
    
    var model = this.getModel();
    
    model.getBoard().forEachPosition(function(value, row, column) {
        var core = model.getPiece(row, column);
        var color = model.getSimulatedPiece(row, column);
        this.__visualPieces[row - 1][column - 1].update(color, core);
    }, this);
};

/**
 * Responds to a click on the game board by attempting a move with the current player.
 *
 * @param {MouseEvent} event The mouse event triggering the method.
 * @private
 */
GameView.prototype.onClick = function (event) {
    
    var hoverPosition = this.__hoverPosition;
    
    if (hoverPosition) {
        var model = this.getModel();
        model.move(hoverPosition.row, hoverPosition.column, model.getTurn());
    }
};

/**
 * Responds to a mouse move event by displaying a simulated move.
 *
 * @param {MouseEvent} event The mouse event triggering the method.
 * @private
 */
GameView.prototype.onMouseMove = function (event) {
    var x = event.offsetX == undefined ? event.layerX : event.offsetX;
    var y = event.offsetY == undefined ? event.layerY : event.offsetY; 
    var oldHoverPosition = this.__hoverPosition;
    var newHoverPosition = this.__hoverPosition = this.getPositionFromXY(x, y);
    var model = this.getModel();
    
    if (oldHoverPosition
            && oldHoverPosition.row    == newHoverPosition.row
            && oldHoverPosition.column == newHoverPosition.column) {
        return;
    }
    
    if (model.isInteractive()) {
        model.simulateMove(newHoverPosition.row, newHoverPosition.column, model.getTurn());
    }
};

/**
 * Responds to a mouse out event by clearing the simulation.
 *
 * @param {MouseEvent} event The mouse event triggering the method.
 * @private
 */
GameView.prototype.onMouseOut = function(event) {
    if(this.__hoverPosition) {
        delete this.__hoverPosition;
        this.getModel().clearSimulation();
    }
};

/**
 * Responds to an interactivity change by updating the style of the canvas.
 * 
 * @param {Object} event The event triggering the method.
 * @private
 */
GameView.prototype.onInteractiveChanged = function (event) {
    var element = this.getCanvasElement();
    var className = element.className;
    
    if(event.newValue) {
        className = className.replace(/\bbusy\b/g, '');
    } else {
        className += ' busy';
    }
    
    element.className = className;
};

/**
 * Responds to a game over event by displaying the game over screen.
 * 
 * @param {Object} event The event triggering the method.
 * @private
 */
GameView.prototype.onGameOver = function (event) {
    this.getCanvasElement().className = 'gameover';
    
    var model = this.getModel();
    var blackCount  = model.getBlackScore();
    var whiteCount  = model.getWhiteScore();
    var totalSpaces = model.getRows() * model.getColumns();
    var changes = [];
    
    model.getBoard().forEachPosition(function(value, row, column, index) {
        var newPiece;
        
        if (index < blackCount) {
            newPiece = PieceState.BLACK;
        } else if (index < totalSpaces - whiteCount) {
            newPiece = PieceState.EMPTY;
        } else {
            newPiece = PieceState.WHITE;
        }
        
        changes.push(new Change(row, column, newPiece));
    }, this);
    
    model.setPieces(changes);
};

/**
 * Creates a new instance of {GameView.Piece} for a specified position on a game view.
 * 
 * @param {GameView} gameView The game view the piece belongs on.
 * @param {number} row The row the piece is at.
 * @param {number} column The column the piece is at.
 * @private
 * @class Represents a game piece.
 */
GameView.Piece = function (gameView, row, column) {
    this.gameView = gameView;
    this.row = row;
    this.column = column;
    this.oldColor = this.oldCore = this.color = this.core = PieceState.EMPTY;    
    this.tick = 0;
};

/**
 * The number of steps in a flip transition.
 *
 * @constant
 */
GameView.Piece.prototype.FLIP_STEPS = 20;

/**
 * Updates the inner and outer colors for the game piece.
 * 
 * <ul>
 * <li>If the outer color has changed, a flip animation is queued.</li>
 * <li>If the inner color has changed, a refresh is queued.</li>
 * <li>Otherwise, the function does nothing.</li>
 * </ul>
 * 
 * @param {number} color A {PieceState} value representing the color of the piece.
 * @param {number} core A {PieceState} value representing the core color of the piece.
 * This value represents the current state of the board in preview operations.
 */
GameView.Piece.prototype.update = function (color, core) {
    var isFlipping = this.isFlipping();
    var isHalfwayFlipped = this.isHalfwayFlipped();
    
    // We have two options.  If we have started flipping but are less than 50% flipped, all we have
    // to do is change to the target for the end of the flip.  Otherwise, we need to do a full 
    // flip, moving from the current color to the target.  In this case, we need to store the 
    // current state as the previous.
    if (!isFlipping || isHalfwayFlipped) {
        this.oldColor = this.color;
        this.oldCore = this.core;
    }
    
    // Update the color.
    this.color = color !== undefined ? color : core;
    this.core = core;
    
    if (!isFlipping) {
        // If a flip isn't currently in progress, start flipping
        
        var colorChanged = this.oldColor != this.color;
        var coreChanged = this.oldCore != this.core;
        var coreMatchesColor = this.core == this.color;
        
        // If nothing has changed, quit.
        if (!coreChanged && !colorChanged) {
            return;
        }
        
        // If only the core changed, refresh without animating.
        // Otherwise, flip the whole piece.
        if (coreChanged && !colorChanged) {
            this.refresh();
        } else {
            this.startFlipping();
        }
        
    } else if(isHalfwayFlipped) {
        // Piece is overhalfway done. Make it reverse directions.
        this.tick = this.FLIP_STEPS - this.tick;
    }
}

/**
 * Gets whether the piece is in the process of flipping.
 *
 * @returns {boolean} True if the piece is flipping, otherwise false.
 */
GameView.Piece.prototype.isFlipping = function() {
    return this.tick > 0;
};

/**
 * Gets whether the current flip is at least halfway complete.
 *
 * @returns {boolean} True if halfway flipped, otherwise false.
 */
GameView.Piece.prototype.isHalfwayFlipped = function () {
    return this.tick <= this.FLIP_STEPS / 2;
};

/**
 * Redraws the piece starting at the beginning of a flip transition.
 */
GameView.Piece.prototype.startFlipping = function () {
    this.tick = this.FLIP_STEPS;
    this.gameView.queueDrawing(this);
};

/**
 * Redraws the piece without animation.
 */
GameView.Piece.prototype.refresh = function () {
    this.tick = 0;
    this.gameView.queueDrawing(this);
};

/**
 * Gets a valid canvas fill color for a {PieceState} value.
 *
 * @param {number} color A {PieceState} value representing piece color.
 * @returns {string} A valid canvas fill style.
 */
GameView.Piece.prototype.getFill = function (color) {
    
    switch(color) {
    
    case PieceState.BLACK:
        return "black";
    
    case PieceState.WHITE:
        return "white";
    
    default:
        return this.gameView.getBackgroundStyle();
    }
};

/**
 * Draws the game piece and its background in its current state and subtracts one from the counter.
 * If the counter is already complete, the function exits without performing an action.
 *
 * @param {CanvasRenderingContext2D} ctx A centered and scaled context such that the piece is at 
 * the origin of its own 100x100 area.
 * @returns {boolean} True if drawing has occurred.  False if the counter was already complete
 * and no action was performed.
 */
GameView.Piece.prototype.draw = function (ctx) {
    var tick = this.tick;
    
    if(tick < 0) {
        return false;
    }
    
    var steps = this.FLIP_STEPS;
    var isHalfwayFlipped = this.isHalfwayFlipped();
    
    // If we're past the halfway point, use the new color. Otherwise use the old color.
    var color = this.getFill(isHalfwayFlipped ? this.color : this.oldColor);
    var core = this.getFill(isHalfwayFlipped ? this.core  : this.oldCore );
    
    // Fill the background color.
    ctx.fillStyle = this.getFill(PieceState.EMPTY);
    ctx.fillRect(-50, -50, 100, 100);
    
    // Draw the circle at its current degree of flipping.
    ctx.moveTo(0, 0);
    ctx.rotate(-Math.PI / 4);
    var shift = Math.min(tick, steps - tick);
    
    if (shift * 2 != steps) {
        ctx.scale(1, Math.abs(1 - shift * 2 / steps));
        this.drawCircle(ctx, color, 40);
        
        if(core != color) {
            this.drawCircle(ctx, core, 10);
        }
    }
    
    this.tick = tick - 1;
    return true;
};

/**
 * Fills a circle at the center of the context.
 * 
 * @param {CanvasRenderingContext2D} ctx A context to draw the circle in the center of.
 * @param {string} color A valid context fill style.
 * @param {number} radius The radius of the circle.
 */
GameView.Piece.prototype.drawCircle = function (ctx, color, radius) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, 0, 2 * Math.PI, true);
    ctx.fill();
    ctx.closePath();
};
