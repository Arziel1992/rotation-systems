# Changelog

Reverse-chronological, newest first. Each heading is the release instant; the version in
`package.json` is the same instant written `YYYY.M.D-HHMM`.

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
