# Conductor

Conductor is a music-first live performance tool for composing from small Strudel pieces.

The app is built around four main surfaces:

- `Score` for structure and overview
- `Stage` for live arrangement and direct performance control
- `Workshop` for authoring and reshaping voices
- `Crate` for browsing saved voices by set and role

The main product document is [user-expectations.md](/Users/gregbruss/Documents/AI-Projects/conductor/user-expectations.md).

## Status

This is an early but coherent prototype.

Current strengths:

- workshop / crate / stage model is working
- voices can be saved into sets
- crate can filter by set
- staged voices can be reopened in workshop
- workshop can update staged material intentionally

## Getting Started

Install dependencies and run the app:

```bash
npm install
npm run dev
```

Optional local server:

```bash
npm run server
```

Build for production:

```bash
npm run build
```

Typecheck:

```bash
npm run lint
```

## Repo Map

- [src/App.tsx](/Users/gregbruss/Documents/AI-Projects/conductor/src/App.tsx)
  App shell, Strudel evaluation flow, top-level state.
- [src/components/WorkshopOverlay.tsx](/Users/gregbruss/Documents/AI-Projects/conductor/src/components/WorkshopOverlay.tsx)
  Workshop UI, draft state, save/stage/update semantics.
- [src/components/SetDock.tsx](/Users/gregbruss/Documents/AI-Projects/conductor/src/components/SetDock.tsx)
  Crate UI and set filtering.
- [src/components/LayerCard.tsx](/Users/gregbruss/Documents/AI-Projects/conductor/src/components/LayerCard.tsx)
  Stage lane UI.
- [src/components/SequencerOverview.tsx](/Users/gregbruss/Documents/AI-Projects/conductor/src/components/SequencerOverview.tsx)
  Score renderer.
- [src/lib/crateStore.ts](/Users/gregbruss/Documents/AI-Projects/conductor/src/lib/crateStore.ts)
  Crate persistence and default starter content loading.
- [src/lib/voiceLibrary.ts](/Users/gregbruss/Documents/AI-Projects/conductor/src/lib/voiceLibrary.ts)
  Built-in starter voices.
- [src/lib/setNames.ts](/Users/gregbruss/Documents/AI-Projects/conductor/src/lib/setNames.ts)
  Shared set-name rules and normalization.

See also [ARCHITECTURE.md](/Users/gregbruss/Documents/AI-Projects/conductor/ARCHITECTURE.md) for a short system map.

## Engineering Notes

The codebase is still heavier than it should be in a few places:

- `App.tsx` is too large
- `WorkshopOverlay.tsx` is too large
- some interaction rules are still encoded in UI components instead of smaller domain helpers

The current direction for cleanup is:

- keep product behavior stable
- extract repeated domain logic into shared helpers
- document the system clearly
- split large components only when the boundaries are obvious

## License

No project license has been selected yet.

That is a product/legal decision rather than an engineering default.
