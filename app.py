from flask import Flask, request, jsonify
import json
from werkzeug.security import check_password_hash
from flask_cors import CORS

app = Flask(__name__)
# 允许所有来源的CORS请求，特别是针对/login路径
CORS(app, resources={r"/login": {"origins": "*"}})

def load_users():
    with open('users.json', 'r', encoding='utf-8') as file:
        return json.load(file)

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'success': False, 'message': '用户名和密码都是必填项'}), 400

    username = data['username']
    password = data['password']

    users = load_users()
    found_user = next((user for user in users if user['username'] == username), None)

    if not found_user:
        return jsonify({'success': False, 'message': '用户名不存在'}), 404

    # 使用werkzeug的安全哈希函数来验证密码
    if check_password_hash(found_user['password_hash'], password):
        return jsonify({'success': True, 'message': '登录成功'})
    else:
        return jsonify({'success': False, 'message': '密码错误'}), 401

if __name__ == '__main__':
    app.run(debug=True)