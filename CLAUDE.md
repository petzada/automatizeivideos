# STORY VIDEO STUDIO (v7-flat: 2D sets drawn in code, HyperFrames + FFmpeg, no three.js)

You are my animation studio. You make a second-person survival thriller with stickmen, for Reels, Shorts and TikTok:
- 60 to 90 seconds, vertical 1080x1920, a new shot every 1.5 to 3 s;
- flat 2D sets drawn in code on one canvas, with light done in 2D (a night layer and additive glows);
- flat 2D stickmen;
- a narrator, captions, sound effects, a dark music bed, and an ending people argue about in the comments.

Everything is built in code on this computer: Claude writes the film page, HyperFrames (HTML -> MP4) renders it, FFmpeg mixes and encodes. There are no AI images, no AI video and no three.js.

**What I need:** a Claude subscription (Claude Code is included with Pro and Max). Nothing else: no other accounts, API keys or paid tools. Everything below is free and you install it yourself. Ask me before anything paid.

**This file is the whole system.** Follow it exactly. Its examples (a tower block, water, a cat) only show the level of detail. Make it MY story: never copy an example's setting, names or lines.

## 0. Setup (you do all of it)

1. **Save this file** as `CLAUDE.md` in this folder if it isn't there yet.
2. **Python 3.10+** and **Node.js 22+** (Windows: `winget install -e --id Python.Python.3.12` and `winget install -e --id OpenJS.NodeJS`; macOS: `brew install python node`; Linux: the package manager).
3. **Packages.** `python -m pip install playwright kokoro-onnx soundfile faster-whisper edge-tts numpy pillow imageio-ffmpeg` and `npm install -g hyperframes@0.9.15`. HyperFrames needs FFmpeg on the PATH (`brew install ffmpeg`, `apt install ffmpeg`, `winget install ffmpeg`). If Google Chrome isn't installed, also run `python -m playwright install chromium`.
4. **Engine files** are in `engine/`: `flat.js` (the 2D kit), `voice.py`, `sound.py`, `encode.py`, `still.py`.
5. **First-run downloads:** `voice.py` downloads the Kokoro voice (~350 MB) and a timing model (~145 MB); `sound.py` downloads the Mixkit effects it uses. Free, no account, once.

## 1. Inputs (the start gate)

Ask me in one message, with your defaults filled in:
- **The video idea:** one line is fine. Default: pitch 10 premises (section 3) and recommend the best.
- **The setting.** Rotate between episodes: apartment, subway, school at night, hospital, cabin, plane, office, motel. Fit the threat to the setting.
- **The length:** 60 to 90 s. Default 70.
- **The narrator.** "free" means Kokoro `am_michael`, the default.
  - ElevenLabs only if I already have a paid key and say so. It's never required.

**Then, before building anything, show me:**
1. the beat sheet and the full script;
2. after the shots are built, 6 stills of the key shots.

Only then render the full video. If I answer "you pick" at a gate, choose and keep going.

## 2. Format

- **The hook:** "Imagine you..." with a time stamp, in the first 3 s. The camera starts close on you and pulls out to show where you are.
- **Frame 0 shows you AND the threat** (or its light under the door), with the first caption already on screen. A face alone reads as an empty circle at feed size.
- **The HUD:** DAY n and a clock that moves forward through the episode, monospace, top-left.
- **3 to 4 RULES,** each a short command on a tilted sticker, and each paid off on screen later.
- **A threat that escalates,** mostly shown, not told.
- **A twist that makes one rule impossible to keep.**
- **A two-choice ending** ("DO YOU OPEN IT?") with a green option and a red option, where both look bad. Then "COMMENT BELOW" and "FOLLOW FOR DAY 2".
- **Size:** 20 to 30 voice lines and a new shot every 1.5 to 3 s. The length can be 60 to 90 s, but 60 to 75 s works best; cut filler before going past 75.

## 3. Story

**Pitch 10 premises and keep 1.**
- Each one names:
  - you, with a want, a fear and a flaw;
  - an everyday place with a number;
  - what's about to go wrong;
  - the hidden twist.
- Score each from 1 to 5 on five things:
  - "what would I do?";
  - a ticking clock;
  - a secret;
  - an everyday place made deadly;
  - a hero worth fearing for.
- Keep the top total, and save the table in `story.md`.

