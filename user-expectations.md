# User Expectations

This is the primary product document for Conductor.

It is not just a session summary. It is the clearest statement of:

- what Conductor is trying to become
- what the major surfaces are for
- what users should expect from those surfaces
- what kinds of interactions should feel natural
- what kinds of product directions should be rejected

Conductor should become something rarer than an AI music app.

It should become a new instrument category.

Not "music generation software."
Not "live coding with a nicer UI."
Not "Ableton for AI."

Conductor should feel like a living ensemble you can play with your hands, your timing, and your taste.

## Product Ambition

Conductor should matter because it offers a distinct way of relating to music creation:

- not as assembly
- not as editing
- not as prompting
- but as conduct

The performer should feel less like an operator and more like someone shaping weather, attention, energy, and behavior inside a living musical field.

### User expectations

- User expects Conductor to feel different from a DAW.
- User expects Conductor to feel different from a prompt box.
- User expects Conductor to feel different from a raw live-coding editor.
- User expects the product to support practice, style, risk, and performance.
- User expects the system to sustain repeated use instead of being exhausted after five minutes.

---

## Core Experience

When you open Conductor, music should already feel alive.

Not a blank canvas.
Not a prompt input.
Not a code editor waiting to be fed.

There should already be a pulse, a situation, and a sense of tension.
The user should feel invited to intervene in an existing musical current.

### User expectations

- User expects Conductor to begin with a musical situation, not a productivity ritual.
- User expects the app to invite intervention into a live current.
- User expects performance to begin from motion, not from setup.
- User expects the app to feel like entering a set, not creating a project file.

---

## The Instrument

The lanes are the instrument.

Not the prompt box.
Not the code editor.
Not a bank of abstract adjective buttons.

Each lane should be a playable musical voice.

### User expectations

- User expects the lane to be where they touch the music.
- User expects lane interaction to matter more than general app chrome.
- User expects good performers to get more out of the same lane than beginners can.
- User expects lane design to carry pulse, pressure, identity, responsiveness, and consequence.
- User expects the product to be judged primarily by how playable the lanes feel.

---

## Core Model

```text
Score    = structure and function
Stage    = live musical control
Workshop = authoring and reshaping pieces
Crate    = saved reusable pieces
Hydra    = future feeling / atmosphere layer
```

### User expectations

- User expects each surface to have a clear job.
- User expects stage and workshop to cooperate, not overlap chaotically.
- User expects crate to be a library, not a second stage.
- User expects score to be structural and useful, not an overloaded visual art layer.
- User expects Conductor to make it easier to build sets from smaller Strudel pieces than from one giant file.

---

## Performance Grammar

Conductor is built around a performance grammar:

- select a voice
- shape that voice
- trigger a gesture
- land it on the phrase
- capture the moment

### User expectations

- User expects skill in Conductor to come from timing, restraint, sequencing, and recovery.
- User expects phrase landing to matter.
- User expects focusing one voice at a time to be musically meaningful.
- User expects lane actions to feel like musical verbs rather than generic prompt shortcuts.
- User expects strong moves to be describable as recognizable performance actions.

---

## Lane Personality And Behavioral Depth

Voices should not feel like dead rows with parameters.

They should feel semi-alive.

Not fully autonomous.
Not random for its own sake.
But behavior-rich.

Each voice should have:

- identity
- inertia
- memory
- a tendency to behave a certain way

### User expectations

- User expects different lanes to feel different, not interchangeable.
- User expects some voices to cooperate easily and others to resist.
- User expects behavior-rich voices to give them something to learn.
- User expects the system to have inertia, not instant obedience.
- User expects Conductor to feel less like issuing commands and more like shaping a responsive musical ecology.

---

## Gesture And Tactility

Conductor should reward tactile moves, not just button clicks.

Examples of the kind of behavior the product should support over time:

- drag across a pulse strip to reshape density
- press and hold to pin a voice
- flick upward to wake a lane
- pull downward to strip it
- sweep across several lanes to apply ensemble pressure

### User expectations

