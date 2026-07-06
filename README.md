# Gaffer ⚽️

**A private, offline AI "film room" for grassroots football.** Point it at a Sunday-league,
youth, or rec match; talk to it from the touchline like you already do; and at half-time it
hands you three concrete tactical adjustments — read aloud, in your language. Everything runs
**on the hardware you already own** (a mid-range phone + an old laptop), with **no cloud, no
API key, no subscription.** The kids' data never leaves the touchline.

> Tether Developers Cup — **QVAC (Local AI)** track. Built on **QVAC** (on-device AI) +
> **Pears** (P2P delegation & sync). MIT licensed.

## Why this exists

Match analysis today means Veo / Hudl / Trace: thousands of dollars in hardware plus a cloud
subscription, and your footage lives on their servers. That's built for academies and pro
clubs. The tens of millions of **volunteer** coaches in amateur football get nothing — they
can't afford it, and the footage contains **minors** that legally/ethically can't be uploaded
to a cloud AI. Gaffer is the free, private, offline option that didn't exist before.

**The stack is load-bearing, not decorative** (see [`docs/DESIGN.md`](docs/DESIGN.md)):

- **QVAC / local AI is required** — minors' data can't touch a cloud; pitches often have no
  signal; a volunteer can't manage API keys or billing. Uses STT, a local LLM, TTS, and
  translation, all on-device.
- **Pears / P2P is required** — the phone physically can't run the synthesis model, so it
  **offloads to the coach's laptop** over the DHT (QVAC delegated inference), and reports sync
  **device-to-device** with no server ever holding children's footage.

## How it works

1. **Capture** — the coach narrates naturally; QVAC transcribes on-device (Whisper).
2. **Tag** — a local 1B LLM labels each remark with player / phase / theme / sentiment,
   building a live tactical timeline.
3. **Half-time synthesis** — the one heavy call runs the larger model and, if a provider peer
   is available, is **delegated to the laptop over P2P** (with local fallback). Output: three
   specific adjustments.
4. **Read-back & translate** — on-device TTS reads them aloud; on-device translation for a
   multilingual bench.

## Requirements

- **Node.js ≥ 22.17** (QVAC requirement). This repo is tested on Node 24.
- ~1–2 GB free disk for models (downloaded on first run, cached in `~/.qvac/models`).
- GPU acceleration is optional: **Metal** (macOS), **Vulkan** (Linux/Windows). Without it,
  inference falls back to CPU and is slower.
  - Linux extras: `sudo apt install -y g++ libvulkan1 mesa-vulkan-drivers`.

## Setup

```bash
npm install
```

## Run

```bash
# 0) Web UI (recommended). Live timeline + half-time card, with "Read aloud" (TTS)
#    and "Translate for the bench" (on-device NMT) buttons. Open http://localhost:4600
npm run ui

# 1) End-to-end demo in the terminal (scripted match — no microphone needed). Local:
npm run demo

# 2) See the P2P delegation. In terminal A, start the "laptop" provider:
npm run provider
#    → prints a provider public key.

#    In terminal B, run with half-time synthesis offloaded to it (works with ui too):
GAFFER_PROVIDER=<key-from-terminal-A> npm run demo
GAFFER_PROVIDER=<key-from-terminal-A> npm run ui

# 3) Terminal demo with spoken read-back (renders data/halftime.wav via on-device TTS):
GAFFER_TTS=1 npm run demo
```

First run downloads models (Qwen3-1.7B for tagging/synthesis, Supertonic for TTS,
Bergamot for translation, Whisper for STT) into `~/.qvac/models`; later runs are instant.

Run the pure-logic tests (no models required):

```bash
npm test
```

## Project layout

```
src/
  timeline.js       match state (roster, utterances, tags) — pure logic
  prompts.js        prompt construction + JSON extraction — pure logic
  tagger.js         local LLM tagging of each utterance
  synthesize.js     half-time synthesis (delegated over P2P when a provider is set)
  provider.js       the "laptop": startQVACProvider — run this to enable delegation
  qvac/
    models.js       the exact QVAC model constants used, with a startup verifier
    runtime.js      thin layer over loadModel / completion / transcribe / textToSpeech
  wav.js            PCM Int16 -> WAV for TTS output
  ui.js             tiny ANSI console helpers
  fixtures/         the scripted demo match
docs/DESIGN.md      full design + necessity rationale
```

## What works today

Five QVAC capabilities, all on-device, all load-bearing:

- **STT** (Whisper) — transcribe touchline audio (`src/stt.js`).
- **LLM tagging** (Qwen3-1.7B) — player / phase / theme / sentiment per remark, with a
  deterministic guardrail so "their 7" is never confused with our #7.
- **LLM synthesis** — three concrete half-time adjustments, **delegated phone→laptop over
  P2P** (QVAC `delegate` on the Hyperswarm DHT) with local fallback.
- **TTS** (Supertonic) — read the adjustments aloud.
- **NMT translation** (Bergamot) — the adjustments for a multilingual bench.

## Roadmap

- On-device **LoRA fine-tuning (QVAC Fabric)** so feedback adapts to *your* squad over the
  season; whiteboard/team-sheet photo via **OCR + VLM**; P2P report sharing (Hyperdrive) to
  players; Expo mobile build; and — the stretch — sampling real video frames for automatic
  event detection.

## License

MIT — see [`LICENSE`](LICENSE).
