import tkinter as tk
from tkinter import messagebox
from db import autenticar_utilizador 
from app_producao_stock import iniciar_app_producao

def abrir_aplicacao(perfil, login_janela):
    login_janela.destroy() # Fecha a janela de login
    
    # Aqui pode chamar a sua aplicação principal
    # Vamos usar a aplicação de "Produção" como exemplo do Dashboard Inicial (SCRUM-19)
    
    # NOTA: O seu projeto deve ter uma lógica aqui para mostrar o menu de acordo com o PERFIL
    if perfil == 'admin':
        messagebox.showinfo("Sucesso", f"Login efetuado! Perfil: {perfil}")
        pass
    else:
        messagebox.showinfo("Sucesso", f"Login efetuado! Perfil: {perfil}")


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
            abrir_aplicacao(perfil, janela)
        else:
            messagebox.showerror("Erro de Login", "Username ou Palavra-passe incorretos.")

    tk.Button(janela, text="Login", command=verificar_login).pack(pady=10)
    janela.mainloop()

def abrir_aplicacao(perfil, login_janela):
    login_janela.destroy() # fecha a janela de login
    
    if perfil == 'admin':
        messagebox.showinfo("Sucesso", f"Login efetuado! Perfil: {perfil}. A iniciar aplicação de Gestão...")
        iniciar_app_producao(perfil) 
    elif perfil == 'gestor':
        messagebox.showinfo("Sucesso", f"Login efetuado! Perfil: {perfil}. A iniciar aplicação de Gestão...")
        iniciar_app_producao(perfil) 
    elif perfil == 'operador':
        messagebox.showinfo("Sucesso", f"Login efetuado! Perfil: {perfil}. Acesso de operador.")
        iniciar_app_producao(perfil)
    else:
        messagebox.showerror("Erro de Perfil", "Perfil de utilizador desconhecido.")

if __name__ == "__main__":
    login()