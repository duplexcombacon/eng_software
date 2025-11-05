import tkinter as tk
from tkinter import messagebox, ttk
from db import conectar_bd
from tkcalendar import DateEntry


# comentário: janela para gerir as regiões (listar/inserir)
def janela_regioes():
    janela = tk.Toplevel()
    janela.title("Gestão de Regiões")
    janela.geometry("400x300")

    # ---------- TABELA ----------
    tree = ttk.Treeview(janela, columns=("ID", "Nome"), show="headings")
    tree.heading("ID", text="ID")
    tree.heading("Nome", text="Nome")
    tree.pack(pady=10, fill="both", expand=True)

    def carregar_regioes():
        for item in tree.get_children():
            tree.delete(item)
        conn = conectar_bd()
        if conn:
            cursor = conn.cursor()
            cursor.execute("SELECT ID_Regiao, Nome FROM Regiao")
            for linha in cursor.fetchall():
                tree.insert("", "end", values=[str(c) for c in linha])
            conn.close()

    carregar_regioes()

    # ---------- FORMULÁRIO ----------
    frame = tk.Frame(janela)
    frame.pack(pady=10)

    tk.Label(frame, text="Nome da Região:").grid(row=0, column=0, padx=5)
    entry_nome = tk.Entry(frame)
    entry_nome.grid(row=0, column=1)

    def adicionar_regiao():
        nome = entry_nome.get()
        if nome:
            conn = conectar_bd()
            if conn:
                cursor = conn.cursor()
                try:
                    cursor.execute("INSERT INTO Regiao (Nome) VALUES (?)", (nome,))
                    conn.commit()
                    carregar_regioes()
                    entry_nome.delete(0, tk.END)
                except Exception as e:
                    messagebox.showerror("Erro", f"Erro ao inserir: {e}")
                conn.close()
        else:
            messagebox.showwarning("Aviso", "Preenche o nome da região.")

    btn_adicionar = tk.Button(janela, text="Adicionar Região", command=adicionar_regiao)
    btn_adicionar.pack(pady=10)

# comentário: janela para gerir as castas (listar/inserir)
# ---------- FUNÇÃO: Janela de Gestão de Castas ----------
def janela_castas():
    janela = tk.Toplevel()
    janela.title("Gestão de Castas")
    janela.geometry("500x400")

    tree = ttk.Treeview(janela, columns=("ID", "Nome", "Tipo"), show="headings")
    tree.heading("ID", text="ID")
    tree.heading("Nome", text="Nome")
    tree.heading("Tipo", text="Tipo")
    tree.pack(pady=10, fill="both", expand=True)

    def carregar_castas():
        for item in tree.get_children():
            tree.delete(item)

        conn = conectar_bd()
        if conn:
            cursor = conn.cursor()
            cursor.execute("SELECT ID_Casta, Nome, Tipo FROM Casta")
            for linha in cursor.fetchall():
                tree.insert("", "end", values=[str(campo) for campo in linha])
            conn.close()

    carregar_castas()

    frame = tk.Frame(janela)
    frame.pack(pady=10)

    tk.Label(frame, text="Nome:").grid(row=0, column=0, padx=5)
    entry_nome = tk.Entry(frame)
    entry_nome.grid(row=0, column=1)

    tk.Label(frame, text="Tipo:").grid(row=1, column=0, padx=5)
    combo_tipo = ttk.Combobox(frame, values=["Tinta", "Branca", "Rosada"])
    combo_tipo.grid(row=1, column=1)

    def adicionar_casta():
        nome = entry_nome.get()
        tipo = combo_tipo.get()

        if nome and tipo:
            conn = conectar_bd()
            if conn:
                cursor = conn.cursor()
                try:
                    cursor.execute("INSERT INTO Casta (Nome, Tipo) VALUES (?, ?)", (nome, tipo))
                    conn.commit()
                    carregar_castas()
                    entry_nome.delete(0, tk.END)
                    combo_tipo.set("")
                except Exception as e:
                    messagebox.showerror("Erro", f"Erro ao inserir: {e}")
                conn.close()
        else:
            messagebox.showwarning("Aviso", "Preenche todos os campos.")

    btn_adicionar = tk.Button(janela, text="Adicionar Casta", command=adicionar_casta)
    btn_adicionar.pack(pady=10)

