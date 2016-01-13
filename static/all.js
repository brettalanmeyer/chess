$(function(){

	var board;

	var Board = function(w, h){

		this.squares = [];
		this.pieces = [];

		for(var x = 0; x < w; x++){
			this.squares[x] = [];
			this.pieces[x] = [];
			for(var y = 0; y < h; y++){
				this.pieces[x][y] = null;
				this.squares[x][y] = null;
			}
		}

		for(var y = h - 1; y >= 0; y--){
			for(var x = 0; x < w; x++){
				var square = new Square(x, y);
				this.squares[square.x][square.y] = square;
				$(".board").append(square.getElement());
			}
		}

		this.add = function(piece){
			this.pieces[piece.x][piece.y] = piece;
			this.getSquare(piece.x, piece.y).getElement().append(piece.getElement());
		};

		this.getSquare = function(x, y){
			return this.squares[x][y];
		};

		this.getPiece = function(x, y){
			return this.pieces[x][y];
		};

		this.isValidMove = function(x, y){
			if(x < 0) return false;
			if(x > w - 1) return false;
			if(y < 0) return false;
			if(y > h - 1) return false;
			return true;
		};

		this.highlight = function(x, y){
			this.getSquare(x, y).highlight();
		};

		this.unhighlight = function(){
			for(var x = 0; x < this.pieces.length; x++){
				for(var y = 0; y < this.pieces[x].length; y++){
					this.squares[x][y].unhighlight();
				}
			}
		};

		this.unselect = function(){
			for(var x = 0; x < this.pieces.length; x++){
				for(var y = 0; y < this.pieces[x].length; y++){
					var piece = this.pieces[x][y];
					if(piece != null){
						piece.unselect();
					}
				}
			}
		};

	};

	var Square = function(x, y){
		this.x = x;
		this.y = y;
		this.highlighted = false;

		var square = $("<div />").addClass("square").attr("data-x", this.x).attr("data-y", this.y);
		var coord = $("<span />").addClass("coords").html(this.x + "," + this.y);
		square.html(coord);

		square.on("click", function(){
		});

		this.getElement = function(){
			return square;
		};

		this.highlight = function(){
			this.highlighted = true;
			square.addClass("highlight");
		};

		this.unhighlight = function(){
			this.highlighted = false;
			square.removeClass("highlight");
		};
	};

	var Piece = function(x, y, color){
		this.x = x;
		this.y = y;
		this.color = color;
		this.selected = false;

		this.select = function(){
			this.selected = true;
		};

		this.unselect = function(){
			this.selected = false;
		};

		this.getElement = function(){
			return piece;
		};

		var piece = $("<div />").addClass("piece").addClass(this.color).addClass(this.kind);
		var that = this;
		piece.on("click", function(){
			if(that.selected){
				board.unselect();
				board.unhighlight();
				return;
			}

			board.unselect();
			board.unhighlight();
			that.selected = true;
			var moves = that.getValidMoves();
			for(var i in moves){
				var move = moves[i];
				board.highlight(move.x, move.y);
			}
		});
	};

	var Pawn = function(x, y, color){
		this.kind = "pawn";
		this.moved = false;

		this.getValidMoves = function(){
			var moves = [];

			var yDir = +1;
			if(this.color == "black"){
				yDir = -1;
			}

			var y2 = this.y + yDir;
			if(board.isValidMove(this.x, y2)){
				moves.push({ x: this.x, y: y2 });
			}

			if(!this.moved){
				var y2 = this.y + (yDir * 2);
				if(board.isValidMove(this.x, y2)){
					moves.push({ x: this.x, y: y2 });
				}
			}

			return moves;
		};

		Piece.call(this, x, y, color);
	};

	var Rook = function(x, y, color){
		this.kind = "rook";

		this.getValidMoves = function(){
			var moves = [];

			for(var i = -7; i <= 7; i++){
				if(i == 0) continue;

				if(board.isValidMove(this.x + i, this.y)){
					moves.push({ x: this.x + i, y: this.y });
				}

				if(board.isValidMove(this.x, this.y + i)){
					moves.push({ x: this.x, y: this.y + i });
				}
			}

			return moves;
		};

		Piece.call(this, x, y, color);
	};

	var Knight = function(x, y, color){
		this.kind = "knight";

		this.getValidMoves = function(){
			var moves = [];

			var coords = [
				{ x: -1, y: +2 },
				{ x: +1, y: +2 },
				{ x: -1, y: -2 },
				{ x: +1, y: -2 },
				{ x: -2, y: +1 },
				{ x: -2, y: -1 },
				{ x: +2, y: +1 },
				{ x: +2, y: -1 },
			];

			for(var i in coords){
				var coord = coords[i];
				if(board.isValidMove(this.x + coord.x, this.y + coord.y)){
					moves.push({ x: this.x + coord.x, y: this.y + coord.y });
				}
			}

			return moves;
		};

		Piece.call(this, x, y, color);
	};

	var Bishop = function(x, y, color){
		this.kind = "bishop";

		this.getValidMoves = function(){
			var moves = [];

			for(var i = -7; i <= 7; i++){
				if(board.isValidMove(this.x + i, this.y + i)){
					moves.push({ x: this.x + i, y: this.y + i });
				}

				if(board.isValidMove(this.x + i, this.y - i)){
					moves.push({ x: this.x + i, y: this.y - i });
				}
			}

			return moves;
		};

		Piece.call(this, x, y, color);
	};

	var Queen = function(x, y, color){
		this.kind = "queen";

		this.getValidMoves = function(){
			var moves = [];

			for(var i = -7; i <= 7; i++){
				if(i == 0) continue;

				if(board.isValidMove(this.x + i, this.y)){
					moves.push({ x: this.x + i, y: this.y });
				}

				if(board.isValidMove(this.x, this.y + i)){
					moves.push({ x: this.x, y: this.y + i });
				}

				if(board.isValidMove(this.x + i, this.y + i)){
					moves.push({ x: this.x + i, y: this.y + i });
				}

				if(board.isValidMove(this.x + i, this.y - i)){
					moves.push({ x: this.x + i, y: this.y - i });
				}
			}

			return moves;
		};


		Piece.call(this, x, y, color);
	};

	var King = function(x, y, color){
		this.kind = "king";

		this.getValidMoves = function(){
			var moves = [];

			var coords = [
				{ x: +0, y: +1 },
				{ x: +0, y: -1 },
				{ x: +1, y: +1 },
				{ x: +1, y: +0 },
				{ x: +1, y: -1 },
				{ x: -1, y: +1 },
				{ x: -1, y: +0 },
				{ x: -1, y: -1 }
			];

			for(var i in coords){
				var coord = coords[i];
				if(board.isValidMove(this.x + coord.x, this.y + coord.y)){
					moves.push({ x: this.x + coord.x, y: this.y + coord.y });
				}
			}

			return moves;
		};

		Piece.call(this, x, y, color);
	};



	board = new Board(8, 8);

	for(var i = 0; i < 8; i++){
		board.add(new Pawn(i, 1, "white"));
		board.add(new Pawn(i, 6, "black"));
	}

	board.add(new Rook(0, 0, "white"));
	board.add(new Rook(7, 0, "white"));
	board.add(new Rook(0, 7, "black"));
	board.add(new Rook(7, 7, "black"));

	board.add(new Knight(1, 0, "white"));
	board.add(new Knight(6, 0, "white"));
	board.add(new Knight(1, 7, "black"));
	board.add(new Knight(6, 7, "black"));

	board.add(new Bishop(2, 0, "white"));
	board.add(new Bishop(5, 0, "white"));
	board.add(new Bishop(2, 7, "black"));
	board.add(new Bishop(5, 7, "black"));

	board.add(new Queen(3, 0, "white"));
	board.add(new Queen(4, 7, "black"));

	board.add(new King(4, 0, "white"));
	board.add(new King(3, 7, "black"));

});
