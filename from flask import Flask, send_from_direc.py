from flask import Flask, send_from_directory, make_response
from flask_cors import cross_origin

app = Flask(__name__)

@app.route('/<filename>.txt')
@cross_origin()  # 使用装饰器确保跨域支持
def get_file(filename):
    try:
        response = make_response(send_from_directory('.', f'{filename}.txt', as_attachment=False))
        return response
    except Exception as e:
        return str(e), 404

if __name__ == '__main__':
    app.run(port=8000)