Math.mod0 = function(value)
{
	return value - Math.floor(value);
}

function GameView(canvasElement, model)
{
	this.id = __newID();
	window[this.id] = this;
	
	this.__canvasElement  = canvasElement;
	this.__model          = model;
	this.__visualPieces   = [];
	this.__redrawInterval = undefined;
	this.__redrawList     = [];
	this.__hovering       = undefined;
	
	var rows = this.getRows();
	var columns = this.getColumns();
	for(var row = 1; row <= rows; row ++)
	{
		this.__visualPieces[row - 1] = [];
		for(var column = 1; column <= columns; column ++)
			this.__visualPieces[row - 1][column - 1] = new GameView.Piece(this, row, column);
	}
	
	this.drawBackground();
	
	this.getCanvasElement().addEventHandler("click", this, "onClick", false);
	this.getCanvasElement().addEventHandler("mousemove", this, "onMouseMove", false);
	this.getCanvasElement().addEventHandler("mouseout", this, "onMouseOut", false);
	this.getCanvasElement().addEventHandler("mousein", this, "onMouseMove", false);
	this.getModel().addEventHandler("boardchanged", this, "updateDisplay");
	this.getModel().addEventHandler("simulationchanged", this, "updateDisplay");
	this.getModel().addEventHandler("interactivechanged", this, "onInteractiveChanged");
	this.getModel().addEventHandler("gameover", this, "onGameOver");
}

__enableEvents(GameView);

GameView.prototype.__borderWidth = 2;
GameView.prototype.__borderStyle = "rgb(0,113,0)";
GameView.prototype.__backgroundStyle = "rgb(0,92,0)";

GameView.prototype.getBorderStyle = function() { return this.__borderStyle; }
GameView.prototype.getBorderWidth = function() { return this.__borderWidth; }
GameView.prototype.getBackgroundStyle = function() { return this.__backgroundStyle; }


GameView.prototype.getCanvasElement = function() { return this.__canvasElement; }
GameView.prototype.getDrawingContext = function() { return this.getCanvasElement().getContext("2d"); }
GameView.prototype.getModel = function() { return this.__model; }
GameView.prototype.getRows = function() { return this.__model.getRows(); }
GameView.prototype.getColumns = function() { return this.__model.getColumns(); }
GameView.prototype.getWidth = function() { return this.__canvasElement.width; }
GameView.prototype.getHeight = function() { return this.__canvasElement.height; }

GameView.prototype.drawBackground = function(ctx)
{
	if(ctx == undefined)
		ctx = this.getDrawingContext();
	
	var b = this.getBorderWidth();
	var o = Math.ceil(b / 2);
	var w = this.getWidth() - b;
	var h = this.getHeight() - b;
	var r = this.getRows();
	var c = this.getColumns();
	
	ctx.globalCompositeOperation = "source-over";
	
	ctx.fillStyle = this.getBackgroundStyle();
	ctx.fillRect(o, o, w, h);

	ctx.strokeStyle = this.getBorderStyle();
	ctx.lineWidth = b;
	
	for(var i = 0; i <= r; i ++)
	{
		var y = Math.floor(h * (i / r) + o) - Math.mod0(b / 2);
		ctx.moveTo(0, y);
		ctx.lineTo(w + b, y);
	}

	for(var i = 0; i <= c; i ++)
	{
		var x = Math.floor(w * (i / c) + o) - Math.mod0(b / 2);
		ctx.moveTo(x, 0);
		ctx.lineTo(x, h + b);
	}
	ctx.stroke();
}

GameView.prototype.getPieceArea = function(row, column)
{
	var b = this.getBorderWidth();
	var o = Math.ceil(b / 2);
	var w = this.getWidth() - b;
	var h = this.getHeight() - b;
	var r = this.getRows();
	var c = this.getColumns();
	
	var left = b + w * ((column - 1) / c);
	var top = b + h * ((row - 1) / r);
	var width = w / c - b;
	var height = h / r - b;
	
	if(width > height)
	{
		left += (width - height) / 2;
		width = height;
	}
	else
	{
		top += (height - width) / 2;
		height = width;
	}
	
	return { x: Math.floor(left), y: Math.floor(top), w: Math.floor(width), h: Math.floor(height) };
}

GameView.prototype.getPositionFromXY = function(x, y)
{
	var b = this.getBorderWidth();
	var o = Math.ceil(b / 2);
	var w = this.getWidth() - b;
	var h = this.getHeight() - b;
	var r = this.getRows();
	var c = this.getColumns();

	x -= o;
	y -= o;
	x = Math.floor(x / (w / c)) + 1;
	y = Math.floor(y / (h / r)) + 1;

	if(x < 1) x = 1;
	if(y < 1) y = 1;
	if(x > c) x = c;
	if(y > r) y = r;
	return {row: y, column: x};
}

GameView.prototype.queueDrawing = function(piece)
{
	this.__redrawList.push(piece);
	if(this.__redrawInterval == undefined)
		this.__redrawInterval = setInterval("window." + this.id + ".draw();", 10);
}

GameView.prototype.draw = function()
{
	var ctx = this.getDrawingContext();
	var newList = [];
	var oldList = this.__redrawList;
	while(oldList.length > 0)
	{
		var item = oldList.shift();
		var rect = this.getPieceArea(item.row, item.column);
		
		ctx.save();
		ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
		ctx.scale(rect.w/100, rect.h/100);
		
		if(item.draw(ctx))
			newList.push(item);
		ctx.restore();
	}
	this.__redrawList = newList;
	if(newList.length == 0)
	{
		clearInterval(this.__redrawInterval);
		this.__redrawInterval = undefined;
	}
}

