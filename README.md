# automatizeivideos

Estúdio de vídeos animados de sobrevivência (thriller em segunda pessoa com bonequinhos, vertical 1080x1920) feito com **Claude + HyperFrames + FFmpeg**. Sem three.js: os cenários são desenhados em 2D por código num canvas, o [HyperFrames](https://github.com/heygen-com/hyperframes) renderiza o HTML em MP4 e o FFmpeg mixa e comprime.

O método é o *story-video-studio* do @theoxmotion (licença MIT, ver `LICENSE-story-video-studio`), seguindo o guia em português da @morgsmariana. Cada frame é desenhado em código: não tem imagem nem vídeo de IA.

## Como fazer um episódio

1. Abra o Claude Code nesta pasta. O `CLAUDE.md` é o sistema inteiro (as regras do formato e o motor).
2. Peça um episódio. O Claude faz o **portão de início**: a ideia, o cenário, a duração (60 a 90 s) e o narrador.
3. Ele mostra o beat sheet e o roteiro, depois 6 stills. Responda "you pick" para ele seguir sozinho.
4. Ele renderiza e confere: a legenda sincronizada com a voz (margem de 120 ms), o áudio em -14 LUFS sem buracos e o ritmo de cortes.
5. Você recebe `partN/partN.mp4` (para celular, menos de 10 MB), `partN/partN_master.mp4`, `partN/cover.jpg` e `partN/post.md`.

**Parte 2:** na mesma pasta, diga "make part 2" e conte como foi a votação.

**Antes de postar:** escute o vídeo. O Claude não ouve áudio, então a voz e a mixagem só você confere.

## Em português (pt-BR)

O motor original vem em inglês. Ele foi adaptado para pt-BR assim:

| Arquivo | O que mudou |
|---|---|
| `engine/voice.py` | `"lang": "pt-br"` no `lines.json` usa as vozes pt-BR do Kokoro (`pm_alex` narrador, `pf_dora`, `pm_santa`); a transcrição usa o whisper `base` multilíngue em português; os acentos são normalizados no alinhamento; o fallback do edge-tts usa `pt-BR-AntonioNeural` / `pt-BR-FranciscaNeural`. |
| `engine/flat.js` | palavras funcionais do português na quebra das legendas (e acentos preservados); unidades em português ficam junto do número ("30 dias"); textos da tela traduzíveis (`LABELS`: DIA, REGRA #, COMENTA AÍ, SEGUE PRO DIA); `badChunks()` acusa legenda ruim. |

Escreva números duas vezes no `lines.json`: `text` é a legenda ("23:58") e `say` é a forma falada ("vinte e três e cinquenta e oito").

## Setup (o Claude faz sozinho)

```
python -m pip install playwright kokoro-onnx soundfile faster-whisper edge-tts numpy pillow imageio-ffmpeg
npm install -g hyperframes@0.9.15        # precisa de Node 22+ e FFmpeg
```

## O fluxo de um episódio

```
python engine/voice.py part1                          # voz + tempo de cada palavra (timing.js)
hyperframes check part1                               # valida a composição (part1/index.html)
hyperframes snapshot part1 --at 0,12.5,33.5 --no-end  # olha os takes antes do render
python engine/sound.py part1 68.63                    # mix: voz, trilha feita em código, efeitos, -14 LUFS
hyperframes render part1 -o part1/video.mp4 --crf 14  # render (vídeo sem som, alguns minutos)
python engine/encode.py part1                         # junta o som, comprime (<10 MB), folha de contato, ritmo
python engine/still.py "part1/index.html#cover" part1/cover.jpg
```

Na primeira execução, `voice.py` baixa a voz Kokoro (~350 MB) e o modelo de sincronia (~145 MB), e `sound.py` baixa os efeitos da Mixkit (licença gratuita, uso comercial sem crédito). Esses arquivos ficam fora do git (`.gitignore`).

## O avaliador

`rater/` tem o avaliador de animação: `python rater/rate_prep.py partN/partN.mp4`, depois cole o `rater/RATER_PROMPT.md` no Claude Code. Veja `rater/HOWTO.md`.

## Episódios

- `part1/`: **Hackeados, Dia 1: "A porta abriu sozinha"** (apartamento 7B, 68 s, pt-BR): `part1/part1.mp4`, `part1/cover.jpg`, `part1/post.md`.
