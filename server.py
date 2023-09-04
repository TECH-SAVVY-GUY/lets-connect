import json
import base64

import asyncio
import firebase

from flask import Flask
from flask import render_template

from flask_socketio import send
from flask_socketio import SocketIO

import ssl
import bleach
import logging
import gevent.monkey

from pprint import pprint

gevent.monkey.patch_socket()
logging.basicConfig(level=logging.INFO)

app = Flask(__name__, static_url_path='/static')
app.config["SECRET"] = "mysecret"
socketio = SocketIO(
    app, cors_allowed_origins="*", async_mode="gevent",
    max_http_buffer_size=1000 * 1024 * 1024
)

firebaseConfig = {
    'apiKey': "AIzaSyBTEcWt_SGyjpb_pQ0vnKHvp8KY3ayIV9w",
    'authDomain': "let-s-connect-302b8.firebaseapp.com",
    'projectId': "let-s-connect-302b8",
    'storageBucket': "let-s-connect-302b8.appspot.com",
    'databaseURL': "https://let-s-connect-302b8-default-rtdb.asia-southeast1.firebasedatabase.app",
    'messagingSenderId': "206216566962",
    'appId': "1:206216566962:web:db0e419024491dbb4711ab",
    'measurementId': "G-HB54VRM3ZX"
}

firebaseApp = firebase.initialize_app(firebaseConfig)
storage = firebaseApp.storage()  # Initialize Firebase Storage

@socketio.on('message')
def handle_message(data):
    data = json.loads(data)
    message, file = data.get('text'), data.get('file')

    if message:
        message = bleach.clean(message)
        socketio.emit('message', {'text':message})

    if file:
        print("Uploading file...")
        file_name = file["name"]
        file_type = file["type"]
        file_content_base64 = file["content"]

        file_content = base64.b64decode(file_content_base64)

        try:
            storage.child(file_name).put(file_content, file_type)

        except Exception as e:
            print(f"Error uploading file '{file_name}': {str(e)}")

@app.route("/")
def index():
    return render_template("index.html", port=port)

if __name__ == "__main__":

    # port = int(input("Enter the port to host the chat room: "))

    port = 5000

    socketio.run(app, host='0.0.0.0', port=port)