GameView.prototype.updateDisplay = function()
{
	var rows = this.getRows();
	var columns = this.getColumns();
	var model = this.getModel();
	
	for(var r = 1; r <= rows; r ++)
		for(var c = 1; c <= columns; c ++)
		{
			var core = model.getPiece(r, c);
			var color = model.getSimulatedPiece(r, c);
			this.__visualPieces[r - 1][c - 1].update(color, core);
		}
}

GameView.prototype.onClick = function(sender, event)
{
	if(!this.__hovering)
		return;
	
	var row = this.__hovering.row;
	var column = this.__hovering.column;
	var model = this.getModel();
	
	model.move(row, column, model.getTurn());
}

GameView.prototype.onMouseMove = function(sender, event)
{
	var x = event.offsetX == undefined ? event.layerX : event.offsetX;
	var y = event.offsetY == undefined ? event.layerY : event.offsetY; 
	var oldHovering = this.__hovering;
	var hovering = this.__hovering = this.getPositionFromXY(x, y);
	var model = this.getModel();
	
	if(oldHovering &&
	   oldHovering.row == hovering.row &&
	   oldHovering.column == hovering.column)
		return;
	
	if(!model.isInteractive())
		return;
	
	model.simulateMove(hovering.row, hovering.column, model.getTurn());
}

GameView.prototype.onMouseOut = function(sender, event)
{
	if(this.__hovering)
	{
		this.__hovering = undefined;
		model.clearSimulation();
	}
}

GameView.prototype.onInteractiveChanged = function(sender, event)
{
	this.getCanvasElement().className = event.newValue ? "" : "busy";
}

GameView.prototype.onGameOver = function(sender, event)
{
	this.getCanvasElement().className = "gameover";
	
	var black = this.getModel().getBlackScore();
	var white = this.getModel().getWhiteScore();
	
	var changes = [];
	for(var i = 0; i < 64; i ++)
	{
		var cm1 = i % 8;
		var rm1 = (i - cm1) / 8;
		if(i < black)
			changes.push(new Change(rm1 + 1, cm1 + 1, BLACK));
		else if(64 - i <= white)
			changes.push(new Change(rm1 + 1, cm1 + 1, WHITE));
		else
			changes.push(new Change(rm1 + 1, cm1 + 1, EMPTY));
	}
	
	this.getModel().setPieces(changes);
}




GameView.Piece = function(gameView, row, column)
{
	this.gameView = gameView;
	this.row = row;
	this.column = column;
	this.oldColor = EMPTY;
	this.oldCore = EMPTY;	
	this.color = EMPTY;
	this.core = EMPTY;	
	this.tick = 0;
}

GameView.Piece.prototype.FLIP_STEPS = 20;

GameView.Piece.prototype.update = function(color, core)
{
	if(!this.isFlipping())
	{
		// We are not currently flipping the piece over.
		
		this.oldColor = this.color;
		this.oldCore = this.core;
		this.color = color != undefined ? color : core;
		this.core = core;
		
		// If the piece is changing color, flip.
		if(this.oldColor != this.color)
			this.startFlipping();
		
		// Otherwise, if the core isn't changing, quit.
		else if(this.oldCore == this.core)
			return;
		
		// Otherwise, if the core is disappearing, just update.
		else if(this.core == this.color)
			this.refresh();
		
		// Otherwise, we are adding a core. Flip.
		else
			this.startFlipping();
	}
	else if(this.isHalfwayFlipped())
	{
		// Piece is overhalfway done. Make it reverse directions.
		this.oldColor = this.color;
		this.oldCore = this.core;
		this.color = color != undefined ? color : core;
		this.core = core;
		this.tick = this.FLIP_STEPS - this.tick;
	}
	else
	{
		// Less than halfway flipped. Just change what we're flipping to.
		this.color = color != undefined ? color : core;
		this.core = core;
	}
}

GameView.Piece.prototype.isFlipping = function()
{
	return this.tick > 0;
}

GameView.Piece.prototype.isHalfwayFlipped = function()
{
	return this.tick <= this.FLIP_STEPS / 2;
}

GameView.Piece.prototype.startFlipping = function()
{
	this.tick = this.FLIP_STEPS;
	this.gameView.queueDrawing(this);
}

GameView.Piece.prototype.refresh = function()
{
	this.tick = 0;
	this.gameView.queueDrawing(this);
}

GameView.Piece.prototype.getFill = function(color)
{
	if(color == BLACK)
		return "black";
	else if(color == WHITE)
		return "white";
	else return this.gameView.getBackgroundStyle();
}

GameView.Piece.prototype.draw = function(ctx)
{
	if(this.tick < 0)
		return false;
	
	var color = this.getFill(this.isHalfwayFlipped() ? this.color : this.oldColor);
	var core = this.getFill(this.isHalfwayFlipped() ? this.core  : this.oldCore );
	
	ctx.fillStyle = this.getFill(EMPTY);
	ctx.fillRect(-50, -50, 100, 100);

	ctx.moveTo(0, 0);
	ctx.rotate(-Math.PI / 4);
	var shift = Math.min(this.tick, this.FLIP_STEPS - this.tick);
	if(shift * 2 != this.FLIP_STEPS) {
		ctx.scale(1,Math.abs(1 - shift * 2 / this.FLIP_STEPS));
		this.drawCircle(ctx, color, 40);
		if(core != color)
			this.drawCircle(ctx, core, 10);
	}
	this.tick --;
	
	return true;
}

GameView.Piece.prototype.drawCircle = function(ctx, color, radius)
{
	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.moveTo(0, 0);
	ctx.arc(0, 0, radius, 0, 2 * Math.PI, true);
	ctx.fill();
	ctx.closePath();
}
