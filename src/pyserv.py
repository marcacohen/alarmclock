from flask import Flask
from flask import request
app = Flask(__name__)

FILE = '/sys/class/backlight/rpi_backlight/brightness'

@app.route('/')
def save():
    b = request.args.get('b')
    if b:
        b = b.strip();
        with open(FILE, 'w') as file:
            file.write(b)
    return ''

if __name__ == '__main__':
    app.run()
