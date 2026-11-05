# DIA 1: "A cidade foi hackeada" (Parte 1)

Ideia do usuário: hackers invadiram tudo, você tem comida estocada em casa e não pode sair pra rua, porque os hackers controlam muita coisa remotamente e lá fora está perigoso.

Cenário escolhido: **apartamento** (a comida estocada fica em casa, e a porta e as janelas viram a fronteira). Duração: 70 s. Idioma: pt-BR (voz Kokoro `pm_alex`).

## 10 premissas (nota de 1 a 5)

Critérios: **O** = "o que eu faria?", **R** = relógio correndo, **S** = segredo, **L** = lugar comum que vira mortal, **H** = herói que dá medo de perder.

| # | Você (desejo / medo / defeito) | Lugar com número | O que vai dar errado | Virada escondida | O | R | S | L | H | Total |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | quer esperar passar / medo da rua / confia rápido demais | apartamento 7B, 7º andar | a vizinha do 7A bate pedindo comida pro bebê | a geladeira smart contou pros hackers quanta comida você tem; a vizinha foi mandada por eles e a fechadura abre sozinha | 5 | 4 | 5 | 5 | 4 | **23** |
| 2 | quer chegar em casa / medo de carro / teimoso | ponto de ônibus 14 | os carros autônomos caçam pedestres | o app de transporte que te guia é dos hackers | 4 | 4 | 4 | 4 | 3 | 19 |
| 3 | quer o remédio da mãe / medo de hospital / impaciente | hospital, leito 12 | as bombas de remédio são reprogramadas | a enfermeira que te ajuda é quem desliga os monitores | 4 | 5 | 4 | 4 | 4 | 21 |
| 4 | quer dormir / medo do escuro / curioso | casa com 4 câmeras | as câmeras viram de lado sozinhas | a voz do assistente imita a sua mãe | 4 | 3 | 4 | 5 | 3 | 19 |
| 5 | quer sair do prédio / medo de altura / ansioso | elevador, 22º andar | o elevador para entre andares | quem está no interfone controla o freio | 4 | 5 | 3 | 5 | 3 | 20 |
| 6 | quer avisar a irmã / medo de ficar sozinho / impulsivo | metrô, vagão 3 | o trem sem condutor acelera | a irmã já está no vagão da frente | 4 | 5 | 4 | 4 | 4 | 21 |
| 7 | quer dinheiro vivo / medo de faltar / ganancioso | caixa eletrônico 24h | o caixa cospe dinheiro e a rua inteira corre | o caixa é isca: ele marca quem pegou | 5 | 3 | 4 | 4 | 2 | 18 |
| 8 | quer proteger o cachorro / medo de drone / distraído | quintal, casa 31 | drones de entrega viram armas | a coleira GPS é o que guia os drones | 4 | 4 | 4 | 4 | 4 | 20 |
| 9 | quer água / medo de sede / desconfiado | prédio com caixa d'água de 5000 litros | a água é cortada por um app | o síndico vendeu a senha | 4 | 4 | 3 | 4 | 3 | 18 |
| 10 | quer ficar invisível / medo de ser achado / vaidoso | apartamento 302 | o celular desligado liga sozinho | a live dele está no ar o tempo todo | 4 | 3 | 5 | 4 | 3 | 19 |

**Fica a premissa 1 (23 pontos).**

## Beat sheet

| Tempo | Batida |
|---|---|
| 0-3 s | **Gancho:** 23:58, você no sofá, e a TV vermelha atrás (você E a ameaça no frame 0). Todas as telas da cidade apagam. |
| 3-12 s | As telas voltam vermelhas: "NÃO SAIAM DE CASA". O celular confirma: os hackers controlam a cidade. |
| 12-21 s | Lá fora, carros andando sozinhos. O fato: um carro moderno tem mais de 100 milhões de linhas de código. Um carro bate num poste. |
| 21-25 s | Alívio: 30 dias de comida no armário. |
| 25-36 s | **Regras:** 1) NÃO SAIA NA RUA, 2) DESLIGUE TUDO QUE TEM WI-FI, 3) NÃO ABRA A PORTA PRA NINGUÉM. |
| 36-46 s | 01:40, batidas. A vizinha do 7A pelo olho mágico: "meu bebê não come desde ontem". **Dilema:** ajudar custa comida e a regra 3. Você fica quieto. |
| 46-54 s | **Reviravolta (~65%):** a geladeira acende sozinha (ela nunca foi desligada, e a regra 2 falhou): "OLÁ, 7B. 30 DIAS DE COMIDA. CONFIRMADO." Você arranca o fio: **metade do freezer vai estragar** (perda que fica). |
| 54-58 s | **Falso alívio:** 03:00, silêncio, você respira. |
| 58-66 s | **Virada:** a fechadura smart faz clique, e a porta abre sozinha (a regra 3 fica impossível). No corredor, a vizinha, sem bebê nenhum. |
| 66-68 s | **Última fala (diálogo):** "Desculpa. Eles disseram que me deixavam em paz." |
| 68-71.5 s | **Escolha:** VOCÊ DEIXA ELA ENTRAR? Verde: DEIXO ENTRAR / Vermelho: FECHO A PORTA. COMENTA AÍ, SEGUE PRO DIA 2. |

