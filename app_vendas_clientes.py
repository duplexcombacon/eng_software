import tkinter as tk
from tkinter import ttk, messagebox
from datetime import date
from db import conectar_bd  # ligar a bd

# comentário: janela para gerir clientes (listar, adicionar, eliminar)
def janela_clientes():
    janela = tk.Toplevel()
    janela.title("Gestão de Clientes")
    janela.geometry("900x500")

    # formulário
    frame_form = tk.Frame(janela)
    frame_form.pack(pady=10)

    labels = ["Nome", "NIF", "Morada", "País", "Telefone", "Tipo de Cliente"]
    entradas = {}

    for i, label in enumerate(labels):
        tk.Label(frame_form, text=label + ":").grid(row=i, column=0, sticky="e")
        entry = tk.Entry(frame_form)
        entry.grid(row=i, column=1)
        entradas[label] = entry

    # funções
    def listar_clientes():
        for item in tree.get_children():
            tree.delete(item)
        conn = conectar_bd()
        if conn:
            cursor = conn.cursor()
            cursor.execute("SELECT ID_Cliente, Nome, NIF, Tipo_Cliente, Morada, Pais, Telefone FROM Cliente")
            for row in cursor.fetchall():
                valores = tuple(str(item).strip() for item in row)
                tree.insert("", tk.END, values=valores)
            conn.close()

    def adicionar_cliente():
        valores = [entradas[l].get() for l in labels]
        if not valores[0] or not valores[1] or not valores[5]:
            messagebox.showwarning("Aviso", "Nome, NIF e Tipo de Cliente são obrigatórios.")
            return
        conn = conectar_bd()
        if conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM Cliente WHERE NIF = ?", (valores[1],))
            if cursor.fetchone()[0] > 0:
                messagebox.showwarning("Aviso", f"Já existe um cliente com o NIF {valores[1]}.")
                conn.close()
                return
            cursor.execute("""
                INSERT INTO Cliente (Nome, NIF, Morada, Pais, Telefone, Tipo_Cliente)
                VALUES (?, ?, ?, ?, ?, ?)""", valores)
            conn.commit()
            conn.close()
            messagebox.showinfo("Sucesso", "Cliente adicionado com sucesso!")
            listar_clientes()

    def eliminar_cliente():
        item = tree.focus()
        if not item:
            return
        id_cliente = tree.item(item)['values'][0]
        conn = conectar_bd()
        if conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM Venda WHERE ID_Cliente = ?", (id_cliente,))
            if cursor.fetchone()[0] > 0:
                messagebox.showwarning("Aviso", "Não é possível eliminar: o cliente tem vendas associadas.")
                return
            cursor.execute("DELETE FROM Cliente WHERE ID_Cliente = ?", (id_cliente,))
            conn.commit()
            conn.close()
            listar_clientes()

    # botões
    tk.Button(janela, text="Adicionar Cliente", command=adicionar_cliente).pack(pady=5)
    tk.Button(janela, text="Eliminar Cliente", command=eliminar_cliente).pack(pady=5)
    tk.Button(janela, text="Listar Clientes", command=listar_clientes).pack(pady=5)

    # treeview
    colunas = ("ID", "Nome", "NIF", "Tipo_Cliente", "Morada", "País", "Telefone")
    tree = ttk.Treeview(janela, columns=colunas, show="headings")
    for col in colunas:
        tree.heading(col, text=col)
        tree.column(col, width=120)
    tree.pack(pady=10, fill="both", expand=True)

    listar_clientes()

