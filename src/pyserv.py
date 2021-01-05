from flask import Flask
from flask import request
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, resources={r"/": {"origins": "*"}})

FILE = '/sys/class/backlight/rpi_backlight/brightness'

@app.route('/')
def save():
    b = request.args.get('b')
    if b:
        b = b.strip();
        try:
            with open(FILE, 'w') as file:
                file.write(b)
        except:
            pass
    return ''

if __name__ == '__main__':
    app.run()
