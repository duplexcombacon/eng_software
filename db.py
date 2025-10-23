import pyodbc

def conectar_bd():
    try:
        conn = pyodbc.connect(
            'DRIVER={ODBC Driver 17 for SQL Server};'
            'SERVER=PC-RONI\\SQLEXPRESS;'
            'DATABASE=VinhosPortugal;'
            'Trusted_Connection=yes;'  #usa as credenciais do pc
        )
        return conn
    except Exception as e:
        print("\n--- ERRO NA LIGAÇÃO À BASE DE DADOS ---")
        print(f"Detalhes do erro: {e}")
        return None
    
#função de login (eng software)

def autenticar_utilizador(username, password):
    """Verifica as informações na base de dados e retorna o perfil."""
    conn = conectar_bd()
    if conn:
        cursor = conn.cursor()
        try:
            # Seleciona o Perfil (e a Password) baseado no Username
            cursor.execute("SELECT Password, Perfil FROM Utilizador WHERE Username = ?", (username,))
            resultado = cursor.fetchone()
            
            if resultado:
                db_password = resultado[0]
                perfil = resultado[1]
                
                # verficar a pass
                # (perguntar ao stor se devemos incluir hash como segurança)
                if db_password == password:
                    return perfil  # devolve o perfil se as informações estiverem corretas
                
        except Exception as e:
            messagebox.showerror("Erro SQL", f"Erro ao autenticar: {e}")
        finally:
            conn.close()
            
    return None # retorna none se falhar ou infos erradas