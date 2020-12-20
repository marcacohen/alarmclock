from flask import Flask
from flask import request
app = Flask(__name__)

@app.route('/')
def save():
    b = request.args.get('b')
    if b:
        b = b.strip();
        with open('brightness', 'w') as file:
            file.write(b)
    return ''

if __name__ == '__main__':
    app.run()
