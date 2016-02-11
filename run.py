from gevent import monkey
from threading import Thread
from flask import Flask, render_template
from flask_socketio import SocketIO, emit

monkey.patch_all()

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret!"
socketio = SocketIO(app, async_mode="gevent")
thread = None

@app.route("/<path:color>/")
def index(color):
	friend = "white"
	enemy = "black"

	if(color != "white"):
		friend = "black"
		enemy = "white"

	return render_template("index.html", friend = friend, enemy = enemy)

@socketio.on("send-move", namespace="/move")
def move(data):

	emit("receive-move", {
		"x0": abs(7 - data["x0"]),
		"y0": abs(7 - data["y0"]),
		"x1": abs(7 - data["x1"]),
		"y1": abs(7 - data["y1"]),
		"player": data["player"]
	}, broadcast = True)

if __name__ == "__main__":
	socketio.run(app, debug = True, host = "0.0.0.0", port = 5061)