# comentário: janela para registar vendas e ver/exportar vendas
# janela de registo de vendas
def janela_vendas():
    janela = tk.Toplevel()
    janela.title("Registo de Vendas")
    janela.geometry("750x600")

    # campos
    tk.Label(janela, text="Cliente:").pack()
    combo_cliente = ttk.Combobox(janela)
    combo_cliente.pack()

    tk.Label(janela, text="Lote:").pack()
    combo_lote = ttk.Combobox(janela, width=45)
    combo_lote.pack()

    tk.Label(janela, text="Quantidade:").pack()
    entry_qtd = tk.Entry(janela)
    entry_qtd.pack()

    tk.Label(janela, text="Preço Unitário:").pack()
    entry_preco = tk.Entry(janela)
    entry_preco.pack()

    tk.Label(janela, text="Estado da Venda:").pack()
    combo_estado = ttk.Combobox(janela, values=["Pendente", "Entregue", "Paga"])
    combo_estado.pack()
    combo_estado.current(0)

    tk.Label(janela, text="Tipo de Venda:").pack()
    combo_tipo = ttk.Combobox(janela, values=["Nacional", "Exportação"])
    combo_tipo.pack()
    combo_tipo.current(0)

    # tabela
    tree = ttk.Treeview(janela, columns=("ID_Lote", "Quantidade", "Preço", "Total"), show="headings")
    for col in tree["columns"]:
        tree.heading(col, text=col)
        tree.column(col, width=100)
    tree.pack(pady=10)

    lbl_total = tk.Label(janela, text="Total: € 0.00")
    lbl_total.pack()

    # funções

    def carregar_dropdowns():
        conn = conectar_bd()
        if conn:
            cursor = conn.cursor()
            cursor.execute("SELECT ID_Cliente, Nome FROM Cliente")
            combo_cliente['values'] = [f"{c[0]} - {c[1]}" for c in cursor.fetchall()]
            cursor.execute("""
                SELECT l.ID_Lote, v.Nome_Comercial, l.Quantidade_Disponivel
                FROM Lote l
                JOIN Vinho v ON l.ID_Vinho = v.ID_Vinho
                WHERE l.Quantidade_Disponivel > 0
            """)
            combo_lote['values'] = [f"{l[0]} - {l[1]} - Qtde: {l[2]}" for l in cursor.fetchall()]
            conn.close()

    def atualizar_total():
        total = sum(float(tree.item(i)['values'][3]) for i in tree.get_children())
        lbl_total.config(text=f"Total: € {total:.2f}")

    def adicionar_produto():
        try:
            id_lote = int(combo_lote.get().split(" - ")[0])
            qtd = int(entry_qtd.get())
            preco = float(entry_preco.get())
        except:
            messagebox.showwarning("Aviso", "Preencha corretamente todos os campos.")
            return

        conn = conectar_bd()
        if conn:
            cursor = conn.cursor()
            cursor.execute("SELECT Quantidade_Disponivel FROM Lote WHERE ID_Lote = ?", (id_lote,))
            disponivel = cursor.fetchone()[0]
            conn.close()

            # Soma da quantidade já no carrinho para o mesmo ID_Lote
            qtd_existente = sum(
                int(tree.item(i)['values'][1]) for i in tree.get_children()
                if int(tree.item(i)['values'][0]) == id_lote
            )

            if qtd + qtd_existente > disponivel:
                messagebox.showwarning("Aviso", f"Stock insuficiente.\nDisponível: {disponivel}\nJá adicionado: {qtd_existente}")
                return

        total = qtd * preco
        tree.insert("", "end", values=(id_lote, qtd, preco, total))
        atualizar_total()
        entry_qtd.delete(0, tk.END)
        entry_preco.delete(0, tk.END)

    def remover_produto():
        sel = tree.selection()
        if not sel:
            messagebox.showwarning("Aviso", "Selecione uma linha para remover.")
            return
        tree.delete(sel)
        atualizar_total()

    def registar_venda():
        if not combo_cliente.get():
            messagebox.showwarning("Aviso", "Selecione um cliente.")
            return
        if not tree.get_children():
            messagebox.showwarning("Aviso", "Adicione pelo menos um produto.")
            return

        try:
            id_cliente = int(combo_cliente.get().split(" - ")[0])
            data = date.today()
            estado = combo_estado.get()
            tipo = combo_tipo.get()

            conn = conectar_bd()
            if not conn:
                messagebox.showerror("Erro", "Erro de ligação à base de dados.")
                return

            cursor = conn.cursor()

            cursor.execute("""
                INSERT INTO Venda (ID_Cliente, Data, Valor_Total, Estado, Tipo_Venda)
                VALUES (?, ?, ?, ?, ?)
            """, (id_cliente, data, 0, estado, tipo))
            conn.commit()

            cursor.execute("SELECT MAX(ID_Venda) FROM Venda")
            id_venda = cursor.fetchone()[0]

            total_geral = 0
            for item in tree.get_children():
                id_lote, qtd, preco, total = tree.item(item)['values']
                cursor.execute("""
                    INSERT INTO Detalhe_Venda (ID_Venda, ID_Lote, Quantidade, Preco_Unitario, Desconto)
                    VALUES (?, ?, ?, ?, 0)
                """, (id_venda, id_lote, qtd, preco))
                cursor.execute("""
                    UPDATE Lote
                    SET Quantidade_Disponivel = Quantidade_Disponivel - ?
                    WHERE ID_Lote = ?
                """, (qtd, id_lote))
                total_geral += float(total)

            cursor.execute("UPDATE Venda SET Valor_Total = ? WHERE ID_Venda = ?", (total_geral, id_venda))
            conn.commit()
            conn.close()

            tree.delete(*tree.get_children())
            lbl_total.config(text="Total: € 0.00")
            messagebox.showinfo("Sucesso", "Venda registada com sucesso!")

        except Exception as e:
            messagebox.showerror("Erro", f"Ocorreu um erro ao registar: {e}")
    
    #Tabelas vew
    def ver_vendas():
        janela = tk.Toplevel()
        janela.title("Visualização de Vendas")
        janela.geometry("800x500")

        tree = ttk.Treeview(janela, columns=("ID", "Data", "Cliente", "Quantidade", "Preço Total", "Vinho"), show="headings")
        for col in tree["columns"]:
            tree.heading(col, text=col)
        tree.pack(pady=10, fill="both", expand=True)

        def carregar_vendas():
            for item in tree.get_children():
                tree.delete(item)
            conn = conectar_bd()
            if conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT v.ID_Venda, v.Data, c.Nome, 
                        SUM(dv.Quantidade), 
                        SUM(dv.Quantidade * dv.Preco_Unitario),
                        vi.Nome_Comercial
                    FROM Venda v
                    JOIN Cliente c ON v.ID_Cliente = c.ID_Cliente
                    JOIN Detalhe_Venda dv ON v.ID_Venda = dv.ID_Venda
                    JOIN Lote l ON dv.ID_Lote = l.ID_Lote
                    JOIN Vinho vi ON l.ID_Vinho = vi.ID_Vinho
                    GROUP BY v.ID_Venda, v.Data, c.Nome, vi.Nome_Comercial
                """)
                for linha in cursor.fetchall():
                    tree.insert("", "end", values=[str(c) for c in linha])
                conn.close()

        carregar_vendas()


    def ver_exportacoes():
        janela = tk.Toplevel()
        janela.title("Visualização de Exportações")
        janela.geometry("800x500")

        tree = ttk.Treeview(janela, columns=("ID", "País", "Data", "Quantidade", "Vinho"), show="headings")
        for col in tree["columns"]:
            tree.heading(col, text=col)
        tree.pack(pady=10, fill="both", expand=True)

        def carregar_exportacoes():
            for item in tree.get_children():
                tree.delete(item)
            conn = conectar_bd()
            if conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT e.ID_Exportacao, e.Pais_Destino, e.Data_Exportacao, e.Quantidade, vin.Nome_Comercial
                    FROM Exportacao e
                    JOIN Vinho vin ON e.ID_Vinho = vin.ID_Vinho
                """)
                for linha in cursor.fetchall():
                    tree.insert("", "end", values=[str(c) for c in linha])
                conn.close()

        carregar_exportacoes()

    # === BOTÕES ===
    tk.Button(janela, text="Adicionar Produto", command=adicionar_produto).pack(pady=5)
    tk.Button(janela, text="Remover Produto", command=remover_produto).pack(pady=5)
    tk.Button(janela, text="Registar Venda", command=registar_venda).pack(pady=5)
    tk.Button(janela, text="Ver Vendas", width=25, command=ver_vendas).pack(pady=5)
    tk.Button(janela, text="Ver Exportações", width=25, command=ver_exportacoes).pack(pady=5)



    carregar_dropdowns()

