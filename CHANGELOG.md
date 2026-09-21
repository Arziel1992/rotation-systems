# Changelog

Reverse-chronological, newest first. Each heading is the release instant; the version in
`package.json` is the same instant written `YYYY.M.D-HHMM`.

## 2026-09-21 - 18:49

Review round: the house look, direct manipulation everywhere, a manual, and every engine
behaviour re-checked against the vendor's own documentation or source.

### Changed

- **Restyled onto the house design system** used by the `cos30002-*` tools: the textbook rail on
  the left and the control rail on the right, both collapsible from tabs on the stage edges and
  remembered; section headers with round **?** glossary buttons; the method list as the house mode
  list (keys 1–4); rule cards, formula blocks and engine-note cards in the textbook; the read-out as
  the house telemetry panel; Inter and JetBrains Mono. The dark theme, the focus ring and AA
  contrast are kept: 118 colour pairs checked by script in both themes.
- **Icons are Font Awesome 7** (global §9), not emoji.
- **More space between code lines**, and values inside code comments are now plain comment text;
  they had been rendered as live code values, which mixed the two.

### Added

- **A manual and glossary**: 32 entries in six groups, in English and Spanish, opened by **G**, by
  the **Manual** button, or at the right entry by any **?**. A native `<dialog>`, so focus
  containment and <kbd>Esc</kbd> come from the browser.
- **Drag the numbers in the code.** Every value you can change is a slider: drag it up or down, or
  focus it and use the arrow keys. It moves the engine's own number, so dragging Unity's `x` up
  pitches the nose down, as it would in Unity. `src/lib/scrub.js` holds the mapping.
- **Drag the rotation circles**: the gimbal rings in the Euler tab, a new rotation gizmo in the basis
  tab (local or world), and the quaternion's axis tip and θ ring.
- **Drag q in the 4D view**, and the aircraft follows. The 4D view now uses the scene's own
  directions, so q's point lies along the aircraft's turn axis.
- **Align the views**: orbiting either camera in the quaternion tab orbits both.

### Corrected after checking the vendors' sources

Each of these was stated from memory in the first release and was wrong or unsupported.

- **Godot `look_at` with a parallel up vector prints a warning and picks an arbitrary roll**; it
  does not fail with an error (`core/math/basis.cpp`, `Basis::looking_at`).
- **Unity `LookRotation` with forward colinear to up falls back to `FromToRotation(+Z, forward)`**
  (Unity scripting reference); the roll is not left undefined.
- **Unreal `FindLookAtRotation` builds from the direction alone (`MakeFromX`)**, which swaps its
  reference up axis near vertical; that is why the yaw jumps.
- **An unnormalised quaternion is handled differently per engine.** Godot's `Basis(q)` divides by
  the squared length and quietly corrects it, while `q * v` and `slerp` report "must be normalized"
  in debug builds, and `q * v` returns the vector unturned (`core/math/quaternion.h`). The card no
  longer implies every engine applies the raw `q·v·q*` scaling.
- **Unreal q and −q**: `AngularDistance` was replaced by an explicit `2·acos(|Q | MinusQ|)`,
  because its formula could not be confirmed from a public source.

Confirmed as written: Unity's `Quaternion.Angle` uses the absolute dot product and `==` requires a
dot above 1 − ε (UnityCsReference, `Quaternion.cs`); Unreal's `Slerp` "will correct alignment" and
`SlerpFullPath` "doesn't do any checks for shortest distance" (API reference); Godot's `slerp`
flips on a negative dot and `slerpni` does not (source and class reference); Unreal's positive
Pitch, Yaw and Roll directions. Unity's `Slerp` taking the short way is established by the
community (Unity Discussions) rather than by Unity's documentation.

### Self-check

`rotation.selftest.js` has 108 checks: the scrub mapping for every engine, the ring-drag signs
against true rotations about each ring's axis, the inverse stereographic projection, and comment
values rendering as comment text, each with a negative control.

## 2026-09-21 - 14:32

First release, scaffolded from `Templates/svelte-app` as a non-simulation `svelte-app` (no
`shell: sim`).

### Added

- **Four ways to set an orientation**, one tab each: Euler angles (yaw, pitch, roll, with a gimbal
  rig), quaternion (axis and angle), basis (turns about the object's own or the world's axes, with
  the rotation matrix), and look-at (a draggable target).
- **Live code in three engines** - GDScript for Godot 4, C# for Unity 6, C++ for Unreal 5 - with
  every value that comes from the pose highlighted. The same pose produces different numbers in
  each engine, because the engines differ in axes, handedness and sign, and the code comments say
  which is which.
- **Break it** scenarios: gimbal lock, lerping an angle the long way round, slerp without the
  shortest-path check, q and −q, an unnormalised quaternion, basis drift, a world constant used as
  forward, and a look-at target passing overhead. Each shows the failure and its fix, and the timed
  ones can be paused and scrubbed.
- **The hypersphere view** (after eater.net): the quaternion as a point on the unit 3-sphere,
  stereographically projected, with turn-angle ticks, slerp paths, and "apply q gradually" showing
  how multiplying by q carries six reference circles.
- A read-out of the same orientation four ways (Euler read-back, quaternion, axis-angle, the
  object's axes) in the chosen engine's terms.
- English and Spanish, light and dark themes, both persisted and applied before first paint; a
  toggleable explanation rail, also persisted.
- `src/lib/rotation.selftest.js`: 83 checks, each with a negative control. The engine conversions
  are verified against each engine's own composition formula - Unity's `Quaternion.Euler` order,
  Godot's YXZ basis, and Unreal's `FRotator::Quaternion()` - not against themselves. Run it with
  `pnpm run selftest`, or open the tool with `?selftest`.

### Notes

- `vite.config.js` raises `chunkSizeWarningLimit` to 900 kB, documented in place: three.js alone
  is about 600 kB minified and the tool cannot draw without it.
- The quaternion tab goes past the COS30031 scope on purpose. Module 06 puts quaternion arithmetic
  out of scope; the hypersphere view is there for a learner who wants the reason behind the rules,
  and for units that teach the maths.