# comentário: janela para gerir as vinhas (listar/inserir)
# ---------- FUNÇÃO: Janela de Gestão de Vinhas ----------
def janela_vinhas():
    janela = tk.Toplevel()
    janela.title("Gestão de Vinhas")
    janela.geometry("800x500")

    tree = ttk.Treeview(janela, columns=("ID", "Localizacao", "Área", "Idade", "Regiao", "Casta"), show="headings")
    for col in tree["columns"]:
        tree.heading(col, text=col)
    tree.pack(pady=10, fill="both", expand=True)

    def carregar_vinhas():
        for item in tree.get_children():
            tree.delete(item)

        conn = conectar_bd()
        if conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT v.ID_Vinha, v.Localizacao, v.Area, v.Idade, r.Nome AS Regiao, c.Nome AS Casta
                FROM Vinha v
                JOIN Regiao r ON v.ID_Regiao = r.ID_Regiao
                JOIN Casta c ON v.ID_CastaPredominante = c.ID_Casta
            """)
            for linha in cursor.fetchall():
                tree.insert("", "end", values=[str(campo) for campo in linha])
            conn.close()

    carregar_vinhas()

    frame = tk.Frame(janela)
    frame.pack(pady=10)

    tk.Label(frame, text="Localização:").grid(row=0, column=0, padx=5)
    entry_localizacao = tk.Entry(frame)
    entry_localizacao.grid(row=0, column=1)

    tk.Label(frame, text="Área (ha):").grid(row=1, column=0, padx=5)
    entry_area = tk.Entry(frame)
    entry_area.grid(row=1, column=1)

    tk.Label(frame, text="Idade (anos):").grid(row=2, column=0, padx=5)
    entry_idade = tk.Entry(frame)
    entry_idade.grid(row=2, column=1)

    tk.Label(frame, text="Região:").grid(row=3, column=0, padx=5)
    combo_regiao = ttk.Combobox(frame)
    combo_regiao.grid(row=3, column=1)

    tk.Label(frame, text="Casta:").grid(row=4, column=0, padx=5)
    combo_casta = ttk.Combobox(frame)
    combo_casta.grid(row=4, column=1)

    def carregar_dropdowns():
        conn = conectar_bd()
        if conn:
            cursor = conn.cursor()
            cursor.execute("SELECT ID_Regiao, Nome FROM Regiao")
            regioes = cursor.fetchall()
            combo_regiao["values"] = [f"{r[0]} - {r[1]}" for r in regioes]

            cursor.execute("SELECT ID_Casta, Nome FROM Casta")
            castas = cursor.fetchall()
            combo_casta["values"] = [f"{c[0]} - {c[1]}" for c in castas]
            conn.close()

    carregar_dropdowns()

    def adicionar_vinha():
        local = entry_localizacao.get()
        area = entry_area.get()
        idade = entry_idade.get()
        regiao = combo_regiao.get().split(" - ")[0]
        casta = combo_casta.get().split(" - ")[0]

        if local and area and idade and regiao and casta:
            conn = conectar_bd()
            if conn:
                cursor = conn.cursor()
                try:
                    cursor.execute("""
                        INSERT INTO Vinha (Localizacao, Area, Idade, ID_Regiao, ID_CastaPredominante)
                        VALUES (?, ?, ?, ?, ?)
                    """, (local, area, idade, regiao, casta))
                    conn.commit()
                    carregar_vinhas()
                    entry_localizacao.delete(0, tk.END)
                    entry_area.delete(0, tk.END)
                    entry_idade.delete(0, tk.END)
                    combo_regiao.set("")
                    combo_casta.set("")
                except Exception as e:
                    messagebox.showerror("Erro", f"Erro ao inserir: {e}")
                conn.close()
        else:
            messagebox.showwarning("Aviso", "Preenche todos os campos.")

    btn_adicionar = tk.Button(janela, text="Adicionar Vinha", command=adicionar_vinha)
    btn_adicionar.pack(pady=10)

# comentário: janela para gerir a produção de uva (listar/inserir com data)
# ---------- FUNÇÃO: Gestão Produção de Uva ----------
def janela_producao_uva():
    janela = tk.Toplevel()
    janela.title("Gestão de Produção de Uva")
    janela.geometry("800x500")

    # ---------- TABELA ----------
    # Alterar a coluna 'Ano' para 'Data da Colheita'
    tree = ttk.Treeview(janela, columns=("ID", "Data_Colheita", "Quantidade", "Vinha", "Casta"), show="headings")
    tree.heading("ID", text="ID")
    tree.heading("Data_Colheita", text="Data da Colheita") # <-- MUDANÇA
    tree.heading("Quantidade", text="Quantidade (ton)")
    tree.heading("Vinha", text="Vinha")
    tree.heading("Casta", text="Casta")
    
    tree.pack(pady=10, fill="both", expand=True)

    def carregar_producoes():
        for item in tree.get_children():
            tree.delete(item)

        conn = conectar_bd()
        if conn:
            cursor = conn.cursor()
            # Alterar a query para ir buscar a nova coluna
            cursor.execute("""
                SELECT p.ID_Producao, p.Data_Colheita, p.Quantidade, v.Localizacao, c.Nome
                FROM Producao_Uva p
                JOIN Vinha v ON p.ID_Vinha = v.ID_Vinha
                JOIN Casta c ON p.ID_Casta = c.ID_Casta
            """)
            for linha in cursor.fetchall():
                # Formatar a data (opcional, mas fica melhor)
                linha_list = list(linha)
                if linha_list[1]: # Se a data não for nula
                    try:
                        # Tenta formatar a data (pode falhar se for string)
                        linha_list[1] = linha_list[1].strftime('%Y-%m-%d')
                    except AttributeError:
                        # Se já for string, deixa estar
                        pass 
                tree.insert("", "end", values=[str(c) for c in linha_list])
            conn.close()

    carregar_producoes()

    # ---------- CAMPOS ----------
    frame = tk.Frame(janela)
    frame.pack(pady=10)

    # MUDANÇA: Substituir Entry do Ano por DateEntry (Calendário)
    tk.Label(frame, text="Data da Colheita:").grid(row=0, column=0, padx=5)
    entry_data = DateEntry(frame, selectmode='day', date_pattern='yyyy-mm-dd') # <-- NOVA LINHA
    entry_data.grid(row=0, column=1)

    tk.Label(frame, text="Quantidade (ton):").grid(row=1, column=0, padx=5)
    entry_qtd = tk.Entry(frame)
    entry_qtd.grid(row=1, column=1)

    tk.Label(frame, text="Vinha:").grid(row=2, column=0, padx=5)
    combo_vinha = ttk.Combobox(frame)
    combo_vinha.grid(row=2, column=1)

    tk.Label(frame, text="Casta:").grid(row=3, column=0, padx=5)
    combo_casta = ttk.Combobox(frame)
    combo_casta.grid(row=3, column=1)

    def carregar_dropdowns():
        conn = conectar_bd()
        if conn:
            cursor = conn.cursor()
            cursor.execute("SELECT ID_Vinha, Localizacao FROM Vinha")
            vinhas = cursor.fetchall()
            combo_vinha["values"] = [f"{v[0]} - {v[1]}" for v in vinhas]
            cursor.execute("SELECT ID_Casta, Nome FROM Casta")
            castas = cursor.fetchall()
            combo_casta["values"] = [f"{c[0]} - {c[1]}" for c in castas]
            conn.close()

    carregar_dropdowns()

    def adicionar_producao():
        # MUDANÇA: Ir buscar a data do calendário
        data = entry_data.get() # <-- NOVA LINHA
        qtd = entry_qtd.get()
        vinha = combo_vinha.get().split(" - ")[0]
        casta = combo_casta.get().split(" - ")[0]

        if data and qtd and vinha and casta: 
            conn = conectar_bd()
            if conn:
                cursor = conn.cursor()
                try:
                    # MUDANÇA: Inserir Data_Colheita em vez de Ano
                    cursor.execute("""
                        INSERT INTO Producao_Uva (Data_Colheita, Quantidade, ID_Vinha, ID_Casta)
                        VALUES (?, ?, ?, ?)
                    """, (data, qtd, vinha, casta)) # <-- MUDANÇA
                    conn.commit()
                    carregar_producoes()
                    entry_data.set_date(None) # Limpa o calendário
                    entry_qtd.delete(0, tk.END)
                    combo_vinha.set("")
                    combo_casta.set("")
                except Exception as e:
                    messagebox.showerror("Erro", f"Erro ao inserir: {e}")
                conn.close()
        else:
            messagebox.showwarning("Aviso", "Preenche todos os campos.")

    btn_adicionar = tk.Button(janela, text="Adicionar Produção", command=adicionar_producao)
    btn_adicionar.pack(pady=10)

# comentário: janela para gerir vinhos e composição
# ---------- FUNÇÃO: Gestão de Vinhos ----------
def janela_vinhos():
    janela = tk.Toplevel()
    janela.title("Gestão de Vinhos")
    janela.geometry("700x500")

    # ---------- TABELA ----------
    tree = ttk.Treeview(janela, columns=("ID", "Nome", "Teor", "Tipo", "Região"), show="headings")
    for col in tree["columns"]:
        tree.heading(col, text=col)
    tree.pack(pady=10, fill="both", expand=True)

    def carregar_vinhos():
        for item in tree.get_children():
            tree.delete(item)
        conn = conectar_bd()
        if conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT v.ID_Vinho, v.Nome_Comercial, v.Teor_Alcoolico, v.Tipo, r.Nome
                FROM Vinho v
                JOIN Regiao r ON v.ID_Regiao = r.ID_Regiao
            """)
            for linha in cursor.fetchall():
                tree.insert("", "end", values=[str(c) for c in linha])
            conn.close()

    carregar_vinhos()

    # ---------- FORMULÁRIO ----------
    frame = tk.Frame(janela)
    frame.pack(pady=10)

    # Nome
    tk.Label(frame, text="Nome Comercial:").grid(row=0, column=0, padx=5, sticky="e")
    entry_nome = tk.Entry(frame)
    entry_nome.grid(row=0, column=1)

    # Teor Alcoólico
    tk.Label(frame, text="Teor Alcoólico (%):").grid(row=1, column=0, padx=5, sticky="e")
    entry_teor = tk.Entry(frame)
    entry_teor.grid(row=1, column=1)

    # Tipo
    tk.Label(frame, text="Tipo:").grid(row=2, column=0, padx=5, sticky="e")
    combo_tipo = ttk.Combobox(frame, values=["Tinto", "Branco", "Rosé", "Espumante"])
    combo_tipo.grid(row=2, column=1)

    # Região
    tk.Label(frame, text="Região:").grid(row=3, column=0, padx=5, sticky="e")
    combo_regiao = ttk.Combobox(frame)
    combo_regiao.grid(row=3, column=1)

    def carregar_dropdowns():
        conn = conectar_bd()
        if conn:
            cursor = conn.cursor()
            cursor.execute("SELECT ID_Regiao, Nome FROM Regiao")
            regioes = cursor.fetchall()
            combo_regiao["values"] = [f"{r[0]} - {r[1]}" for r in regioes]
            conn.close()

    carregar_dropdowns()

    # ---------- INSERIR VINHO ----------
    def janela_composicao_vinho(vinho_id):
        janela = tk.Toplevel()
        janela.title("Composição do Vinho")
        janela.geometry("600x400")

        tk.Label(janela, text=f"ID do Vinho: {vinho_id}", font=("Arial", 12, "bold")).pack(pady=5)

        # Tabela com castas associadas
        tree = ttk.Treeview(janela, columns=("ID_Casta", "Nome", "Percentagem"), show="headings")
        for col in tree["columns"]:
            tree.heading(col, text=col)
        tree.pack(pady=10, fill="both", expand=True)

        # Dropdown e campo de percentagem
        frame = tk.Frame(janela)
        frame.pack(pady=10)

        tk.Label(frame, text="Casta:").grid(row=0, column=0, padx=5)
        combo_casta = ttk.Combobox(frame, width=30)
        combo_casta.grid(row=0, column=1)

        tk.Label(frame, text="Percentagem:").grid(row=1, column=0, padx=5)
        entry_percentagem = tk.Entry(frame)
        entry_percentagem.grid(row=1, column=1)

        # Carregar dropdown
        def carregar_castas():
            conn = conectar_bd()
            if conn:
                cursor = conn.cursor()
                cursor.execute("SELECT ID_Casta, Nome FROM Casta")
                castas = cursor.fetchall()
                combo_casta["values"] = [f"{c[0]} - {c[1]}" for c in castas]
                conn.close()

        # Carregar tabela
        def carregar_tabela():
            for item in tree.get_children():
                tree.delete(item)
            conn = conectar_bd()
            if conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT cv.ID_Casta, c.Nome, cv.Percentagem
                    FROM Composicao_Vinho cv
                    JOIN Casta c ON cv.ID_Casta = c.ID_Casta
                    WHERE cv.ID_Vinho = ?
                """, (vinho_id,))
                for row in cursor.fetchall():
                    tree.insert("", "end", values=[str(campo) for campo in row])
                conn.close()

        carregar_castas()
        carregar_tabela()

        # Função para adicionar casta ao vinho
        def adicionar_casta():
            try:
                casta_id = combo_casta.get().split(" - ")[0]
                perc = int(entry_percentagem.get())

                conn = conectar_bd()
                if conn:
                    cursor = conn.cursor()

                    # Validar soma atual
                    cursor.execute("SELECT SUM(Percentagem) FROM Composicao_Vinho WHERE ID_Vinho = ?", (vinho_id,))
                    soma_atual = cursor.fetchone()[0] or 0
                    if soma_atual + perc > 100:
                        messagebox.showwarning("Aviso", "A soma das percentagens ultrapassa 100%.")
                        return

                    cursor.execute("""
                        INSERT INTO Composicao_Vinho (ID_Vinho, ID_Casta, Percentagem)
                        VALUES (?, ?, ?)
                    """, (vinho_id, casta_id, perc))
                    conn.commit()
                    conn.close()

                    carregar_tabela()
                    combo_casta.set("")
                    entry_percentagem.delete(0, tk.END)

            except Exception as e:
                messagebox.showerror("Erro", f"Erro ao adicionar casta: {e}")

        btn_adicionar = tk.Button(janela, text="Adicionar Casta", command=adicionar_casta)
        btn_adicionar.pack(pady=10)

    def adicionar_vinho():
        nome = entry_nome.get()
        teor = entry_teor.get().replace(",", ".")
        tipo = combo_tipo.get()
        regiao = combo_regiao.get().split(" - ")[0]

        if nome and teor and tipo and regiao:
            try:
                conn = conectar_bd()
                if conn:
                    cursor = conn.cursor()
                    cursor.execute("""
                        INSERT INTO Vinho (Nome_Comercial, Teor_Alcoolico, Tipo, ID_Regiao)
                        OUTPUT INSERTED.ID_Vinho
                        VALUES (?, ?, ?, ?)
                    """, (nome, float(teor), tipo, regiao))
                    vinho_id = cursor.fetchone()[0]
                    conn.commit()

                    

                    carregar_vinhos()
                    entry_nome.delete(0, tk.END)
                    entry_teor.delete(0, tk.END)
                    combo_tipo.set("")
                    combo_regiao.set("")
                    conn.close()
                    janela_composicao_vinho(vinho_id)
            except Exception as e:
                messagebox.showerror("Erro", f"Erro ao inserir: {e}")
        else:
            messagebox.showwarning("Aviso", "Preenche todos os campos.")

    btn_adicionar = tk.Button(janela, text="Adicionar Vinho", command=adicionar_vinho)
    btn_adicionar.pack(pady=10)


# comentário: janela para gerir lotes de vinho (stock)
# ---------- FUNÇÃO: Gestão de Lotes de Vinho ----------
def janela_lotes():
    janela = tk.Toplevel()
    janela.title("Gestão de Lotes de Vinho")
    janela.geometry("950x550")

    # ---------- TABELA DE LOTES ----------
    tree = ttk.Treeview(janela, columns=("ID", "Ano", "Qtd", "Custo", "Engarrafamento", "Garrafas", "Validade", "Stock", "Local", "Vinho"), show="headings")

    # Cabeçalhos
    for col in tree["columns"]:
        tree.heading(col, text=col)

    # Larguras
    tree.column("ID", width=50)
    tree.column("Ano", width=60)
    tree.column("Qtd", width=80)
    tree.column("Custo", width=80)
    tree.column("Engarrafamento", width=110)
    tree.column("Garrafas", width=80)
    tree.column("Validade", width=110)
    tree.column("Stock", width=90)
    tree.column("Local", width=140)
    tree.column("Vinho", width=180)

    tree.pack(pady=10, fill="both", expand=True)

    def carregar_lotes():
        for item in tree.get_children():
            tree.delete(item)

        conn = conectar_bd()
        if conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 
                    l.ID_Lote, l.Ano_Producao, l.Quantidade_Produzida, l.Custo, 
                    l.Data_Engarrafamento, l.N_Garrafas, l.Validade, 
                    l.Quantidade_Disponivel, l.Localizacao_Armazem, v.Nome_Comercial
                FROM Lote l
                JOIN Vinho v ON l.ID_Vinho = v.ID_Vinho
            """)
            for linha in cursor.fetchall():
                tree.insert("", "end", values=[str(c) for c in linha])
            conn.close()

    carregar_lotes()


    # ---------- FORMULÁRIO ----------
    frame = tk.Frame(janela)
    frame.pack(pady=10)

    labels = [
        "Ano", "Qtd Produzida", "Custo", "Data Engarrafamento",
        "Garrafas", "Validade", "Stock Inicial", "Localização Armazém"
    ]
    entries = {}

    for i, label in enumerate(labels):
        tk.Label(frame, text=label + ":").grid(row=i, column=0, padx=5, sticky="e")
        ent = tk.Entry(frame)
        ent.grid(row=i, column=1)
        entries[label] = ent

    # Dropdown do vinho
    tk.Label(frame, text="Vinho:").grid(row=0, column=2, padx=10)
    combo_vinho = ttk.Combobox(frame)
    combo_vinho.grid(row=0, column=3)

    def carregar_dropdown():
        conn = conectar_bd()
        if conn:
            cursor = conn.cursor()
            cursor.execute("SELECT ID_Vinho, Nome_Comercial FROM Vinho")
            vinhos = cursor.fetchall()
            combo_vinho["values"] = [f"{v[0]} - {v[1]}" for v in vinhos]
            conn.close()

    carregar_dropdown()

    # ---------- INSERIR NOVO LOTE ----------
    def adicionar_lote():
        try:
            ano = entries["Ano"].get()
            qtd = entries["Qtd Produzida"].get()
            custo = entries["Custo"].get()
            eng = entries["Data Engarrafamento"].get()
            garrafas = entries["Garrafas"].get()
            validade = entries["Validade"].get()
            stock = entries["Stock Inicial"].get()
            local = entries["Localização Armazém"].get()
            vinho_id = combo_vinho.get().split(" - ")[0]

            if all([ano, qtd, custo, eng, garrafas, validade, stock, local, vinho_id]):
                conn = conectar_bd()
                if conn:
                    cursor = conn.cursor()
                    cursor.execute("""
                        INSERT INTO Lote (
                            Ano_Producao, Quantidade_Produzida, Custo,
                            Data_Engarrafamento, N_Garrafas, Validade,
                            Quantidade_Disponivel, Localizacao_Armazem, ID_Vinho
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (ano, qtd, custo, eng, garrafas, validade, stock, local, vinho_id))
                    conn.commit()
                    conn.close()
                    carregar_lotes()

                    for ent in entries.values():
                        ent.delete(0, tk.END)
                    combo_vinho.set("")
            else:
                messagebox.showwarning("Aviso", "Preenche todos os campos.")
        except Exception as e:
            messagebox.showerror("Erro", f"Erro ao inserir lote: {e}")

    btn_add = tk.Button(janela, text="Adicionar Lote", command=adicionar_lote)
    btn_add.pack(pady=10)


# comentário: gerar relatório de eficiência de vinhas com filtros
# ==========================================================
# relatório de eficiência de vinhas
# ==========================================================
def janela_relatorio_eficiencia():
    janela = tk.Toplevel()
    janela.title("Relatório de Eficiência de Vinhas")
    janela.geometry("900x600")

    # ---------- FRAME DOS FILTROS ----------
    frame_filtros = tk.Frame(janela)
    frame_filtros.pack(pady=10)

    tk.Label(frame_filtros, text="Filtrar por Ano (ex: 2025):").pack(side=tk.LEFT, padx=5)
    entry_filtro_ano = tk.Entry(frame_filtros, width=10)
    entry_filtro_ano.pack(side=tk.LEFT, padx=5)

    tk.Label(frame_filtros, text="Filtrar por Mês (1-12):").pack(side=tk.LEFT, padx=5)
    entry_filtro_mes = tk.Entry(frame_filtros, width=5)
    entry_filtro_mes.pack(side=tk.LEFT, padx=5)

    # ---------- TABELA (Treeview) ----------
    tree = ttk.Treeview(janela, columns=("Vinha", "Area", "ProducaoTotal", "Eficiencia"), show="headings")
    tree.heading("Vinha", text="Vinha (Localização)")
    tree.heading("Area", text="Área (ha)")
    tree.heading("ProducaoTotal", text="Produção Total (ton)")
    tree.heading("Eficiencia", text="Eficiência (ton/ha)")
    tree.pack(pady=10, fill="both", expand=True)

    def carregar_relatorio():
        for item in tree.get_children():
            tree.delete(item)

        conn = conectar_bd()
        if conn:
            cursor = conn.cursor()
            
            # A consulta SQL é a parte mais importante
            query = """
                SELECT 
                    v.Localizacao,
                    v.Area,
                    SUM(p.Quantidade) AS ProducaoTotal
                FROM Vinha v
                LEFT JOIN Producao_Uva p ON v.ID_Vinha = p.ID_Vinha
                WHERE 1=1 
            """
            # NOTA: Usamos LEFT JOIN para mostrar vinhas mesmo que não tenham produção
            
            params = []
            
            ano = entry_filtro_ano.get()
            if ano:
                query += " AND YEAR(p.Data_Colheita) = ? "
                params.append(ano)
                
            mes = entry_filtro_mes.get()
            if mes:
                query += " AND MONTH(p.Data_Colheita) = ? "
                params.append(mes)

            query += " GROUP BY v.Localizacao, v.Area "
            
            try:
                cursor.execute(query, tuple(params))
                
                for row in cursor.fetchall():
                    localizacao = row[0]
                    area_ha = row[1] if row[1] is not None else 0
                    producao_total = row[2] if row[2] is not None else 0
                    
                    # Calcular Eficiência (ton/ha)
                    eficiencia = (producao_total / area_ha) if area_ha > 0 else 0
                    
                    # Formatar os valores
                    valores_finais = [
                        localizacao,
                        f"{area_ha:.2f} ha",
                        f"{producao_total:.2f} ton",
                        f"{eficiencia:.2f} ton/ha"
                    ]
                    
                    tree.insert("", "end", values=valores_finais)
                    
            except Exception as e:
                messagebox.showerror("Erro de Query", f"Erro ao gerar relatório: {e}")
            finally:
                conn.close()

    # Botão para aplicar os filtros
    btn_filtrar = tk.Button(frame_filtros, text="Filtrar / Atualizar", command=carregar_relatorio)
    btn_filtrar.pack(side=tk.LEFT, padx=10)

    # Carregar os dados iniciais (sem filtros)
    carregar_relatorio()


# comentário: função principal que inicia a aplicação de produção/stock
# aplicação principal

def iniciar_app_producao():
    """Inicia a aplicação principal de Produção e Stock."""
    conn = conectar_bd() 

    root = tk.Tk()
    root.title("Gestão de Produção e Stock")
    root.geometry("800x600")
    root.config(bg="#f4f4f4")

    # Status da ligação
    status_msg = "Ligação à base de dados: OK" if conn else "Erro ao ligar à base de dados!"
    if not conn:
        messagebox.showerror("Erro", status_msg)

    lbl_status = tk.Label(root, text=status_msg, font=("Arial", 12), fg="green" if conn else "red", bg="#f4f4f4")
    lbl_status.pack(pady=20)

    # Botões (Menu Principal)
    frame_menu = tk.Frame(root, bg="#f4f4f4")
    frame_menu.pack(expand=True)

    espacamento = 12  # espaço entre botões

    # ==================================================
    # NOVO BOTÃO DE RELATÓRIO (US01)
    # Coloquei-o no topo para o Gestor
    tk.Button(frame_menu, text="Relatório de Eficiência", width=25, command=janela_relatorio_eficiencia, bg="#cce5ff", font=("Arial", 10, "bold")).pack(pady=espacamento)
    # ==================================================

    tk.Button(frame_menu, text="Gerir Regiões", width=25, command=janela_regioes).pack(pady=espacamento)
    tk.Button(frame_menu, text="Gerir Castas", width=25, command=janela_castas).pack(pady=espacamento)
    tk.Button(frame_menu, text="Gerir Vinhas", width=25, command=janela_vinhas).pack(pady=espacamento)
    
    # Este botão agora usa a versão atualizada
    tk.Button(frame_menu, text="Produção de Uva", width=25, command=janela_producao_uva).pack(pady=espacamento) 
    
    tk.Button(frame_menu, text="Gerir Vinhos", width=25, command=janela_vinhos).pack(pady=espacamento)
    tk.Button(frame_menu, text="Lotes de Vinho (Stock)", width=25, command=janela_lotes).pack(pady=espacamento)


    # Arranque da aplicação
    root.mainloop()


# Este bloco SÓ é executado se o ficheiro for corrido diretamente (para testes)
if __name__ == "__main__":
    iniciar_app_producao()
