# Architecture

This is a short map of the current Conductor codebase.

It exists to make the repo easier to work with before any deeper refactors.

## Mental Model

Conductor has four important domains:

- `stage` — the live arranged set
- `workshop` — draft editing and save/stage flows
- `crate` — saved voices, organized by set and role
- `score` — structural overview of the stage

## Main Entry Points

### App shell

- [src/App.tsx](/Users/gregbruss/Documents/AI-Projects/conductor/src/App.tsx)

Owns:

- top-level React state
- Strudel initialization and evaluation
- stage code string
- preview / hush / restore flow
- crate state and set-name state
- workshop open / close wiring

This file is currently the heaviest concentration of logic in the app.

### Workshop

- [src/components/WorkshopOverlay.tsx](/Users/gregbruss/Documents/AI-Projects/conductor/src/components/WorkshopOverlay.tsx)

Owns:

- draft state
- staged vs saved vs new source semantics
- save / save-to-crate behavior
- update / update-live behavior
- workshop-local modals
- role browsing and set context

### Stage lanes

- [src/components/LayerCard.tsx](/Users/gregbruss/Documents/AI-Projects/conductor/src/components/LayerCard.tsx)
- [src/components/InteractiveCode.tsx](/Users/gregbruss/Documents/AI-Projects/conductor/src/components/InteractiveCode.tsx)

Own:

- lane rendering
- slider interaction
- lane focus/edit behavior

### Crate

- [src/components/SetDock.tsx](/Users/gregbruss/Documents/AI-Projects/conductor/src/components/SetDock.tsx)
- [src/lib/crateStore.ts](/Users/gregbruss/Documents/AI-Projects/conductor/src/lib/crateStore.ts)
- [src/lib/setNames.ts](/Users/gregbruss/Documents/AI-Projects/conductor/src/lib/setNames.ts)

Own:

- crate UI
- crate persistence
- set filtering
- starter set name normalization

### Score

- [src/components/SequencerOverview.tsx](/Users/gregbruss/Documents/AI-Projects/conductor/src/components/SequencerOverview.tsx)
- [src/components/Punchcard.tsx](/Users/gregbruss/Documents/AI-Projects/conductor/src/components/Punchcard.tsx)

Own:

- score rendering
- pattern analysis heuristics
- pulse/fingerprint generation

## Data Objects

### `CrateVoice`

Defined in [src/types.ts](/Users/gregbruss/Documents/AI-Projects/conductor/src/types.ts)

Represents a saved voice in the user’s crate.

Important fields:

- `name`
- `role`
- `setName`
- `code`

### Stage `Layer`

Also in [src/types.ts](/Users/gregbruss/Documents/AI-Projects/conductor/src/types.ts)

Represents a currently staged live lane.

## Main Behavior Paths

### Save from workshop

1. User edits in workshop
2. Workshop decides target `setName`
3. Save creates or updates a `CrateVoice`
4. Crate persists through `crateStore`

### Stage from workshop

1. Workshop builds a draft voice
2. App appends its code into the stage code string
3. Stage re-evaluates through Strudel

### Edit staged voice through workshop

1. User selects a stage lane
2. Opens workshop
3. Workshop seeds draft from selected lane
4. `update live` writes the edited code back to that lane

## Known Complexity Hotspots

These are the files most likely to want refactoring next:

- [src/App.tsx](/Users/gregbruss/Documents/AI-Projects/conductor/src/App.tsx)
- [src/components/WorkshopOverlay.tsx](/Users/gregbruss/Documents/AI-Projects/conductor/src/components/WorkshopOverlay.tsx)
- [src/hooks/useTreeNav.ts](/Users/gregbruss/Documents/AI-Projects/conductor/src/hooks/useTreeNav.ts)

The current cleanup strategy is:

- avoid behavior changes
- extract repeated domain helpers first
- add documentation before deeper structural refactors

## Documentation

- [user-expectations.md](/Users/gregbruss/Documents/AI-Projects/conductor/user-expectations.md)
  Primary product document.
- [README.md](/Users/gregbruss/Documents/AI-Projects/conductor/README.md)
  Repo front door.
