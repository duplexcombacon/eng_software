from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from db import autenticar_utilizador, conectar_bd

app = Flask(__name__)
CORS(app)

# comentário: endpoint de login que valida credenciais e devolve o perfil
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username e password são obrigatórios.'}), 400

    try:
        perfil = autenticar_utilizador(username, password)
        if perfil:
            return jsonify({'message': 'Login bem-sucedido!', 'perfil': perfil}), 200
        else:
            return jsonify({'message': 'Credenciais inválidas.'}), 401
    except Exception as e:
        return jsonify({'message': 'Erro no servidor.', 'error': str(e)}), 500

# comentário: endpoint simples que devolve os dados do dashboard
@app.route('/api/auth/dashboard', methods=['GET'])
def dashboard():
    # Exemplo simples — podes expandir para devolver dados reais da BD por perfil
    dados = [
        { 'id': 1, 'info': 'Total de Vendas', 'valor': 15000 },
        { 'id': 2, 'info': 'Stock de Garrafas', 'valor': 8500 }
    ]
    return jsonify({'message': 'Bem-vindo ao Dashboard!', 'dados': dados}), 200

# comentário: endpoint que testa a ligação à base de dados
@app.route('/api/check-db', methods=['GET'])
def check_db():
    conn = conectar_bd()
    if conn:
        try:
            conn.close()
            return jsonify({'ok': True, 'message': 'Conexão à BD OK'}), 200
        except:
            return jsonify({'ok': False, 'message': 'Erro ao fechar conexão'}), 500
    else:
        return jsonify({'ok': False, 'message': 'Falha ao conectar à BD'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PY_API_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
