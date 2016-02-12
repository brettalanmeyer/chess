$(function(){

	var board;

	var Board = function(){

		var boardEl = $(".board");
		var width = 8;
		var height = 8;

		this.player = "white";
		this.player1 = "white";
		this.player2 = "black";

		this.squares = [];
		this.pieces = [];
		this.validMoves = [];
		this.selectedPiece = null;

		// white always move first
		this.turn = "white";

		var that = this;

		this.init = function(){

			if(boardEl.hasClass("black")){
				that.player = "black";
				that.player1 = "black";
				that.player2 = "white";
			}

			// define position for squares and pieces in array for w x h board
			for(var x = 0; x < width; x++){
				this.squares[x] = [];
				this.pieces[x] = [];
				for(var y = 0; y < height; y++){
					this.pieces[x][y] = null;
					this.squares[x][y] = null;
				}
			}

			var coordEl = $("<div />").addClass("coord");

			boardEl.append(coordEl.clone().addClass("letter number"));
			for(var i = 0; i < 8; i++){
				boardEl.append(coordEl.clone().addClass("letter").html(String.fromCharCode(97 + i)));
			}
			boardEl.append(coordEl.clone().addClass("letter number"));

			// add square html elements to board
			for(var y = height - 1; y >= 0; y--){
				boardEl.append(coordEl.clone().addClass("number").html(y + 1));
				for(var x = 0; x < width; x++){
					var square = new Square(x, y);
					this.squares[square.x][square.y] = square;
					boardEl.append(square.getElement());
				}
				boardEl.append(coordEl.clone().addClass("number").html(y + 1));
			}

			boardEl.append(coordEl.clone().addClass("letter number"));
			for(var i = 0; i < 8; i++){
				boardEl.append(coordEl.clone().addClass("letter").html(String.fromCharCode(97 + i)));
			}
			boardEl.append(coordEl.clone().addClass("letter number"));

			return this;
		}

		// add pieces to board
		this.add = function(piece){
			this.pieces[piece.x][piece.y] = piece;
			this.getSquare(piece.x, piece.y).getElement().html(piece.getElement());
		};

		this.getSquare = function(x, y){
			return this.squares[x][y];
		};

		this.getPiece = function(x, y){
			return this.pieces[x][y];
		};

		// detemine if square is within the bounds of the w x h board
		this.isSquareInBounds = function(x, y){
			if(x < 0) return false;
			if(x > width - 1) return false;
			if(y < 0) return false;
			if(y > height - 1) return false;
			return true;
		};

		// move object and html from source to destination
		this.moveSelectedPieceTo = function(x, y){
			var piece = board.getSelectedPiece();

			board.killPiece(x, y);
			board.movePiece(piece.x, piece.y, x, y);

			this.turn = this.turn == "white" ? "black" : "white";
			$(".turn .value").html(this.turn);
		};

		// remove piece from board and move to jail
		this.killPiece = function(x, y){
			var enemy = this.getPiece(x, y);

			if(enemy == null) return;

			var jailSquare = $(".jail." + enemy.color + " .square").not(".taken").first();

			enemy.getElement().detach();
			jailSquare.addClass("taken").html(enemy.getElement());

			this.pieces[enemy.x][enemy.y] = null;
			enemy.x = null;
			enemy.y = null;
			enemy.dead = true;
		};

		this.movePiece = function(x0, y0, x1, y1){
			var piece = board.getPiece(x0, y0);
			piece.getElement().detach();

			var square = board.getSquare(x1, y1);
			square.getElement().append(piece.getElement());

			this.pieces[piece.x][piece.y] = null;
			piece.x = x1;
			piece.y = y1;
			piece.moved = true;
			this.pieces[piece.x][piece.y] = piece;

			board.clearValidMoves();
			sendMove(x0, y0, x1, y1);
		};

		this.castle = function(piece){

			var king = board.getSelectedPiece();
			var rook = piece;

			if(king == null) return false;
			if(rook == null) return false;

			if(king.moved == true) return false;
			if(rook.moved == true) return false;

			if(king.kind != "king") return false;
			if(rook.kind != "rook") return false;

			var y = 0;
			var xStart = 1;
			var xEnd = 3;
			var xRook = 3;
			var xKing = 2;
			if(rook.x == 7){
				xStart = 5;
				xEnd = 6;
				xRook = 5;
				xKing = 6;
			}

			for(var x = xStart; x <= xEnd; x++){
				if(board.getPiece(x, y) != null){
					return false;
				}
			}

			board.movePiece(rook.x, 0, xRook, 0);
			board.movePiece(king.x, 0, xKing, 0);

			return true;
		};

		this.determineIfInCheck = function(color){

			for(var i = 0; i < width; i++){
				for(var j = 0; j < height; j++){

					var piece = this.pieces[i][j];
					if(piece == null) continue;
					if(piece.color != color) continue;

					var moves = piece.select();

					for(var k in moves){
						var move = moves[k];
						var piece = board.pieces[move.x][move.y];
						if(piece != null && piece.kind == "king"){
							alert(piece.color + " king is in check");
						}
						board.clearValidMoves();
					}
				}
			}
		};

		this.setValidMoves = function(moves){
			for(var i in moves){
				var move = moves[i];
				$(".square[data-x=" + move.x + "][data-y=" + move.y + "]").addClass("highlight");
			}
			this.validMoves = moves;
		};

		this.getValidMoves = function(){
			return this.validMoves;
		};

		this.clearValidMoves = function(){
			$(".square").removeClass("highlight");
			this.validMoves = [];
		};

		this.hasSelectedPiece = function(){
			return this.selectedPiece != null;
		};

		this.setSelectedPiece = function(piece){
			this.selectedPiece = piece;
		};

		this.getSelectedPiece = function(){
			return this.selectedPiece;
		};

		this.clearSelectedPiece = function(){
			$(".square").removeClass("highlight");
			this.selectedPiece = null;
		};
	};

	var Square = function(x, y){
		this.x = x;
		this.y = y;

		var square = $("<div />").addClass("square").attr("data-x", this.x).attr("data-y", this.y);

		var that = this;

		this.select = function(){
			if(!that.isValid()){
				return;
			}
			var piece = board.getSelectedPiece();
			board.moveSelectedPieceTo(that.x, that.y);
			board.determineIfInCheck(piece.color);
		};

		// return jquery object
		this.getElement = function(){
			return square;
		};

		this.isValid = function(){
			var moves = board.getValidMoves();
			for(var i in moves){
				var move = moves[i];
				if(move.x == this.x && move.y == this.y) return true;
			}
			return false;
		};

		square.on("click", this.select);
	};

	var Piece = function(x, y, color){
		this.x = x;
		this.y = y;
		this.color = color;
		this.moved = false;
		this.dead = false;

		var piece = $("<div />").addClass("piece").addClass(this.color).addClass(this.kind).attr("title", this.kind.charAt(0).toUpperCase() + this.kind.slice(1));

		var that = this;

		this.select = function(checkColor){
			if(checkColor && that.color != board.turn){
				return;
			}

			if(board.castle(that)){
				return;
			}

			if(board.hasSelectedPiece() && board.getSelectedPiece() == that){
				board.clearSelectedPiece();
				return;
			} else {
				board.setSelectedPiece(that);
			}

			var moves = that.getValidMoves();
			board.setValidMoves(moves);
			return moves;
		};


		this.getElement = function(){
			return piece;
		};

		this.isFriend = function(piece){
			return this.color == piece.color;
		}

		this.isEnemy = function(piece){
			return this.color != piece.color;
		}

		piece.on("click", function(){
			if(board.player != board.turn){
				return;
			}
			that.select(true);
		});

	};

	var Pawn = function(x, y, color){
		this.kind = "pawn";

		this.getValidMoves = function(){
			var moves = [];
			var that = this;

			var yDir = +1;
			if(this.color == board.player2){
				yDir = -1;
			}

			var x = this.x;
			var y1 = this.y + yDir;
			var piece1 = board.getPiece(x, y1);

			if(board.isSquareInBounds(x, y1) && piece1 == null){
				moves.push({ x: x, y: y1 });
			}

			if(!this.moved){
				var y2 = this.y + (yDir * 2);
				var piece2 = board.getPiece(x, y2);
				if(board.isSquareInBounds(x, y2) && piece2 == null){
					moves.push({ x: x, y: y2 });
				}
			}

			checkKill(x - 1, this.y + yDir);
			checkKill(x + 1, this.y + yDir);

			function checkKill(x, y){
				if(!board.isSquareInBounds(x, y)) return;

				var piece = board.getPiece(x, y);
				if(piece != null && piece.isEnemy(that)){
					moves.push({ x: x, y: y });
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
			var that = this;
			var moveCheckers = [];

			for(var i = 0; i < 4; i++){
				moveCheckers.push(new MoveChecker());
			}

			for(var i = 1; i <= 7; i++){
				moveCheckers[0].check(this, this.x, this.y + i);	// north
				moveCheckers[1].check(this, this.x + i, this.y);	// east
				moveCheckers[2].check(this, this.x, this.y - i);	// south
				moveCheckers[3].check(this, this.x - i, this.y);	// west
			}

			for(var i in moveCheckers){
				moves = moves.concat(moveCheckers[i].getMoves());
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
				var x = this.x + coord.x;
				var y = this.y + coord.y;

				if(board.isSquareInBounds(x, y)){
					var piece = board.getPiece(x, y);
					if(piece == null || piece.isEnemy(this)){
						moves.push({ x: x, y: y });
					}
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
			var that = this;
			var moveCheckers = [];

			for(var i = 0; i < 4; i++){
				moveCheckers.push(new MoveChecker());
			}

			for(var i = 1; i <= 7; i++){
				moveCheckers[0].check(this, this.x + i, this.y + i); // north east
				moveCheckers[1].check(this, this.x + i, this.y - i); // south east
				moveCheckers[2].check(this, this.x - i, this.y + i); // north west
				moveCheckers[3].check(this, this.x - i, this.y - i); // south west
			}

			for(var i in moveCheckers){
				moves = moves.concat(moveCheckers[i].getMoves());
			}

			return moves;
		};

		Piece.call(this, x, y, color);
	};

	var Queen = function(x, y, color){
		this.kind = "queen";

		this.getValidMoves = function(){
			var moves = [];
			var that = this;
			var moveCheckers = [];

			for(var i = 0; i < 8; i++){
				moveCheckers.push(new MoveChecker());
			}

			for(var i = 1; i <= 7; i++){
				moveCheckers[0].check(this, this.x, this.y + i);		// north
				moveCheckers[1].check(this, this.x + i, this.y + i);	// north east
				moveCheckers[2].check(this, this.x + i, this.y);		// east
				moveCheckers[3].check(this, this.x + i, this.y - i);	// south east
				moveCheckers[4].check(this, this.x, this.y - i);		// south
				moveCheckers[5].check(this, this.x - i, this.y - i);	// south west
				moveCheckers[6].check(this, this.x - i, this.y);		// west
				moveCheckers[7].check(this, this.x - i, this.y + i);	// north west
			}

			for(var i in moveCheckers){
				moves = moves.concat(moveCheckers[i].getMoves());
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
				var x = this.x + coord.x;
				var y = this.y + coord.y;

				if(board.isSquareInBounds(x, y)){
					var piece = board.getPiece(x, y);
					if(piece == null || piece.isEnemy(this)){
						moves.push({ x: x, y: y });
					}
				}
			}

			return moves;
		};

		Piece.call(this, x, y, color);
	};

	var MoveChecker = function(){
		this.cont = true;
		this.moves = [];

		this.check = function(piece, x, y){
			if(!this.cont) return;
			if(!board.isSquareInBounds(x, y)){
				this.cont = false;
				return;
			}

			var boardPiece = board.getPiece(x, y);
			if(boardPiece == null || boardPiece.isEnemy(piece)) this.moves.push({ x: x, y: y });
			if(boardPiece != null) this.cont = false;
		};

		this.getMoves = function(){
			return this.moves;
		};
	};



	board = new Board().init();

	for(var i = 0; i < 8; i++){
		board.add(new Pawn(i, 1, board.player1));
		board.add(new Pawn(i, 6, board.player2));
	}

	board.add(new Rook(0, 0, board.player1));
	board.add(new Rook(7, 0, board.player1));
	board.add(new Rook(0, 7, board.player2));
	board.add(new Rook(7, 7, board.player2));

	board.add(new Knight(1, 0, board.player1));
	board.add(new Knight(6, 0, board.player1));
	board.add(new Knight(1, 7, board.player2));
	board.add(new Knight(6, 7, board.player2));

	board.add(new Bishop(2, 0, board.player1));
	board.add(new Bishop(5, 0, board.player1));
	board.add(new Bishop(2, 7, board.player2));
	board.add(new Bishop(5, 7, board.player2));


	var x1 = board.player1 == "white" ? 3 : 4;
	var x2 = board.player1 == "white" ? 4 : 3;

	board.add(new Queen(x1, 0, board.player1));
	board.add(new King(x2, 0, board.player1));

	board.add(new Queen(x1, 7, board.player2));
	board.add(new King(x2, 7, board.player2));





	var socket = io.connect("http://" + document.domain + ':' + location.port + "/move");
	var send = true;

	socket.on("receive-move", function(data){

		if(data.player != board.player){

			send = false;

			var piece = board.getPiece(data.x0, data.y0);
			piece.select(false);

			var square = board.getSquare(data.x1, data.y1);
			square.select();

			board.turn = data.player == "white" ? "black" : "white";

			send = true;

		}

	});

	function sendMove(x0, y0, x1, y1){
		if(!send) return;

		socket.emit("send-move", {
			"x0": x0,
			"y0": y0,
			"x1": x1,
			"y1": y1,
			"player": board.turn
		});

	}

});
