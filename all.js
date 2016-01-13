/*	// unicode symbols
	pieces = {
		wPawn: "&#9817;",
		wRook: "&#9814;",
		wKnight: "&#9816;",
		wBishop: "&#9815;",
		wQueen: "&#9813;",
		wKing: "&#9812;",
		bPawn: "&#9823;",
		bRook: "&#9820;",
		bKnight: "&#9822;",
		bBishop: "&#9821;",
		bQueen: "&#9819;",
		bKing: "&#9818;"
	};*/


$(function(){


	var Board = function(){

		for(var y = 7; y >= 0; y--){
			for(var x = 0; x < 8; x++){
				var square = $("<div />").addClass("square").attr("data-x", x).attr("data-y", y);
				square.on("click", function(){

				});
				var coord = $("<span />").addClass("coords").html(x + "," + y);
				$(".board").append(square.html(coord));
			}
		}

		var pieces = [];

		for(var x = 0; x < 8; x++){
			pieces[x] = [];

			for(var y = 0; y < 8; y++){
				pieces[x][y] = null;
			}
		}

		this.add = function(piece){
			pieces[piece.x][piece.y] = piece.render();
		};

		this.getSquare = function(x, y){
			return $(".square[data-x=" + x + "][data-y=" + y + "]");
		}
	};

	var Square = function(x, y){

	};

	var Piece = function(x, y, color){
		this.x = x;
		this.y = y;
		this.color = color;
		this.render = function(){
			var piece = $("<div />").addClass("piece").addClass(this.color).addClass(this.kind);
			piece.on("click", function(){
				console.log("click", this);
			})
			board.getSquare(this.x, this.y).append(piece);
		}
	};

	var Pawn = function(x, y, color){
		this.kind = "pawn";
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
