import tkinter as tk
from tkinter import messagebox
# Garantir que temos a função de fallback para autenticação local
from db import autenticar_utilizador
from app_producao_stock import iniciar_app_producao  # ADICIONADO: necessário para abrir a aplicação de produção

# API endpoint (ajusta se a API correr noutra porta)
API_URL = "http://localhost:5000/api/auth/login"

# Substituir 'import requests' por import seguro com fallback para urllib
try:
    import requests
    _HAS_REQUESTS = True
except Exception:
    import urllib.request
    import urllib.error
    import json
    _HAS_REQUESTS = False

# comentário: envia um pedido post json (usa requests ou urllib como fallback)
def send_post(url, payload, timeout=5):
    if _HAS_REQUESTS:
        return requests.post(url, json=payload, timeout=timeout)
    else:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                body = resp.read().decode('utf-8')
                status = resp.getcode()
                class RespLike: pass
                r = RespLike()
                r.status_code = status
                r.text = body
                try:
                    parsed = json.loads(body)
                except Exception:
                    parsed = None
                r.json = lambda: parsed
                return r
        except urllib.error.HTTPError as e:
            body = e.read().decode('utf-8') if hasattr(e, 'read') else str(e)
            class RespLike: pass
            r = RespLike()
            r.status_code = e.code if hasattr(e, 'code') else 500
            r.text = body
            try:
                parsed = json.loads(body)
            except Exception:
                parsed = None
            r.json = lambda: parsed
            return r
        except Exception as e:
            raise

# comentário: abre o dashboard/menu adaptado ao perfil do utilizador
def abrir_menu(perfil, login_janela):
    # Fecha a janela de login e abre o dashboard/menu adaptado ao perfil
    try:
        login_janela.destroy()
    except Exception:
        pass

    dashboard = tk.Tk()
    dashboard.title(f"Dashboard - {perfil.capitalize() if perfil else 'Utilizador'}")
    dashboard.geometry("400x260")

    tk.Label(dashboard, text=f"Bem-vindo! Perfil: {perfil}", font=("Arial", 14)).pack(pady=10)

    btn_frame = tk.Frame(dashboard)
    btn_frame.pack(pady=10)

    def abrir_gestao_utilizadores():
        messagebox.showinfo("Gestão de Utilizadores", "Abrir gestão de utilizadores (placeholder).")

    def abrir_relatorios():
        messagebox.showinfo("Relatórios", "Abrir relatórios (placeholder).")

    def abrir_catalogo_clientes():
        messagebox.showinfo("Catálogo", "Abrir catálogo de produtos para cliente (placeholder).")

    def abrir_producao():
        iniciar_app_producao()

    def logout():
        dashboard.destroy()
        login()

    # Botões por perfil
    if perfil == 'admin':
        tk.Button(btn_frame, text="Gestão de Utilizadores", width=25, command=abrir_gestao_utilizadores).pack(pady=5)
        tk.Button(btn_frame, text="Relatórios", width=25, command=abrir_relatorios).pack(pady=5)
        tk.Button(btn_frame, text="Produção (Stock)", width=25, command=abrir_producao).pack(pady=5)
    elif perfil == 'gestor':
        tk.Button(btn_frame, text="Relatórios", width=25, command=abrir_relatorios).pack(pady=5)
        tk.Button(btn_frame, text="Produção (Stock)", width=25, command=abrir_producao).pack(pady=5)
    elif perfil == 'cliente':
        tk.Button(btn_frame, text="Consultar Produtos", width=25, command=abrir_catalogo_clientes).pack(pady=5)
    else:
        tk.Button(btn_frame, text="Produção (Stock)", width=25, command=abrir_producao).pack(pady=5)

    tk.Button(dashboard, text="Sair / Logout", command=logout).pack(pady=10)
    dashboard.mainloop()

# comentário: cria a janela de login e valida credenciais (usa api ou fallback)
def login():
    janela = tk.Tk()
    janela.title("Login Vinhos Portugal")
    janela.geometry("300x200")

    tk.Label(janela, text="Username:").pack(pady=5)
    entry_username = tk.Entry(janela)
    entry_username.pack(pady=5)

    tk.Label(janela, text="Password:").pack(pady=5)
    entry_password = tk.Entry(janela, show="*") # esconde a password
    entry_password.pack(pady=5)

    # comentário: função interna que valida e processa o login (chamada pelo botão)
    def verificar_login():
        user = entry_username.get()
        pwd = entry_password.get()

        # Tenta usar a API Flask primeiro (usa send_post com fallback)
        resp = send_post(API_URL, {'username': user, 'password': pwd}, timeout=5)
        if resp.status_code == 200:
            perfil = resp.json().get('perfil') if resp.json() else None
            abrir_menu(perfil, janela)
            return
        elif resp.status_code in (400, 401):
            messagebox.showerror("Erro de Login", resp.json().get('message', 'Credenciais inválidas.') if resp.json() else 'Credenciais inválidas.')
            return
        else:
            messagebox.showerror("Erro", f"API error: {resp.status_code} {resp.text}")
            return

    tk.Button(janela, text="Login", command=verificar_login).pack(pady=10)
    janela.mainloop()

if __name__ == "__main__":
    login()


    #backup
    #def verificar_login():
        #user = entry_username.get()
        #pwd = entry_password.get()

        # Tenta usar a API Flask primeiro (usa send_post com fallback)
        #try:
            #resp = send_post(API_URL, {'username': user, 'password': pwd}, timeout=5)
            #if resp.status_code == 200:
                #perfil = resp.json().get('perfil') if resp.json() else None
                #abrir_menu(perfil, janela)
                #return
            #elif resp.status_code in (400, 401):
                #messagebox.showerror("Erro de Login", resp.json().get('message', 'Credenciais inválidas.') if resp.json() else 'Credenciais inválidas.')
                #return
            #else:
                #messagebox.showerror("Erro", f"API error: {resp.status_code} {resp.text}")
                #return
        #except Exception:
            # fallback: tentar autenticar diretamente na BD
            #perfil = autenticar_utilizador(user, pwd)
            #if perfil:
                #abrir_menu(perfil, janela)
            #else:
                #messagebox.showerror("Erro de Login", "API indisponível e credenciais inválidas/localmente.")