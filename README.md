# Conductor

Conductor is a playable live instrument for shaping generative music in real time.

It is not a DAW. It is not a prompt box. It is not a code editor with AI stapled on top.

The goal is simple: put a living groove on screen, let the performer focus a voice, shape it live, and land changes on time.

## Product Direction

Conductor is built around a performance grammar:

- Select a voice
- Shape that voice
- Trigger a gesture
- Land it on the phrase
- Capture the moment

The lanes are the instrument.

Code is present, but as texture and truth, not as the primary interface.

## Mental Model

Conductor is played voice by voice.

A voice is not a fixed instrument category. It is whatever it is — "rolling acid line", "broken glass texture", "that thing from last Tuesday's set." Voices get their names from the AI or from the performer. There is no fixed taxonomy. A voice is a saved `$:` block with a name and its code.

At any moment:

- most lanes stay compact
- one lane can be focused
- the focused lane reveals deeper controls and lane-scoped actions

This keeps the screen readable while still supporting expressive play.

## Interaction Model

### Default lane

Most voices stay compact:

```text
┌ kick ─────────────────────────── mute  solo ┐
│ ████░░░░████░░░░████░░░░████░░░░            │
└──────────────────────────────────────────────┘
```

### Focused lane

The selected voice expands into the playable surface:

```text
┌ kick ════════════════════════════ mute  solo ┐
│ ████░░░░████░░░░████░░░░████░░░░  ← drag    │
│                                     density  │
│ $: s("bd*4")                                 │
│   .gain(═══●═══ 1.0)                        │
│   .lpf(══●════ 800)                          │
│                                              │
│ [mutate] [strip] [double] [halve] [twist]   │
└──────────────────────────────────────────────┘
```

### Performance grammar

- Click a lane to focus it
- Drag the pulse strip to reshape density/activity
- Use `mute` and `solo` as always-available performance controls
- Use lane actions to mutate only the focused voice
- Use the command bar for lane-specific or ensemble direction
- Use timing and phrasing to turn actions into technique

Skill comes from timing, restraint, sequencing, and recovery.

## What Makes It Interesting

Conductor should feel good in three different ways:

- Fun to touch immediately
- Deep enough to develop technique
- Legible enough for an audience to follow

A strong move in Conductor is not "click darker."

A strong move is:

- solo the bass
- drag its density down
- twist its pattern
- unmute the kick on the downbeat

That is the level the product is aiming for.

## Design Principles

- The lanes are the instrument
- One focused lane at a time
- Global controls stay minimal
- Code supports the experience, but does not dominate it
- Every visible action should read as musical intent
- The interface should be understandable in motion, not just at rest

## What Conductor Learns From Strudel

Strudel is not just the engine under Conductor. It is also a useful design reference.

The main lesson is not "show more code." The main lesson is that musical depth can come from a small, composable grammar.

### 1. Patterns are the core object

Strudel revolves around patterns and the ways patterns change over time.

Conductor should take the same idea and express it through voice lanes:

- each lane is a pattern-bearing voice
- each lane can be focused and transformed
- the player learns how to shape that lane over time

### 2. Timing is first-class

Strudel feels musical because change happens across cycles, phrases, and bars.

Conductor should preserve that by making timing part of the interface:

- now
- next beat
- next bar
- next 4 bars

Skill comes from landing changes musically, not just triggering them.

### 3. Musical verbs matter more than generic prompts

Strudel is powerful because its operations are concrete musical verbs:

- `fast`
- `slow`
- `rev`
- `chop`
- `slice`
- `scrub`
- `echo`
- `layer`

Conductor should follow the same rule.

Its lane actions should feel like playable transformations, not prompt shortcuts:

- `mutate`
- `strip`
- `double`
- `halve`
- `twist`
- `tighten`
- `open`
- `scatter`

### 4. Visual feedback should reveal pattern behavior

Strudel's visual feedback works when it reflects actual musical structure.

Conductor should use lanes to make musical behavior visible:

- density
- repetition
- phrase position
- activity
- mutation

The visuals should not just decorate the sound. They should help the performer and audience read what is happening.

### 5. Depth comes from composition, not UI volume

Strudel gets deep through a small number of ideas that combine well.

Conductor should do the same:

- a few strong lane actions
- a few meaningful continuous controls
- phrase-aware timing
- capture and recall of strong moments

The goal is not a crowded interface. The goal is a playable system with a real skill ceiling.

## Voices as Portable Objects

A voice is the atomic unit of Conductor. It is a single `$:` block — a named pattern with its code, parameters, and character.

Voices have a lifecycle:

### Before the set

The performer prepares. They browse their voice library, pull in voices they have been working on, arrange a starting configuration. Like a DJ filling a crate.

- **Voice library** — a personal collection of saved voices, organized however the performer likes
- **Sets** — saved starting configurations (a genre, a BPM, a group of voices ready to go)
- **Voice packs** — shareable collections ("Xuelong's acid pack", "ambient textures vol. 2")
- **Forking** — take someone else's voice, mutate it, save your version

### During the set

The performer plays live. They pull voices from their library, generate new ones on the fly, mute and solo and mutate and twist.

The prepared voices are the safety net. The live-generated ones are the risk.

### After the set

The performer saves what worked. A voice that emerged during a live mutate becomes part of the library. A strong configuration becomes a reusable set. Good moments get captured and shared.

### What this means for the product

- A voice is not defined by its instrument type. It is defined by what it sounds like and what it does.
- The "+ voice" action should be a text prompt, not a category picker. Or it pulls from the library.
- Voices can be dragged between sets, shared as links, imported from other artists.
- The library grows over time. The performer's collection becomes part of their identity.

## Current Direction

The current product direction is centered on:

1. Compact voice lanes for the active ensemble
2. A focused lane state with deeper controls
3. Lane-scoped AI actions such as `mutate`, `strip`, `double`, `halve`, and `twist`
4. Pulse-strip interaction for density/activity changes
5. Phrase-aware timing so changes can land musically
6. Keyboard-driven performance grammar
7. A command bar for focused-voice or full-ensemble direction
8. A voice library for saving, organizing, and sharing voices across sets
9. Sets as saved starting configurations that can be prepared before a performance

## Example Tutorial Topics

This product direction is meant to support a real tutorial ecosystem:

- Meet the voices
- How to focus a lane
- Density moves
- Mute and solo timing
- Mutate vs twist
- Building drops with lane focus
- Playing transitions on phrase boundaries
- Capturing and returning to strong moments
- Building your voice library
- Preparing a set
- Sharing voices with other artists
- Forking and remixing voices

## Stack

- React 19
- TypeScript
- Vite
- Express
- Gemini for generation
- Strudel as the music engine

## Local Development

### Prerequisites

- Node.js
- A `GEMINI_API_KEY`

### Install

```bash
npm install
```

### Configure

Create `.env.local` or otherwise provide:

```bash
GEMINI_API_KEY=your_key_here
```

### Run the frontend

```bash
npm run dev
```

### Run the API server

```bash
npm run server
```

### Typecheck

```bash
npm run lint
```

## Status

Conductor is still in active exploration.

The current codebase contains working pieces of:

- live Strudel playback
- generated multi-voice code
- lane rendering
- mute/solo interaction
- inline parameter control
- parser and local voice operations

The next major step is to tighten the interface around lane focus, lane-scoped performance actions, and phrase-based interaction.

## Domain

The project lives at `conductor.love`.