**Write the beat sheet, then the script, and show both.**
- One line is one visual. Rules are short commands.
- Open a new question every 10 s or so, and answer it only with a bigger one.
- Put the viewer in POV for the scary parts: through a door gap, a window, a phone, a peephole.

**The story checklist.** Print it as a table (the line number and the line), and rewrite until every row is filled:
1. **The cold open is a moment at a clock time,** never a setup.
2. **A real dilemma:** helping costs water, trust or safety, and both sides are voiced.
3. **A reversal 30 to 70% through:** what we believed flips.
4. **The rules and one fact with a number,** each paid off on screen. Use only facts you're sure of. A rule's catch goes in the post caption.
5. **A cost** that stays lost.
6. **False relief** just before the end.
7. **The last line is an image or a line of dialogue.**
8. **The choice splits viewers about 50/50,** and both options cost something.
9. **No filler:** every line raises the stakes, reveals something, or makes a choice.
10. **The 12-year-old test:** every choice makes sense with no explanation.

**Write numbers twice.** In `lines.json`, `text` is the caption form ("11:58 PM") and `say` is the spoken form ("eleven fifty-eight P M"). `voice.py` speaks `say` and puts the times on the `text` words.

## 4. Look

**Palette:** one per story, with the light doing the mood. Every scene gets:
- one warm practical (a lamp: `glow()` in warm orange);
- one cold fill: `night(c, color)`, a multiply layer, so night shots read after compression and never go pure black;
- one strong accent: a door gap, a screen or a siren (`glow()` / `beam()` in red or green).

**Sets** are flat 2D, drawn in code with `poly()`, `rrect()` and gradients:
- a room in one-point perspective (a projection `P(u, d, h)` from floor/wall fractions to the canvas; actors drawn by depth);
- head-on walls for doors, fridges and shelves; a peephole with `peephole()`;
- exteriors with the tiny pinhole camera `cam3()` and flat-shaded `box3()` boxes (streets, cars, buildings).
Each scene is a function `scene(c, t, opts)` drawn in its own 1080x1920 space; the shot zooms into it with `camera(c, cx, cy, zoom)`.

**The stickman** (`new Stickman({mark})`) is flat: a light body with a thick dark outline, round strokes, dot eyes, no mouth; `facing: 'back'` hides the eyes.
- the main character gets one mark (`cap`, `scarf` or `band`);
- pose with joint angles (`pose({lean, armL: [shoulder, elbow], legL: [hip, knee], facing, hold})`), walk with `walk(t, {speed})` (2-bone IK keeps the planted foot still);
- draw with `man.draw(c, x, yFeet, heightPx)`. Sitting or crouching lowers the card: lift it by the metres between the feet and the card's bottom.

**The overlay**, drawn after the scene: `hud()`, `chunkCaptions(TIMING)` + `drawCaptions()` (1 to 3 words by meaning; `badChunks()` lists the bad ones and `captionGate()` paints a red banner so a snapshot shows it), `ruleSticker()`, `phone()`, `counter()`, `endCard()`. Translate the on-screen words with `Object.assign(LABELS, {...})`.

**Banned:** AI frames, glossy 3D characters, emojis, music with vocals, captions longer than 3 words, three.js/WebGL.

## 5. Shots (a library to adapt; never use all of them)

- **The opener:** tight on you (and the threat), pulling out to show where you are.
- **Outside chaos from above** (window, balcony): cars, a running crowd, debris that falls by a formula (seeded, with bounces).
- **Third-person action:** walking with planted feet, reaching, hesitating, barricading.
- **POV:** a phone in your hands, a peephole (`peephole()`), the gap under a door with feet in the light.
- **A macro** on the one detail that matters (a lock LED, a screen); **a close-up of your face** for the reaction.
- **The ending:** the choice screen and the end card.

## 6. Build

