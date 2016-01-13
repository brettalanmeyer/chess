$(function(){

	var Board = function(){

		for(var y = 7; y >= 0; y--){
			for(var x = 0; x < 8; x++){
				var square = new Square(x, y);
				$(".board").append(square.getElement());
			}
		}

		this.add = function(piece){
			this.getSquare(piece.x, piece.y).append(piece.getElement());
		};

		this.getSquare = function(x, y){
			return $(".square[data-x=" + x + "][data-y=" + y + "]");
		};
	};

	var Square = function(x, y){
		var square = $("<div />").addClass("square").attr("data-x", x).attr("data-y", y);
		var coord = $("<span />").addClass("coords").html(x + "," + y);
		square.html(coord);

		square.on("click", function(){
			console.log("square click");
		});

		this.getElement = function(){
			return square;
		};
	};

	var Piece = function(x, y, color){
		this.x = x;
		this.y = y;
		this.color = color;

		var piece = $("<div />").addClass("piece").addClass(this.color).addClass(this.kind);

		piece.on("click", function(){
			console.log("piece click");
		});

		this.getElement = function(){
			return piece;
		};
	};

	var Pawn = function(x, y, color){
		this.kind = "pawn";
		this.moved = false;
		Piece.call(this, x, y, color);
	};

	var Rook = function(x, y, color){
		this.kind = "rook";
		Piece.call(this, x, y, color);
	};

	var Knight = function(x, y, color){
		this.kind = "knight";
		Piece.call(this, x, y, color);
	};

	var Bishop = function(x, y, color){
		this.kind = "bishop";
		Piece.call(this, x, y, color);
	};

	var Queen = function(x, y, color){
		this.kind = "queen";
		Piece.call(this, x, y, color);
	};

	var King = function(x, y, color){
		this.kind = "king";
		Piece.call(this, x, y, color);
	};



	var board = new Board();

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