- User expects gesture and timing to become part of technique.
- User expects not all interactions to feel equivalent.
- User expects a quick action and a held action to have different consequences.
- User expects phrase-boundary moves to feel different from off-beat moves.
- User expects touch to matter, not just decision.

---

## Main Stage

```text
┌ CONDUCTOR ──────────────────────────────────────────────────────────────┐
│ SCORE                                                                  │
│ 1 pressure floor    ▇   ▇   ▇   ▇                                      │
│ 2 deep current      ▃   ▄   ▃   ▅                                      │
├────────────────────────────────────────────────────────────────────────┤
│ 1 pressure floor                                             [m] [s]   │
│   $: s("bd*4")                                                        │
│   .lpf(slider(160,60,300))                                            │
│   .room(slider(0.12,0,0.5))                                           │
│                                                                         │
│ 2 deep current                                               [m] [s]   │
│   $: note("<c2 [c2 g1] eb2 [bb1 c2]>")                                │
│   .s("sine")                                                           │
│   .lpf(sine.range(120,400).slow(8))                                   │
├────────────────────────────────────────────────────────────────────────┤
│ CRATE                                                                  │
└────────────────────────────────────────────────────────────────────────┘
```

### User expectations

- User expects the stage to be the clearest representation of what is currently live.
- User expects each lane to show real code, not a fake summary.
- User expects mute and solo to always belong to the stage.
- User expects stage sliders and parameter edits to affect live sound directly.
- User expects the score to summarize the ensemble above the lanes.
- User expects the stage to feel like a performance surface, not a file manager.

---

## Stagecraft And Watchability

Conductor should be watchable.

Not just usable.
Watchable.

Even without sound, the screen should carry tension.

### User expectations

- User expects the interface to read as musical state, not software state.
- User expects changes to gather before they land.
- User expects phrase boundaries to feel important.
- User expects the focused lane to feel charged.
- User expects the ensemble to breathe as energy rises and falls.
- User expects the screen to help an audience understand that something skillful is happening.

---

## Workshop Closed

```text
┌ CONDUCTOR ───────────────────────────────────────────────────────────┬──┐
│ SCORE                                                               │‹ │
│ live stage remains visible                                          │  │
├──────────────────────────────────────────────────────────────────────┤  │
│                                                                      │  │
│                    workshop is collapsed to a right rail             │  │
│                                                                      │  │
├──────────────────────────────────────────────────────────────────────┤  │
│ CRATE                                                                │  │
└──────────────────────────────────────────────────────────────────────┴──┘
```

### User expectations

- User expects workshop to be optional and collapsible.
- User expects the closed state to leave a visible affordance on the right.
- User expects the stage to remain visible and usable while workshop is closed.
- User expects `W` and clicking the rail to do the same thing.
- User expects the right rail to feel like "open the bench," not "open settings."

---

## One Focused Area At A Time

The product should preserve a simple attention model:

- the stage is the main performance surface
- the workshop is the focused authoring surface
- one lane or one draft should feel primary at a time

### User expectations

- User expects the screen to remain readable while the set gets denser.
- User expects not every lane to be equally expanded all the time.
- User expects focused work to have a clear place.
- User expects the app to preserve attention instead of fragmenting it.

---

## Workshop Purpose

Workshop exists for:

- writing new pieces
- loading crate pieces for revision
- opening a staged piece when the user wants more space than the stage gives them
- saving reusable material
- staging edited material into the set

### User expectations

- User expects workshop to be where they go for deliberate authorship.
- User expects workshop to provide more space and focus than the stage.
- User expects workshop to matter during performance without replacing the stage.
- User expects workshop to support reshaping, branching, and saving ideas cleanly.

---

## Workshop Authoring Mode