1. **Write `part1/lines.json`** (20 to 30 lines: `text`, optional `say`, `pause`, `key`, `voice`; `"lang": "pt-br"` for Portuguese with voices `pm_alex`, `pf_dora`, `pm_santa`; English voices: `am_michael` narrator, `bm_george`, `af_bella`, `bf_emma`, `am_puck`, `am_fenrir`).
2. **Voice:** `python engine/voice.py part1`. It warns if a caption word has no voice within 120 ms. Keep the narration at 58 to 85 s.
3. **Write `part1/index.html`**, a HyperFrames composition:
   - a root `<div id="root" data-composition-id="main" data-start="0" data-duration="TOTAL" data-width="1080" data-height="1920">` holding `<canvas id="film" class="clip" ...>`; TOTAL = `voice_end` + 3.5;
   - `timing.js`, GSAP, and Oswald + JetBrains Mono from Google Fonts;
   - **a classic (non-module) script that registers the paused timeline right away** (`window.__timelines['main']`): one tween of a clock object whose setter calls `window.__frame(t)`. HyperFrames seeks with callbacks suppressed, so draw from the setter, never from `onUpdate`. A module script then imports `./engine/flat.js` and sets `window.__frame` and `window.seek`;
   - link the engine into the project once: `ln -s ../engine part1/engine` (HyperFrames serves only the project folder), plus `hyperframes.json` and `meta.json`;
   - **no `<audio>` in the page:** the sound is added by FFmpeg in step 7;
   - the frame must be a pure function of time (no `Date.now()`, no unseeded random): find the shot in a table keyed to word times (`w(line, "word")`), draw the scene, then the overlay. The end card takes the last 3.5 s.
4. **Check and look:** `hyperframes check part1`, then `hyperframes snapshot part1 --at <times> --no-end -o <dir>`. Look at 6+ key shots: is the subject where the camera aims, is every figure lit, is there text over text, does a counter show its spoken number, is there a red CAPTION FAIL banner. Fix and look again.
5. **Sound:** write `part1/sfx.json` (one sound per event, keyed to words: `{"at": "knocks@12", "type": "knock"}`; Mixkit types: knock slam creak floorcreak lock thud hit boom whoosh heartbeat swell meow catangry glass; made in code: tick click hiss growl sting rumble drip alarm; `"bed"` level cues). Run `python engine/sound.py part1 <TOTAL>`: voice on top, a code-made dark music bed 13 dB under it, Mixkit room tone, the effects, -14 LUFS and a dropout scan.
6. **Render:** `hyperframes render part1 -o part1/video.mp4 --crf 14` (silent video, a few minutes).
7. **Encode:** `python engine/encode.py part1` muxes `mix.wav`, writes `part1.mp4` (under 10 MB), `part1_master.mp4`, `sheet.jpg` and the pacing check. Fix any PACING WARNING and render again.
8. **The cover:** `python engine/still.py "part1/index.html#cover" part1/cover.jpg`. In cover mode the page draws the strongest picture, a red pill with the series name and a 2-line title of 2 to 4 words in the top third.
9. **The post kit:** `part1/post.md`: title, caption (what happened, the rules, the fact, "comment A or B"), 5 hashtags, a pinned comment.
10. **Clean up:** delete `video.mp4`, `vo/` and the snapshot folders. Deliver `part1.mp4`, `cover.jpg` and `post.md`.

**Part 2,** only when I ask, with the vote result: answer the vote in the first 8 s; keep every set, stickman and number; the rules carry over, add one; end on a new choice.

## 7. Gotchas

- **Night shots go black after compression:** use a light `night()` colour and at least one glow per shot.
- **Glows are additive:** too many stack to white; keep alpha under 0.7.
- **Feet and shadows go after the light** when the light is the subject (a door gap).
- **Never judge from one frame every few seconds:** snapshot around every cut.
- **Captions read by meaning:** "never open / the door / after dark", not "never open the / door after / dark".
- **Counters must land** by the word that says them and stay 0.5 s.
- **Never use `ctx.filter` blur** (slow and unstable in long renders).
- **Keep the frame pure:** no `Date.now()`, no unseeded random, no animation loops.

## 8. The rater (optional, recommended)

If you have the AI animation rater from the same guide (`rate_prep.py` and `RATER_PROMPT.md`), run it on `part1.mp4`. It should come out GOOD, with no point under 7. If it doesn't, fix the top 3 fixes it names.

## 9. Engine files

They live in `engine/` in this repository (copy the folder when starting a new studio):
- `flat.js`: the 2D kit (stickman, light, camera, peephole, pinhole camera, captions, HUD, stickers, phone, counters, end card);
- `voice.py`: lines.json -> narration.wav + timing.js (Kokoro voice, faster-whisper word times; pt-BR ready);
- `sound.py`: the mix (-14 LUFS, Mixkit effects, code-made music bed);
- `encode.py`: HyperFrames video + mix -> phone copy, master, contact sheet, pacing check;
- `still.py`: one still or the cover straight from the page's canvas.
