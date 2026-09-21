# Rotation Systems

An interactive tool for learning how games store and change **3D orientation**. Turn one aircraft
with Euler angles, a quaternion, a basis or look-at, and watch the same pose written live in
**Godot (GDScript), Unity (C#) and Unreal (C++)**. Every method also has a "Break it" scenario
showing how it fails when nothing guards its limits, such as gimbal lock, and the fix.

It teaches the concept, not one unit's module: it was built for the 3D rotation content in
COS30031 Games Programming (module 06), and serves any unit that teaches game transforms.

## Key Features

- **Four tabs, one orientation.** Euler angles with a gimbal rig; axis-and-angle quaternions;
  turns about the object's own or the world's axes, with the rotation matrix; and look-at, with a
  draggable target. Switching tab keeps the pose.
- **Live code in three engines.** Values that come from the pose are highlighted and change as you
  turn it. The engines disagree about axes, handedness and signs, so the same pose is typed
  differently in each: Unity types nose-up as a negative `x`, Godot types turn-right as a negative
  `y`, and Unreal names its angles.
- **Break it.** Gimbal lock at 90° pitch; lerping 350° → 10° the long way round; slerp without the
  shortest-path check; q and −q; an unnormalised quaternion; basis drift; a world constant used as
  forward; and a look-at target passing overhead. Timed scenarios can be paused and scrubbed.
- **The hypersphere, after [eater.net/quaternions](https://eater.net/quaternions).** The unit
  quaternion as a point on a 4D sphere, projected into 3D: no turn at the centre, 180° turns on the
  unit sphere, 360° at infinity. "Apply q gradually" shows what multiplying by q does to all of it.
- **Read-out.** The same orientation four ways in the chosen engine's terms: Euler as the engine
  reads it back, quaternion, axis and angle, and the object's own forward, right and up.
- **Direct manipulation and keyboard.** Drag the aircraft to turn it, or focus the view and use the
  arrow keys and <kbd>Q</kbd>/<kbd>E</kbd> (<kbd>Shift</kbd> for bigger steps). In look-at, drag
  the target, or use the arrow keys and <kbd>Page Up</kbd>/<kbd>Page Down</kbd>.
- **English and Spanish; light and dark.** Both choices, and whether the explanation rail is shown,
  are remembered and applied before the page paints.

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

**Stereographic projection** from the pole at −1, as in the hypersphere view. A turn of θ lands at
distance $\tan(\theta/4)$ along its axis:

$$
p = \frac{(x, y, z)}{1 + w}
$$

## Running It

### Parameters

No command-line arguments. One URL parameter:

| Parameter | Effect |
| --- | --- |
| `?selftest` | Runs the self-check in the browser and prints a table to the console. |

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
- **Build:** [Vite](https://vite.dev/)
- **Tooling:** [Biome](https://biomejs.dev/) for formatting and linting; pnpm and Node pinned
  through [Volta](https://volta.sh/)

## Local Development & Deployment

### Installation

Requires Node 24 and pnpm, both managed by Volta (`package.json` pins them).

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

GNU Affero General Public License v3.0. See [LICENSE](./LICENSE).

---
_Made with ❤️ for Swinburne — 3D Rotation — By E. Ketterer_