```text
┌ WORKSHOP ────────────────────────────────────────────────────────────────┐
│ WORKSHOP                                                        [ × ]    │
├───────────────────────────────────────────────────────────────────────────┤
│ kick 3 │ KICK WORKBENCH                                                  │
│ hats 3 │                                                                  │
│ ...    │ name: [ mondo-kick                                           ]   │
│        │                                                                  │
│        │ $: s("bd bd bd bd")                                             │
│        │ .bank("RolandTR909")                                            │
│        │ .clip(0.5)                                                      │
│        │ .gain(0.95)                                                     │
│        │                                                                  │
│        │ [ update ] [ preview ] [ save ]                       [ stage ] │
│        │                                                                  │
│        │ pulse preview                                                    │
│        │ ████░░░░████░░░░                                                 │
│        │                                                                  │
│        │ kick crate · 3 voices                                            │
└───────────────────────────────────────────────────────────────────────────┘
```

### User expectations

- User expects workshop to be primarily a place to write new Strudel pieces.
- User expects the editor to dominate the panel.
- User expects the workshop header to stay simple: title and close.
- User expects `update` to re-evaluate the current draft against the current stage.
- User expects `preview` to audition the current draft with the live stage still playing.
- User expects `save` to write the draft to crate.
- User expects `stage` to add the draft into the live set.
- User expects the bottom action row to stay minimal and legible.
- User expects `stage` to sit further to the right than the edit/save controls.
- User expects workshop to feel like a workbench, not a settings panel.

---

## Workshop Editing A Saved Crate Piece

```text
┌ WORKSHOP ────────────────────────────────────────────────────────────────┐
│ WORKSHOP                                                        [ × ]    │
├───────────────────────────────────────────────────────────────────────────┤
│ pad 4 │ EDITING SAVED PAD  saved                                          │
│ ...   │                                                                    │
│       │ name: [ choir vowel                                            ]   │
│       │                                                                    │
│       │ $: note("<[c4,eb4,g4] [ab3,c4,eb4]>")                             │
│       │ .s("sawtooth")                                                    │
│       │ .room(slider([drag], 0, 1))                                       │
│       │ .gain(slider([drag], 0, 0.8))                                     │
│       │                                                                    │
│       │ [ update ] [ preview ] [ save ]                        [ stage ]  │
│       │                                                                    │
│       │ pad crate · 4 voices                                               │
│       │ > choir vowel                                     [preview] [stage]│
└───────────────────────────────────────────────────────────────────────────┘
```

### User expectations

- User expects clicking a crate row to load that piece into the workbench.
- User expects the loaded piece to be visibly marked in the list.
- User expects editing a saved piece to feel distinct from creating a new one.
- User expects `save` to update that saved crate piece.
- User expects `stage` to add the current edited version to the live set.
- User expects crate material to be editable and reusable.

---

## Workshop Opened From A Selected Stage Lane

```text
┌ WORKSHOP ────────────────────────────────────────────────────────────────┐
│ WORKSHOP                                                        [ × ]    │
├───────────────────────────────────────────────────────────────────────────┤
│ bass 4 │ EDITING STAGED BASS  live target: deep current                  │
│ ...    │                                                                  │
│        │ name: [ deep current                                         ]   │
│        │                                                                  │
│        │ $: note("<c2 [c2 g1] eb2 [bb1 c2]>")                           │
│        │ .s("sine")                                                      │
│        │ .lpf(sine.range(120,400).slow(8))                              │
│        │ .gain(slider([drag], 0, 1.5))                                  │
│        │                                                                  │
│        │ [ update live ] [ save to crate ]                [ stage as new ]│
│        │                                                                  │
│        │ pulse preview                                                    │
│        │ ████░░░░████░░░░                                                 │
└───────────────────────────────────────────────────────────────────────────┘
```

### User expectations

- User expects pressing `W` on a selected stage lane to open that lane in workshop.
- User expects the workshop to clearly say this is a staged/live target edit.
- User expects `update live` to apply the current editor contents back to that live lane.
- User expects `save to crate` to preserve the current version into the crate.
- User expects `stage as new` to add a second variation/layer if desired.
- User expects these actions to be clearly distinct.
- User expects not to wonder whether they are editing a disconnected copy.
- User expects workshop and stage to cooperate naturally during performance.

---

## Action Semantics By Mode

### Authoring / crate mode

```text
[ update ] [ preview ] [ save ]                       [ stage ]
```

### Staged/live mode

```text
[ update live ] [ save to crate ]                [ stage as new ]
```

### User expectations

