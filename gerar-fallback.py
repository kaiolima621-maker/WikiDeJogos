#!/usr/bin/env python3
"""Gera data/games-data.js a partir de data/games.json.

O games.json é a fonte dos dados. O games-data.js é uma cópia em JavaScript
que permite abrir o index.html com duplo clique (sem servidor), porque o
navegador bloqueia fetch() de arquivos locais.

Rode sempre que editar o games.json:  python3 gerar-fallback.py
"""
import json
from pathlib import Path

base = Path(__file__).resolve().parent
dados = json.loads((base / "data" / "games.json").read_text(encoding="utf-8"))
saida = "window.WIKI_DB = " + json.dumps(dados, ensure_ascii=False, indent=2) + ";\n"
(base / "data" / "games-data.js").write_text(saida, encoding="utf-8")
print("games-data.js atualizado:", len(dados["jogos"]), "jogos")
