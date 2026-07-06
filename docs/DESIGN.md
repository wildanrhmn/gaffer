# Gaffer — Design

> Private, offline AI "film room" for grassroots football.
> Built on Tether QVAC (local AI) + Pears (P2P). Tether Developers Cup — QVAC track.

## The problem

Match analysis today = Veo / Hudl / Trace: thousands of dollars in hardware + a cloud
subscription, and your footage lives on their servers. That's built for academies and pro
clubs. The ~tens of millions of volunteer coaches in Sunday-league, youth, and rec football
get nothing — they can't afford it, and the footage contains **minors** that legally/ethically
cannot be uploaded to a cloud AI.

**Gaffer** gives that coach a private, offline analyst that runs on the hardware they already
own: a mid-range phone and an old laptop. No cloud, no API key, no subscription. The kids'
data never leaves the touchline.

## Why the stack is load-bearing (not decorative)

| Capability | QVAC feature | Why it MUST be local / P2P |
|---|---|---|
| Live narration → text | Whisper / Parakeet STT | No signal at the pitch; data stays on device |
| Tag utterances → player / phase / theme | small LLM + tool calling | Real-time, offline, free |
| Team sheet / whiteboard photo | OCR + multimodal VLM | Single frames — feasible, not risky video |
| Half-time synthesis | LLM over the full timeline, **delegated phone→laptop** | Phone can't run the big model; laptop can. This IS the P2P showcase |
| Read-back + translation | TTS + on-device translation | Multinational grassroots teams; hands-free |
| Season memory + personalization | RAG (HyperDB) + **LoRA fine-tune (Fabric)** | Bespoke to your squad, zero cloud, zero cost |
| Sharing reports to players | Pears Hyperdrive / Autobase, device-to-device | Minors' data can never touch a server |

**Necessity test:** remove local AI → you're uploading children's footage to a cloud (illegal/
unconsented). Remove P2P delegation → the phone physically can't run the synthesis model.
Neither leg is decorative.

## Roles (two devices, same DHT)

- **Consumer ("phone")** — captures audio, transcribes, tags, shows the live timeline.
  Offloads heavy synthesis via QVAC `delegate:{ providerPublicKey }`.
- **Provider ("laptop")** — runs `startQVACProvider(...)`, holds the bigger model, does the
  half-time/full-time synthesis, and is the peer that stores/serves shared reports.

For v1 these can be two Node processes on the same or different machines — the delegated-
inference call is identical whether the provider is across the room or across the internet.

## End-to-end flow

1. **Setup (once):** photograph the team sheet → OCR → structured roster. Pair phone↔laptop
   by scanning the laptop's DHT public key (QR).
2. **During the match:** coach narrates naturally → live STT → each utterance timestamped and
   tagged (player / phase / theme) by the local LLM → scrolling tactical timeline. Optional
   whiteboard photo → VLM → described formation pinned to the timeline.
3. **Half-time:** synthesis fires, **delegated to the laptop** (fallback to local) → 3 concrete
   adjustments → TTS reads them aloud → optional on-device translation for the assistant coach.
4. **Full-time:** auto-generated post-match report (per-player notes, key moments, patterns).
5. **Share:** each player's notes sent P2P (Hyperdrive) directly to their device — no server.
6. **Over the season:** RAG remembers the squad; LoRA (Fabric) fine-tunes on your team so
   feedback becomes bespoke.

## Scope

- **v1 (first cut, July 8):** steps 2–4 — live transcription, LLM tagging, live timeline,
  half-time synthesis with **delegated inference phone→laptop**, TTS + translation. Complete,
  deep-QVAC + genuine-Pears product on its own.
- **Stretch (semifinal/final):** step 6 LoRA personalization, whiteboard VLM, P2P report
  sharing (step 5), and — if the risk pays off — sampling real video frames for auto event
  detection.

## Non-goals / honest risks

- **Synthesis quality** on a 1–4B model is make-or-break → this is exactly why we delegate to
  the laptop (bigger model) and feed it *structured* tagged events, not raw transcript.
- **Delegated cold start** (~15–45s first DHT connect) → pre-warm the connection at kickoff so
  half-time is instant.
- **Live video** stays a stretch goal; audio-first keeps v1 safe.
- Mobile (Expo) is a later target; v1 runs on Node desktop (two processes) to stay demoable now.