- User expects staged-source mode and crate/new-draft mode to behave differently.
- User expects the button labels to explain those differences explicitly.
- User expects `update live` to be the main commit action for staged-source editing.
- User expects `save to crate` not to be required for a live stage change to count.
- User expects `stage as new` to duplicate the current version as another layer.
- User expects `stage` or `stage as new` to sit visually apart from edit/save actions.

---

## Preview And Update Are Different

```text
update       = re-evaluate current editor state
preview      = audition it with the stage
update live  = commit staged-source editor state back to the live lane
```

### User expectations

- User expects `update` to be more like refresh/re-run than transport.
- User expects `preview` to be an audition decision, not the same as `update`.
- User expects `update live` to be stronger than `update`.
- User expects button labels to preserve these distinctions clearly.
- User expects moving sliders or changing code to become audible after `update` or `preview`, depending on mode.

---

## Save And Stage Are Different

```text
save          = preserve to crate
stage         = add to set
stage as new  = add variation as another live layer
```

### User expectations

- User expects saving not to imply staging.
- User expects staging not to imply saving.
- User expects stage actions to affect the set.
- User expects save actions to affect the library.
- User expects this distinction to remain true in both authoring mode and staged/live mode.

---

## Workshop Code Surface With Inline Sliders

```text
$: s("bd*4")
.lpf(slider([drag], 60, 300))
.room(slider([drag], 0, 0.5))
.gain(slider([drag], 0, 1.5))
```

### User expectations

- User expects slider expressions to be draggable in place.
- User expects the code to remain readable as code.
- User expects moving a slider to update the draft text correctly.
- User expects slider UI to feel attached to the code, not like a detached control strip.
- User expects they can still click into the code area and edit as text.

---

## Workshop Crate Rows

```text
kick crate · 3 voices

> pressure floor                                 [preview] [stage]
  skip pulse                                     [preview] [stage]
  jazz room                                      [preview] [stage]
```

### User expectations

- User expects row click to load the piece into the editor.
- User expects `load` not to need a dedicated button.
- User expects `preview` to audition the crate item quickly.
- User expects `stage` to stage that saved version directly.
- User expects the lower list to support the editor, not compete with it.
- User expects the loaded row to be easy to spot.

---

## Preview Behavior

### Authoring mode

```text
[ update ] [ preview ] [ save ] [ stage ]
```

### Preview active

```text
[ update ] [ stop preview ] [ save ] [ stage ]
```

### User expectations

- User expects preview to happen with the current stage still playing.
- User expects preview to add the draft in context, not replace the whole stage.
- User expects `stop preview` to remove only the previewed draft.
- User expects `update` to re-audition current changes without awkward manual restart steps.
- User expects no ghost preview layer to keep playing after stop.
- User expects preview state to be clearly visible in the workbench header or button text.

---

## Dirty / Discard Behavior

```text
┌ Discard Changes? ──────────────────────────────────────────┐
│ Load "skip pulse" and discard current workshop edits?      │
│                                                            │
│ [ cancel ]                                  [ discard ]    │
└────────────────────────────────────────────────────────────┘
```

### User expectations

- User expects unsaved workshop edits to be protected.
- User expects in-app confirms, not browser dialogs.
- User expects the same discard pattern for:
  - switching role
  - loading another crate row
  - starting a new draft
  - closing workshop
- In staged mode, user expects closing after `update live` to be clean if there were no additional edits afterward.
- User expects warnings to apply only to unapplied editor changes, not to whether something was saved to crate.

---

## Design Principles

These principles still apply:

- the lanes are the instrument
- one focused area at a time
- global controls stay minimal
- code supports the experience, but does not dominate it
- every visible action should read as musical intent
- the interface should be understandable in motion, not just at rest

### User expectations

- User expects visual and interaction choices to reinforce the feeling of an instrument.
- User expects complexity to come from composition and timing, not UI clutter.
- User expects code to remain present as truth, but not dominate the whole experience.
- User expects visible actions to feel musical rather than administrative.

---

## What Conductor Learns From Strudel

Strudel is not only the engine under Conductor.
It is also a design reference.

