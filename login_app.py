import tkinter as tk
from tkinter import messagebox
from db import autenticar_utilizador 
from app_producao_stock import iniciar_app_producao

def abrir_menu(perfil, login_janela):
    # Fecha a janela de login e abre o dashboard/menu adaptado ao perfil
    try:
        login_janela.destroy()
    except Exception:
        pass

    dashboard = tk.Tk()
    dashboard.title(f"Dashboard - {perfil.capitalize()}")
    dashboard.geometry("400x250")

    tk.Label(dashboard, text=f"Bem-vindo! Perfil: {perfil}", font=("Arial", 14)).pack(pady=10)

    btn_frame = tk.Frame(dashboard)
    btn_frame.pack(pady=10)

    def abrir_gestao_utilizadores():
        messagebox.showinfo("Gestão de Utilizadores", "Abrir gestão de utilizadores (POR FAZER!!!).")

    def abrir_relatorios():
        messagebox.showinfo("Relatórios", "Abrir relatórios ((POR FAZER!!!).")

    def abrir_catalogo_clientes():
        messagebox.showinfo("Catálogo", "Abrir catálogo de produtos para cliente ((POR FAZER!!!).")

    def abrir_producao():
        # Chama a aplicação de produção/stock existente
        iniciar_app_producao(perfil)

    def logout():
        dashboard.destroy()
        # opcional: voltar ao login
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
        # fallback para outros perfis (ex: 'operador' antigo)
        tk.Button(btn_frame, text="Produção (Stock)", width=25, command=abrir_producao).pack(pady=5)

    tk.Button(dashboard, text="Sair / Logout", command=logout).pack(pady=10)

    dashboard.mainloop()

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

    def verificar_login():
        user = entry_username.get()
        pwd = entry_password.get()
        
        perfil = autenticar_utilizador(user, pwd)
        
        if perfil:
            abrir_menu(perfil, janela)
        else:
            messagebox.showerror("Erro de Login", "Username ou Palavra-passe incorretos.")

    tk.Button(janela, text="Login", command=verificar_login).pack(pady=10)
    janela.mainloop()

if __name__ == "__main__":
    login()