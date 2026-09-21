# Rotation Systems

An interactive tool for learning how games store and change **3D orientation**. Turn one aircraft
with Euler angles, a quaternion, a basis or look-at, and watch the same pose written live in
**Godot (GDScript), Unity (C#) and Unreal (C++)**. Every method also has a "Break it" scenario
showing how it fails when nothing guards its limits, such as gimbal lock, and the fix.

It teaches the concept, not one unit's module: it was built for the 3D rotation content in
COS30031 Games Programming (module 06), and serves any unit that teaches game transforms.

**Live:** <https://arziel1992.github.io/rotation-systems/> ·
**Repository:** <https://github.com/Arziel1992/rotation-systems>

## Key Features

- **Four methods, one orientation.** Euler angles with a gimbal rig; axis-and-angle quaternions;
  turns about the object's own or the world's axes, with the rotation matrix; and look-at, with a
  target. Switching method keeps the pose.
- **Live code in three engines.** Values that come from the pose are highlighted and change as you
  turn it. The engines disagree about axes, handedness and signs, so the same pose is typed
  differently in each: Unity types nose-up as a negative `x`, Godot types turn-right as a negative
  `y`, and Unreal names its angles.
- **Everything can be dragged.** The aircraft; the gimbal rings; a rotation gizmo on the basis
  tab (local or world); the quaternion's axis tip and θ ring; q in the 4D view; the look-at target;
  and **the numbers in the code**, which are sliders in the engine's own units.
- **Break it.** Gimbal lock at 90° pitch; lerping 350° → 10° the long way round; slerp without the
  shortest-path check; q and −q; an unnormalised quaternion; basis drift; a world constant used as
  forward; and a look-at target passing overhead. Timed scenarios can be paused and scrubbed.
- **The hypersphere, after [eater.net/quaternions](https://eater.net/quaternions).** The unit
  quaternion as a point on a 4D sphere, projected into 3D in the scene's own directions: no turn at
  the centre, 180° turns on the unit sphere, 360° at infinity. **Align the views** and orbiting
  either camera orbits both, so q's point lines up with the aircraft's turn axis. "Apply q
  gradually" shows what multiplying by q does to the whole hypersphere.
- **A textbook, a read-out and a manual.** The left rail explains the current method in cards,
  with a note per engine. The right rail's live read-out shows the same orientation four ways in
  the chosen engine's terms. The manual and glossary (32 entries) open with **G**, the **Manual**
  button, or any **?**.
- **Checked against the engines.** Every sign is verified by the self-check against each engine's
  own composition formula, and every engine behaviour the tool states was checked against the
  vendor's documentation or source on 21 September 2026 (see `CHANGELOG.md`).
- **English and Spanish; light and dark.** The language, the theme, the chosen method and engine,
  and which side panels are open are remembered; theme and panels apply before the page paints.

## Mathematical Models

**Semantic angles.** Internally every orientation is a quaternion in one frame: right-handed,
+X right, +Y up, forward −Z. Yaw turns the nose right, pitch lifts it, roll drops the right wing,
applied yaw → pitch → roll, which is the order all three engines use:

$$
q = q_{\text{yaw}} \, q_{\text{pitch}} \, q_{\text{roll}}
$$

**Engine conversions.** The same pose typed in each engine:

| Engine | Typed as | Quaternion components |
| --- | --- | --- |
| Godot | `rotation_degrees = (pitch, −yaw, −roll)` | $(x, y, z, w)$ |
| Unity | `Quaternion.Euler(−pitch, yaw, −roll)` | $(-x, -y, z, w)$ |
| Unreal | `FRotator(pitch, yaw, roll)` | $(z, -x, -y, w)$ |

**Axis and angle.**

$$
w = \cos\tfrac{\theta}{2}, \qquad (x, y, z) = \hat{a}\,\sin\tfrac{\theta}{2}
$$

**Stereographic projection** from the pole at −1, as in the hypersphere view, and its inverse for
dragging q. A turn of θ lands at distance $\tan(\theta/4)$ along its axis:

$$
p = \frac{(x, y, z)}{1 + w}, \qquad q = \left(\frac{2p}{1 + |p|^2},\ \frac{1 - |p|^2}{1 + |p|^2}\right)
$$

**Dragging a ring.** A drag is a turn about that ring's axis by the right-hand rule, which is the
ring's own angle changing (yaw's sign flips, because + yaw turns clockwise seen from above). The
self-check proves this against the true rotation about each ring's axis.

## Running It

### Parameters

No command-line arguments. Two URL parameters:

| Parameter | Effect |
| --- | --- |
| `?selftest` | Runs the self-check in the browser and prints a table to the console. |
| `?model=aircraft` or `?model=capybara` | Forces the model. Without it, one load in a hundred swaps the aircraft for a capybara head (nose forward, an orange on top for up) and says so to screen readers. |

### Controls

| Key or gesture | Does |
| --- | --- |
| <kbd>1</kbd>–<kbd>4</kbd> | Choose a method |
| <kbd>G</kbd> | Open the manual and glossary |
| Arrow keys, <kbd>Q</kbd>/<kbd>E</kbd> (3D view focused) | Turn the aircraft; <kbd>Shift</kbd> for bigger steps |
| Arrow keys, <kbd>Page Up</kbd>/<kbd>Page Down</kbd> (look-at) | Move the target |
| Drag a highlighted number in the code | Change it; or focus it and use the arrow keys |
| Drag the aircraft, a ring, the axis tip or q | Turn the aircraft |
| Drag empty space / scroll | Orbit / zoom the camera |

### Usage Examples

```bash
pnpm dev                 # open http://localhost:5173/rotation-systems/
pnpm run selftest        # the self-check in Node; exits non-zero on a failure
```

Open `http://localhost:5173/rotation-systems/?selftest` to run the same checks in the browser.

## Tech Stack

- **Framework:** [Svelte 5](https://svelte.dev/) (runes)
- **3D:** [three.js](https://threejs.org/), with CSS2D labels so every label is real, translatable
  text
- **Icons:** [Font Awesome Free](https://fontawesome.com/) 7
- **Build:** [Vite](https://vite.dev/)
- **Tooling:** [Biome](https://biomejs.dev/) for formatting and linting; pnpm and Node pinned
  through [Volta](https://volta.sh/)

## Local Development & Deployment

### Installation

Requires Node 24 and pnpm, both managed by Volta (`package.json` pins them). Dependencies:
`svelte`, `three` and `@fortawesome/fontawesome-free`, installed by pnpm.

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Run the development server:**

   ```bash
   pnpm dev
   ```

3. **Build for production (GitHub Pages):**

   ```bash
   pnpm build
   ```

   `.github/workflows/deploy.yml` builds and publishes `dist/` on a push to `main`. The Vite
   `base` is `/rotation-systems/`, which must match the repository name.

## License

GNU Affero General Public License v3.0. See [LICENSE](./LICENSE). Font Awesome Free is used under
its own licences (icons CC BY 4.0, fonts SIL OFL 1.1, code MIT).

---
_Made with ❤️ for Swinburne — 3D Rotation — By E. Ketterer_