The main lessons that still apply are:

### Patterns are the core object

- each lane carries a pattern-bearing voice
- each lane can be focused and transformed
- users should learn how to shape patterns over time

### Timing is first-class

- now
- next beat
- next bar
- next phrase

### Musical verbs matter more than generic prompts

Examples:

- mutate
- strip
- double
- halve
- twist
- tighten
- open
- scatter

### Visual feedback should reveal behavior

- density
- repetition
- phrase position
- activity
- mutation

### User expectations

- User expects Conductor to inherit composable musical logic from Strudel.
- User expects timing to be musically important, not incidental.
- User expects operations to feel like musical verbs.
- User expects visual feedback to reveal musical structure, not just decorate it.

---

## Empty First-Time State

```text
┌ CONDUCTOR ───────────────────────────────────────────────────────────────┐
│ SCORE                                                                    │
│ — no active voices —                                                     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                   open workshop → write one small piece                  │
│                   save it to crate → stage it → layer another            │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ CRATE                                                                    │
│ enter to browse                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### User expectations

- User expects the empty state to tell them what to do first.
- User expects the app to imply a composition loop:
  - write one piece
  - save it
  - stage it
  - add another
- User expects the crate to fill up over time.
- User expects Conductor to make layered composition feel easier than maintaining one giant script.

---

## Before, During, And After The Set

### Before the set

- browse the crate
- prepare starting material
- choose a tempo and starting ensemble

### During the set

- stage voices
- reshape them
- mute and solo
- open workshop when more space is needed
- save strong discoveries

### After the set

- keep what worked
- discard what did not
- preserve strong voices in the crate
- build reusable configurations out of good moments

### User expectations

- User expects Conductor to support preparation before performance.
- User expects Conductor to support improvisation during performance.
- User expects Conductor to support curation after performance.
- User expects strong moments to be saveable and reusable.

---

## Crate As Library View

```text
┌ CRATE ───────────────────────────────────────────────────────────────────┐
│ KICK · 4                                                                │
│ pressure floor                                                          │
│ skip pulse                                                              │
│ jazz room                                                               │
│ mondo-kick                                                              │
│                                                                         │
│ HATS · 5                                                                │
│ sixteen rain                                                            │
│ clock drift                                                             │
│ brush sweep                                                             │
└──────────────────────────────────────────────────────────────────────────┘
```

### User expectations

- User expects crate to be a saved-library surface, not a live-performance surface.
- User expects crate items to be grouped by role.
- User expects staged pieces to remain traceable in the crate.
- User expects crate to support browsing and comparison quickly.
- User expects crate to stay readable even as it grows.

---

## Voices As Portable Objects

A voice is the atomic unit of Conductor.

It is a single named musical idea with:

- code
- parameters
- role in the set
- a saved identity in the crate

Voices should move naturally between:

- workshop
- crate
- stage

### User expectations

- User expects a voice to be the core object of the product.
- User expects voices to be saveable, reloadable, and stageable.
- User expects voices to accumulate into a personal collection over time.
- User expects the library to become part of their musical identity.
- User expects a strong voice discovered during performance to be worth preserving.

---

## Sets And Moments

While not all of this may be implemented yet, the session direction implies:

- a set is a prepared starting configuration
- a moment is a state worth remembering

### User expectations

- User expects strong live states to be worth capturing.
- User expects prepared starting points to reduce setup friction.
- User expects the product to support both planned and emergent structure.

---

## Stage Editing Without Workshop

```text
1 pressure floor
$: s("bd*4")
.lpf(slider(160, 60, 300))
.room(slider(0.12, 0, 0.5))
.gain(slider(1.1, 0, 1.5))
```

### User expectations

- User expects tiny live edits to happen directly on stage.
- User expects workshop not to be required for every change.
- User expects stage sliders and code highlights to support performance-time shaping.
- User expects stage editing to be the fastest path for small, local changes.
- User expects workshop to be used when they want more space and focus than the stage provides.

---

## Workshop vs Stage Editing Boundary

```text
small live tweak        -> stage
reshape or branch idea  -> workshop
save reusable version   -> crate
```

### User expectations

- User expects there to be a practical difference between stage editing and workshop editing.
- User expects stage to be better for small adjustments.
- User expects workshop to be better for larger rewrites, branching, and focused authoring.
- User expects reopening a staged piece in workshop to feel like an intentional step, not a hidden coupling.
- User expects workshop to matter during performance without replacing the stage.

---

## What To Avoid

Conductor should avoid collapsing into generic software.

That means avoiding:

- too many utility panels
- global adjective shortcuts as the main mechanic
- too much visible AI-generate framing
- DAW mimicry
- over-explaining the engine
- identical generic controls on every lane
- reducing the whole product to a generic XY pad or dashboard

### User expectations

- User expects the product to preserve mystery and depth.
- User expects not every capability to be exposed as utility chrome.
- User expects the interface to remain stage-like rather than productivity-like.
- User expects Conductor to resist becoming just another software workbench.

---

## State Labels The UI Should Make Obvious

```text
new draft
editing saved kick
editing staged bass
saved
unsaved changes
previewing: pressure floor
live target: deep current
loaded
staged
```

### User expectations

- User expects to know exactly what object they are editing.
- User expects to know whether that object came from:
  - a new draft
  - a saved crate item
  - a staged lane
- User expects save state to remain visible while editing.
- User expects preview state to be visible while preview is active.
- User expects "loaded" and "staged" to mean different things.
- User expects these labels to reduce ambiguity rather than add noise.

---

## Score: Structural Version

The final conclusion of the session was that the score should stay structural and practical, not be forced to carry the app's whole visual identity.

```text
SCORE
1 kick      ▇   ▇   ▇   ▇
2 hats      ─ ─ ─ ─ ─ ─ ─
3 bass      ▃   ▄   ▃   ▅
```

### User expectations

- User expects score to stay readable and useful.
- User expects score to help with arrangement decisions.
- User expects score not to become visually overloaded.
- User expects selected lane and playhead to remain clear.
- User expects the score to be for structure and function, not atmosphere.

---

## Score: Ensemble + Lane Fingerprints

This was the preferred score direction over the flat pulse and heatmap-row approaches.

```text
SCORE

