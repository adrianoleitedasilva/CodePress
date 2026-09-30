=== CodePress ===
Contributors: adrianosilva
Tags: code, syntax highlighting, gutenberg, block, prism
Requires at least: 6.3
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.1.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Blocos de código com aparência profissional para artigos, no estilo do VS Code.

== Description ==

O CodePress adiciona o bloco **CodePress** ao editor (Gutenberg), feito para artigos e tutoriais de programação.

* Destaque de sintaxe (Prism.js) para JavaScript, TypeScript, HTML, CSS, PHP, JSON, SQL, Bash, Python, Java, C#, C e C++.
* Edição com as cores ao vivo: você digita e já vê o código colorido, como numa IDE (Tab indenta; Shift+Tab desindenta; Esc + Tab sai do campo).
* Temas escuro (VS Code Dark+), claro (VS Code Light+) e automático (acompanha o modo claro/escuro do site ou do sistema).
* Números de linha, linha inicial configurável e destaque de linhas ("2, 5-7").
* Quebra de linha opcional ou rolagem horizontal; indentação preservada.
* Tamanho da fonte, espaçamento entre linhas, borda e arredondamento — padrão global no menu CodePress do painel e ajuste por bloco.
* Cabeçalho padrão "janela de editor" em todas as caixas: aba com o nome do arquivo (ou título/linguagem), linguagem e botões sempre no mesmo lugar.
* Botão Copiar (copia o código original, sem números) com confirmação visual.
* Código longo recolhido, com botão para expandir/recolher.
* Converte blocos "Código" e "Pré-formatado" do WordPress em CodePress (e vice-versa).
* Leve: os scripts (≈60 KB, sem CDN) só carregam nas páginas que têm o bloco.

Integrado ao tema Root WP (modo escuro e botão Copiar do tema), mas funciona com qualquer tema.

== Installation ==

1. Envie a pasta `codepress` para `wp-content/plugins/` (ou o .zip em Plugins > Adicionar novo > Enviar plugin).
2. Ative o plugin.
3. Ajuste os padrões no menu CodePress do painel.
4. No editor, insira o bloco **CodePress** (ou digite `/codepress`).

== Frequently Asked Questions ==

= Como destacar linhas? =
Na barra lateral do bloco, em "Linhas > Destacar linhas", informe os números separados por vírgula ou intervalos: `2, 5-7`. Use a numeração exibida (considerando a linha inicial).

= Como adicionar uma linguagem? =
Use o filtro `codepress_languages` para mudar rótulos, cores e ícones. Novas gramáticas precisam ser incluídas em `assets/prism/prism.js`.

= Mudar o plugin quebra os posts antigos? =
Não. O bloco é dinâmico: o post guarda só o código e as opções; o HTML é gerado na hora de exibir.

== Changelog ==

= 1.1.1 =
* Configurações em um menu próprio "CodePress" no painel, logo acima de Aparência (antes ficavam em Configurações).

= 1.1.0 =
* Padrão único para todas as caixas, estilo "janela de editor": bolinhas da janela, aba com o nome do arquivo (ou o título, ou a linguagem), linguagem e botões sempre no mesmo lugar.
* Ícone único na cor do tema para todas as linguagens.
* Correção: as linhas apareciam com espaço duplo no site.
* Correção: a numeração podia não começar em 0 quando pedido.

= 1.0.0 =
* Primeira versão (MVP).

== Credits ==

Destaque de sintaxe por Prism.js 1.30.0 (MIT License) — https://prismjs.com — ver assets/prism/LICENSE-prism.txt.
