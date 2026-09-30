# CodePress

Blocos de código com aparência profissional para artigos WordPress: destaque de sintaxe, temas no estilo do VS Code, números e destaque de linhas, cabeçalho com nome do arquivo e botão **Copiar**.

![Versão](https://img.shields.io/badge/vers%C3%A3o-1.1.1-blue) ![WordPress](https://img.shields.io/badge/WordPress-6.3%2B-21759b) ![PHP](https://img.shields.io/badge/PHP-7.4%2B-777bb4) ![Licença](https://img.shields.io/badge/licen%C3%A7a-GPL--2.0--or--later-green)

```
┌───────────────────────────────────────────────────────────┐
│ ● ● ●  ▐ </> user.js ▌  Buscando o usuário   javascript  ⧉ Copiar │
├───────────────────────────────────────────────────────────┤
│ 1  const user = await getUser(id);                        │
│ 2                                                         │
│ 3  console.log(user.name);                                │
└───────────────────────────────────────────────────────────┘
```

## Recursos

- **Bloco próprio no Gutenberg** (`/codepress`), com as cores aparecendo enquanto você digita, como numa IDE.
  - `Tab` indenta (várias linhas também), `Shift+Tab` desindenta e `Esc` + `Tab` sai do campo.
  - Converte blocos **Código** e **Pré-formatado** do WordPress em CodePress, e vice-versa.
- **Destaque de sintaxe** com [Prism.js](https://prismjs.com) para JavaScript, TypeScript, HTML, CSS, PHP, JSON, SQL, Bash, Python, Java, C#, C e C++.
- **Temas:** escuro (VS Code Dark+), claro (VS Code Light+) e automático, que acompanha o modo claro ou escuro do site (ou do sistema).
- **Padrão "janela de editor"** em todas as caixas: aba com o nome do arquivo (ou o título, ou a linguagem), linguagem e botões sempre no mesmo lugar.
- **Linhas:**
  - números de linha e linha inicial configurável;
  - destaque de linhas (`2, 5-7`);
  - indentação preservada;
  - rolagem horizontal ou quebra de linha.
- **Aparência:** tamanho da fonte, espaçamento entre linhas, borda e arredondamento.
- **Interação:**
  - botão **Copiar**, que copia o código original, sem os números, e confirma com "Copiado!";
  - código longo recolhido, com botão para expandir.
- **Leve:** os scripts (cerca de 60 KB, sem CDN) só carregam nas páginas que têm o bloco.

## Requisitos

- WordPress 6.3 ou superior (testado até 7.1)
- PHP 7.4 ou superior

## Instalação

1. Baixe o repositório como `.zip` e envie em **Plugins > Adicionar novo > Enviar plugin**. Outra opção é copiar a pasta para `wp-content/plugins/codepress/`.
2. Ative o **CodePress**.
3. Defina os padrões no menu **CodePress** do painel, logo acima de Aparência.
4. No editor, insira o bloco **CodePress**.

## Como usar

| Onde | O que ajustar |
|---|---|
| Menu **CodePress** | Padrões de todos os blocos: tema, fonte, espaçamento, arredondamento, números de linha, quebra de linha, borda |
| Barra lateral do bloco | Linguagem, nome do arquivo, título, cabeçalho, ícone, Copiar, linha inicial, linhas destacadas e recolher código longo. Também é possível substituir, só naquele bloco, qualquer padrão global |
| Barra de ferramentas do bloco | Troca rápida da linguagem |

Blocos que não mudam um padrão acompanham o que for definido no menu CodePress.

## Como funciona

- **Bloco dinâmico:** o post guarda só o código e as opções, e o HTML é gerado pelo `render.php` na hora de exibir. Atualizar o plugin **nunca quebra** posts já publicados.
- **Funciona sem JavaScript:** o servidor já entrega o código escapado e legível. O `view.js` só acrescenta as cores, os números e os botões.
- **Editor e site usam o mesmo núcleo** (`codepress-core.js`), então a prévia no editor é idêntica ao resultado publicado.
- **Sem etapa de build:** o bloco usa as bibliotecas globais do WordPress (`wp.blocks`, `wp.element`…), sem npm nem webpack.

## Estrutura

```
codepress.php               cabeçalho do plugin, linguagens, registro dos scripts e do bloco
includes/settings.php       menu CodePress (padrões globais)
block/block.json            definição e atributos do bloco
block/editor.js             bloco no editor (edição com destaque ao vivo, barra lateral, conversões)
block/render.php            HTML do bloco no site
block/view.js               cores, números, Copiar e recolher no site
block/style.css             aparência (site e editor), temas Dark+ / Light+
block/editor.css            campo de edição sobreposto ao código colorido
assets/codepress-core.js    núcleo compartilhado: destaque, divisão em linhas, números
assets/prism/prism.js       Prism.js 1.30.0 com as 12 linguagens (modo manual)
```

## Personalização

Rótulos, cores e ícones das linguagens podem ser alterados pelo filtro `codepress_languages`:

```php
add_filter( 'codepress_languages', function ( $languages ) {
	$languages['bash']['label'] = 'Terminal';
	return $languages;
} );
```

Para incluir uma linguagem nova, acrescente a gramática correspondente em `assets/prism/prism.js` e uma entrada no filtro acima.

A fonte das caixas pode ser trocada pela variável CSS `--codepress-font`.

## Integração com o tema Root WP

Funciona com qualquer tema. Com o [Root WP](https://github.com/adrianoleitedasilva/RootWP):

- o modo "automático" acompanha o botão de modo escuro do site;
- o botão "Copiar" do tema não é aplicado aos blocos do CodePress, que têm o seu próprio.

## Changelog

**1.1.1**
- Configurações em um menu próprio **CodePress**, logo acima de Aparência.

**1.1.0**
- Padrão único "janela de editor" para todas as caixas e ícone único na cor do tema.
- Correção do espaçamento duplo entre as linhas no site.
- A numeração pode começar em 0.

**1.0.0**
- Primeira versão.

## Créditos e licença

- Destaque de sintaxe: [Prism.js](https://prismjs.com) 1.30.0, licença MIT (`assets/prism/LICENSE-prism.txt`).
- CodePress: GPL-2.0-or-later. Autor: [Adriano Silva](https://adrianosilva.pro.br).