## Roteiro

(está em `lines.json`: `text` é a legenda e `say` é a forma falada)

| # | Voz | Fala |
|---|---|---|
| 0 | narrador | Imagina que são 23:58, e todas as telas da cidade apagam. |
| 1 | narrador | Aí elas voltam. Vermelhas. Com uma ordem só. |
| 2 | narrador | No celular, o mesmo aviso: hackers controlam a cidade. |
| 3 | narrador | Lá embaixo, os carros começam a andar sozinhos. |
| 4 | narrador | Um carro moderno tem mais de 100 milhões de linhas de código. |
| 5 | narrador | Hoje, nenhuma delas obedece o motorista. |
| 6 | narrador | Mas você estocou: 30 dias de comida no armário. |
| 7 | narrador | Regra número 1: não saia na rua. |
| 8 | narrador | Regra dois: desligue tudo que tem wi-fi. |
| 9 | narrador | Regra três: não abra a porta pra ninguém. |
| 10 | narrador | 01:40. Alguém bate. |
| 11 | vizinha | Sou eu, do 7A! Meu bebê não come desde ontem! |
| 12 | narrador | Uma lata salva o bebê. Abrir quebra a regra três. |
| 13 | vizinha | Por favor. Só uma lata. |
| 14 | narrador | Você fica em silêncio. Os passos dela somem. |
| 15 | narrador | Então a geladeira acende sozinha. |
| 16 | narrador | Ela nunca foi desligada. E contou tudo pra eles. |
| 17 | narrador | Você arranca o fio. Metade do freezer vai estragar. |
| 18 | narrador | 03:00. Silêncio. Pela primeira vez, você respira. |
| 19 | narrador | Aí a fechadura faz clique. |
| 20 | narrador | Você nunca abriu essa porta. Ela abriu sozinha. |
| 21 | narrador | No corredor, a vizinha. Sem bebê nenhum. |
| 22 | vizinha | Desculpa. Eles disseram que me deixavam em paz. |

## Checklist da história

| # | Item | Linha | Fala |
|---|---|---|---|
| 1 | A abertura é um momento num horário | 0 | "Imagina que são 23:58, e todas as telas da cidade apagam." |
| 2 | Dilema real, os dois lados com voz | 11, 12, 13 | a vizinha pede ("Só uma lata."), o narrador pesa: "Uma lata salva o bebê. Abrir quebra a regra três." |
| 3 | Reviravolta entre 30 e 70% | 15, 16 | "Então a geladeira acende sozinha." / "Ela nunca foi desligada. E contou tudo pra eles." (você achava que estava escondido) |
| 4 | Regras e um fato com número, cada um pago na tela | 4, 7, 8, 9 | Fato: "mais de 100 milhões de linhas de código" (pago: o carro bate sozinho). Regra 1: a rua mostrada do alto. Regra 2: o roteador desligado, e depois a geladeira que escapou. Regra 3: a porta, que abre sozinha. |
| 5 | Uma perda que fica | 17 | "Metade do freezer vai estragar." (de 30 dias, sobram uns 15) |
| 6 | Falso alívio antes do fim | 18 | "03:00. Silêncio. Pela primeira vez, você respira." |
| 7 | Última fala é imagem ou diálogo | 22 | "Desculpa. Eles disseram que me deixavam em paz." |
| 8 | A escolha divide 50/50 e as duas custam | fim | DEIXO ENTRAR (divide a comida e talvez ajude os hackers) / FECHO A PORTA (a fechadura é deles, e ela fica lá fora) |
| 9 | Sem enchimento | todas | cada linha aumenta o risco, revela algo ou é uma escolha |
| 10 | Teste dos 12 anos | todas | rua perigosa, comida, vizinha pedindo, geladeira dedurando, porta abrindo: tudo se entende sem explicação |
