import os
import pyodbc

# comentário: estabelece a ligação à base de dados usando variáveis de ambiente
def conectar_bd():
    """
    Conecta à BD usando variáveis de ambiente:
    - DB_SERVER (ex: localhost\\SQLEXPRESS ou 127.0.0.1:1433)
    - DB_DATABASE
    - DB_USER (opcional; se não existir usa Trusted Connection)
    - DB_PASSWORD (opcional)
    """
    driver = os.getenv('DB_DRIVER', 'ODBC Driver 17 for SQL Server')
    server = os.getenv('DB_SERVER', 'localhost\\SQLEXPRESS')
    database = os.getenv('DB_DATABASE', 'VinhosPortugal')
    user = os.getenv('DB_USER', '')
    password = os.getenv('DB_PASSWORD', '')

    # Monta a string de ligação conforme se usa autenticação SQL ou Trusted Connection
    if user and password:
        conn_str = (
            f"DRIVER={{{driver}}};"
            f"SERVER={server};"
            f"DATABASE={database};"
            f"UID={user};"
            f"PWD={password};"
        )
    else:
        conn_str = (
            f"DRIVER={{{driver}}};"
            f"SERVER={server};"
            f"DATABASE={database};"
            "Trusted_Connection=yes;"
        )

    try:
        conn = pyodbc.connect(conn_str, timeout=10)
        return conn
    except Exception as e:
        # Não usar messagebox aqui — só print para debugging (API/serviço trata erros)
        print("\n--- ERRO NA LIGAÇÃO À BASE DE DADOS ---")
        print(f"Detalhes do erro: {e}")
        return None
    
# comentário: autentica um utilizador na base de dados e devolve o perfil ou None
# autenticação (mantém-se para reuso)
def autenticar_utilizador(username, password):
    """Verifica as informações na base de dados e retorna o perfil ou None."""
    conn = conectar_bd()
    if conn:
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT Password, Perfil FROM Utilizador WHERE Username = ?", (username,))
            resultado = cursor.fetchone()
            if resultado:
                db_password = resultado[0]
                perfil = resultado[1]
                if db_password == password:
                    return perfil
        except Exception as e:
            print(f"Erro ao autenticar: {e}")
        finally:
            conn.close()
    return None