ensemble
▁▁▂▂▃▄▅▆▅▄▃▂▂▃▄▅
░░▒▒▓▓▓▓▓▓▒▒░░░░
      │
   playhead

lanes
1 jazz room      ▇   ▇   ▇   ▇
2 clock drift    ─ ─ ─ ─ ─ ─ ─ ─
3 pluck step     ▂ ▃ ▄ ▅ ▄ ▃ ▂ ▃
4 choir vowel    ▁ ▂ ▃   ▂ ▃ ▁
```

### User expectations

- User expects the score to reflect the whole ensemble, not just individual lanes.
- User expects adding a layer to visibly change the overall picture.
- User expects the score to show what the music feels like structurally right now.
- User expects the lane rows to explain the parts.
- User expects the ensemble view to explain the sum.
- User expects the score to help them decide what is missing:
  - low end
  - movement
  - texture
  - top-end rhythm
- User expects the score to feel like music, not track management.

---

## Score Rejections

### Flat pulse rows

```text
████░░░░████░░░░████
```

Why it was rejected:

- too flat
- too generic
- felt like blocks moving across the screen
- did not communicate musical identity

### Colored heatmap rows

```text
██████████
──────────
▄▄▄▄▄▄▄▄▄▄
```

Why it was rejected:

- too DAW-like
- visually louder but not more meaningful
- still treated the score as lane bookkeeping

### User expectations behind those rejections

- User expects score changes to mean something musically.
- User expects the score not to become a decorative spreadsheet.
- User expects stronger meaning, not just more color or motion.

---

## Lane Personality Examples

These are not strict implementation rules, but they express the kind of difference lanes should eventually convey:

- the kick is stubborn and structural
- the hats are twitchy and articulate
- the bass is heavy and responsive
- the texture is atmospheric and unruly
- the lead wakes up only when invited

### User expectations

- User expects voices to have character.
- User expects lane identity to be memorable.
- User expects to learn how certain voices behave under pressure.
- User expects not every lane to feel interchangeable.

---

## Score Limits

The session concluded that score should not try to do everything.

### User expectations

- User expects score to communicate structure, timing, density, and lane identity.
- User does not expect score to carry the entire emotional atmosphere of the set.
- User expects expressive feeling to come from a different layer in the future, likely Hydra.
- User expects score to stay compact enough that stage code still has room to breathe.

---

## Hydra As A Separate Future Surface

```text
Score  = where is the structure
Hydra  = what does the set feel like
```

### User expectations

- User expects Hydra to be additive, not a replacement for music structure.
- User expects Hydra to make the set feel alive visually.
- User expects Hydra to support mood, motion, atmosphere, and performance energy.
- User expects Hydra not to make the core app harder to understand.
- User expects Hydra to be explored only after the music-first workflow is working.

---

## Hydra As Future Feeling Layer

```text
┌ CONDUCTOR ───────────────────────────────────────────────────────────────┐
│ SCORE                                                                    │
│ 1 kick      ▇   ▇   ▇   ▇                                                │
│ 2 hats      ─ ─ ─ ─ ─ ─ ─                                                │
│ 3 bass      ▃   ▄   ▃   ▅                                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                HYDRA VISUAL FIELD / LIVE SCENE                           │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ stage lanes...                                                           │
├──────────────────────────────────────────────────────────────────────────┤
│ CRATE                                                                    │
└──────────────────────────────────────────────────────────────────────────┘
```

### User expectations

- User expects score to stay structural and practical.
- User expects Hydra to carry mood and visual energy.
- User expects adding or removing layers to change the feeling of the scene.
- User expects the app to become more performative without becoming confusing.
- User expects the music workflow to remain primary.
- User expects visuals to support the set, not compete with it.

---

## Product Story Conductor Should Tell

```text
Write small pieces
Save them to crate
Stage them into a live set
Edit the live set intentionally
Return to workshop when you need more space
```

### User expectations

- User expects Conductor to make composition feel modular.
- User expects pieces to move naturally between workshop, crate, and stage.
- User expects the app to support both composing and performing.
- User expects the product story to stay understandable even as features grow.

---

## Emotional Arc Of A Good Session

A strong Conductor session should feel like:

- entering an existing pulse
- probing and listening
- finding which voices are alive
- making small moves
- discovering resistance
- learning the ensemble
- creating tension
- overpushing something
- recovering
- finding a moment worth saving
- building a set out of moments
- performing the system instead of merely using it

### User expectations

- User expects the product to support a sense of journey, not just output.
- User expects recovery and restraint to matter.
- User expects great moments to feel found as much as authored.
- User expects the product to support drama and release.

---

## What Could Make Conductor Great

Three things matter most:

### 1. Lane personality

Each voice should have its own expressive identity and signature feel.

### 2. Behavioral depth

The system should have inertia, not instant obedience.

### 3. Phrase ritual

Changes should land with visible and satisfying consequence.

### User expectations

- User expects the product to be judged on feel as much as function.
- User expects phrase landings to feel ceremonial and important.
- User expects calculated risk to be possible.
- User expects the system to allow flirting with instability without collapsing into nonsense.

---

## Shipping Decision

By the end of the session, the decision was:

- ship the current music-first version first
- do not block shipping on Hydra
- keep Hydra as a future branch

### User expectations

- User expects the current version to already support the core loop:
  - write
  - save
  - stage
  - reshape live
- User expects future visual work to build on a coherent product, not rescue a broken one.
- User expects Conductor to stay music-first even if visuals are added later.

---

## Current Strengths At End Of Session

By the end of the session, these were considered working well enough to ship:

- the workshop/stage/crate split
- staged-source editing in workshop
- inline sliders in workshop
- clearer authoring vs live-edit semantics
- a simpler, more practical score direction
- a coherent music-first product story

### User expectations

- User expects the shipped version to already feel coherent.
- User expects future iterations to refine clarity and feeling, not repair fundamental confusion.
- User expects the current version to be a valid prototype for real user feedback.