# comentário: janela para registar exportações (ligada às vendas)
# janela de exportações
def janela_exportacoes():
    janela = tk.Toplevel()
    janela.title("Registo de Exportações")
    janela.geometry("500x500")

    # === CAMPOS ===
    tk.Label(janela, text="Venda:").pack()
    combo_venda = ttk.Combobox(janela, width=40)
    combo_venda.pack()

    tk.Label(janela, text="País de Destino:").pack()
    entry_pais = tk.Entry(janela)
    entry_pais.pack()

    tk.Label(janela, text="Volume (L):").pack()
    entry_volume = tk.Entry(janela)
    entry_volume.pack()

    tk.Label(janela, text="Tipo de Documento:").pack()
    entry_tipo_doc = tk.Entry(janela)
    entry_tipo_doc.pack()

    tk.Label(janela, text="Número do Documento:").pack()
    entry_num_doc = tk.Entry(janela)
    entry_num_doc.pack()

    tk.Label(janela, text="Data do Documento:").pack()
    entry_data_doc = tk.Entry(janela)
    entry_data_doc.insert(0, date.today().strftime("%Y-%m-%d"))  # Preenche com data de hoje
    entry_data_doc.pack()

    tk.Label(janela, text="Valor (€):").pack()
    entry_valor = tk.Entry(janela)
    entry_valor.pack()

    def carregar_vendas():
        conn = conectar_bd()
        if conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT v.ID_Venda, c.Nome 
                FROM Venda v
                JOIN Cliente c ON v.ID_Cliente = c.ID_Cliente
                ORDER BY v.ID_Venda DESC
            """)
            combo_venda['values'] = [f"{v[0]} - {v[1]}" for v in cursor.fetchall()]
            conn.close()

    def registar_exportacao():
        if not combo_venda.get():
            messagebox.showwarning("Aviso", "Selecione uma venda.")
            return

        try:
            venda_id = int(combo_venda.get().split(" - ")[0])
            pais = entry_pais.get()
            volume = float(entry_volume.get())
            tipo_doc = entry_tipo_doc.get()
            num_doc = entry_num_doc.get()
            data_doc = entry_data_doc.get()
            valor = float(entry_valor.get())

            conn = conectar_bd()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO Exportacao (Venda_ID, Pais_Destino, Volume, Tipo_Doc, Num_Doc, Data_Doc, Valor)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (venda_id, pais, volume, tipo_doc, num_doc, data_doc, valor))
            conn.commit()
            conn.close()

            messagebox.showinfo("Sucesso", "Exportação registada com sucesso!")
            janela.destroy()

        except Exception as e:
            messagebox.showerror("Erro", f"Erro ao registar exportação: {e}")

    tk.Button(janela, text="Registar Exportação", command=registar_exportacao).pack(pady=10)

    carregar_vendas()

# ===========================
# MENU PRINCIPAL
# ===========================
root = tk.Tk()
root.title("Gestão de Vendas e Exportações")
root.geometry("300x250")

status_msg = "Ligação à base de dados: OK" if conectar_bd() else "Erro de ligação!"
tk.Label(root, text=status_msg, fg="green" if "OK" in status_msg else "red").pack(pady=10)

btn_clientes = tk.Button(root, text="Gerir Clientes", width=25, command=janela_clientes)
btn_clientes.pack(pady=10)

btn_vendas = tk.Button(root, text="Registar Vendas", width=25, command=janela_vendas)
btn_vendas.pack(pady=10)

btn_exportacoes = tk.Button(root, text="Registar Exportações", width=25, command=janela_exportacoes)
btn_exportacoes.pack(pady=10)

root.mainloop()
