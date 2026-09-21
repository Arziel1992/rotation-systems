<script>
/**
 * The main 3D view. Draws what it is given and reports what the learner does
 * to it; it never decides an orientation itself (App.svelte does).
 *
 * Dragging the aircraft turns it; dragging empty space orbits the camera;
 * dragging the target (look-at tab) moves the target. The canvas takes
 * keyboard focus and forwards keys to App, which owns their meaning.
 */
import { onMount } from "svelte";
import {
	Color,
	DirectionalLight,
	GridHelper,
	Group,
	HemisphereLight,
	Matrix4,
	MeshBasicMaterial,
	PerspectiveCamera,
	Plane,
	Raycaster,
	Scene,
	Vector2,
	Vector3,
	WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import {
	add3,
	cross,
	DEG,
	displayVec,
	ENGINE_AXES,
	fromAxisAngle,
	mul,
	normalize,
	normalize3,
	rotate,
	scale3,
} from "./rotation.js";
import {
	colourAircraft,
	disposeTree,
	fitCamera,
	letterColour,
	makeAircraft,
	makeArrow,
	makeDot,
	makeLabel,
	makeLines,
	makeRing,
	readColours,
	setArrow,
	setLabel,
	setPolylines,
} from "./scene3d.js";

let {
	q,
	cols = null,
	engine,
	reducedMotion = false,
	gimbal = null,
	showAxes = true,
	ghosts = [],
	trails = [],
	axisArrow = null,
	target = null,
	rays = [],
	dragObject = true,
	labels,
	ariaLabel,
	describedBy,
	onturn,
	ontarget,
	onkeydown,
} = $props();

let host;
let failed = $state(false);

const GIZMO = 96;
const LOCAL = { right: [1, 0, 0], up: [0, 1, 0], forward: [0, 0, -1] };
const LOCAL_LENGTH = { right: 1.25, up: 1.0, forward: 1.55 };
const RINGS = { yaw: 2.15, pitch: 1.95, roll: 1.75 };
const SEMANTIC = { yaw: "up", pitch: "right", roll: "forward" };

onMount(() => {
	let renderer;
	try {
		renderer = new WebGLRenderer({ antialias: true });
	} catch {
		// No WebGL (a locked-down lab image, a sandboxed embed). The code panel
		// and read-out still work; say so rather than showing a blank box.
		failed = true;
		return;
	}
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	const canvas = renderer.domElement;
	canvas.tabIndex = 0;
	canvas.setAttribute("role", "application");
	canvas.setAttribute("aria-roledescription", "3D");
	host.prepend(canvas);

	const labelRenderer = new CSS2DRenderer();
	labelRenderer.domElement.className = "labels";
	host.append(labelRenderer.domElement);
	const gizmoLabels = new CSS2DRenderer();
	gizmoLabels.domElement.className = "gizmo-labels";
	gizmoLabels.setSize(GIZMO, GIZMO);
	host.append(gizmoLabels.domElement);

	const scene = new Scene();
	const camera = new PerspectiveCamera(38, 1, 0.1, 100);
	// Far enough back to frame the rings' labels and a target 3.4 m overhead.
	camera.position.set(6.3, 3.8, 5.6);
	const controls = new OrbitControls(camera, canvas);
	controls.enablePan = false;
	controls.enableDamping = !reducedMotion;
	controls.minDistance = 4;
	controls.maxDistance = 26;
	const frameDistance = camera.position.length();

	scene.add(new HemisphereLight(0xffffff, 0x445066, 1.6));
	const sun = new DirectionalLight(0xffffff, 1.8);
	sun.position.set(3, 6, 4);
	scene.add(sun);

	let grid = null;
	const lineMaterials = [];
	const track = (lines) => {
		lineMaterials.push(lines.material);
		return lines;
	};

	/* ---- the aircraft and its own axes ---- */
	const aircraft = makeAircraft();
	scene.add(aircraft);
	const localArrows = {};
	const localLabels = {};
	for (const key of Object.keys(LOCAL)) {
		localArrows[key] = makeArrow(0.024);
		setArrow(localArrows[key], LOCAL[key], LOCAL_LENGTH[key]);
		localLabels[key] = makeLabel();
		localLabels[key].position.set(...scale3(LOCAL[key], LOCAL_LENGTH[key] + 0.18));
		aircraft.add(localArrows[key], localLabels[key]);
	}

	/* ---- the gimbal: one ring and one axis per Euler angle ---- */
	const gimbalGroup = new Group();
	scene.add(gimbalGroup);
	const rings = {};
	const ringHolders = {};
	const ringAxes = {};
	const ringLabels = {};
	for (const key of Object.keys(RINGS)) {
		rings[key] = makeRing(RINGS[key]);
		ringHolders[key] = new Group();
		ringHolders[key].add(rings[key]);
		ringAxes[key] = makeArrow(0.016);
		ringLabels[key] = makeLabel();
		gimbalGroup.add(ringHolders[key], ringAxes[key], ringLabels[key]);
	}
	rings.yaw.rotation.x = Math.PI / 2; // perpendicular to up
	rings.pitch.rotation.y = Math.PI / 2; // perpendicular to right

	/* ---- ghosts, trails, quaternion axis, target, rays ---- */
	const ghostPool = [0, 1].map(() => {
		const plane = makeAircraft({ ghost: true });
		const label = makeLabel("quiet");
		label.position.set(0, 0.45, 0);
		plane.add(label);
		scene.add(plane);
		return { plane, label };
	});

	const trailPool = {
		good: { lines: track(makeLines(3.5, false)), label: makeLabel("good") },
		bad: { lines: track(makeLines(3.5, true)), label: makeLabel("bad") },
	};
	for (const t of Object.values(trailPool)) scene.add(t.lines, t.label);

	const axisGroup = new Group();
	const axisPlus = makeArrow(0.02);
	const axisMinus = track(makeLines(2, true));
	const arc = track(makeLines(3, false));
	const arcHead = makeArrow(0.02);
	const axisLabel = makeLabel("quiet");
	const arcLabel = makeLabel();
	axisGroup.add(axisPlus, axisMinus, arc, arcHead, axisLabel, arcLabel);
	scene.add(axisGroup);

	const targetGroup = new Group();
	const targetDot = makeDot(0.15, true);
	const targetPick = makeDot(0.4);
	targetPick.material = new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
	const sightLine = track(makeLines(2, true));
	const targetLabel = makeLabel("target");
	targetLabel.position.set(0, 0.35, 0);
	targetDot.add(targetLabel);
	targetGroup.add(targetDot, targetPick, sightLine);
	scene.add(targetGroup);

	const rayPool = [0, 1].map(() => {
		const arrow = makeArrow(0.028);
		const label = makeLabel();
		scene.add(arrow, label);
		return { arrow, label };
	});
	const bullet = makeDot(0.09);
	scene.add(bullet);

	/* ---- world-axes gizmo, drawn in the corner ---- */
	const gizmoScene = new Scene();
	const gizmoCamera = new PerspectiveCamera(40, 1, 0.1, 20);
	const gizmoArrows = ["X", "Y", "Z"].map(() => makeArrow(0.05));
	const gizmoText = ["X", "Y", "Z"].map(() => makeLabel());
	gizmoScene.add(...gizmoArrows, ...gizmoText);

	/* ---- colours, from the CSS tokens ---- */
	let colours = null;
	const colourOf = (letter) => colours[letterColour(letter)];

	function applyColours() {
		colours = readColours(host);
		scene.background = new Color(colours.view);
		renderer.setClearColor(colours.view);
		if (grid) {
			scene.remove(grid);
			disposeTree(grid);
		}
		grid = new GridHelper(9, 9, colours.grid, colours.grid);
		grid.position.y = -2.5;
		scene.add(grid);
		colourAircraft(aircraft, colours);
		for (const g of ghostPool) colourAircraft(g.plane, colours, true);
		trailPool.good.lines.material.color.set(colours.good);
		trailPool.bad.lines.material.color.set(colours.bad);
		for (const part of [axisPlus.userData.material, arcHead.userData.material]) part.color.set(colours.muted);
		axisMinus.material.color.set(colours.muted);
		arc.material.color.set(colours.muted);
		targetDot.material.color.set(colours.target);
		sightLine.material.color.set(colours.target);
		bullet.material.color.set(colours.nose);
		applyEngine();
	}

	let appliedEngine = null;
	function applyEngine() {
		appliedEngine = engine;
		const letters = ENGINE_AXES[engine];
		for (const key of Object.keys(LOCAL)) {
			localArrows[key].userData.material.color.set(colourOf(letters[key]));
		}
		for (const [ring, semantic] of Object.entries(SEMANTIC)) {
			const c = colourOf(letters[semantic]);
			rings[ring].material.color.set(c);
			ringAxes[ring].userData.material.color.set(c);
		}
		["X", "Y", "Z"].forEach((letter, i) => {
			const unit = [0, 0, 0];
			unit[i] = 1;
			const dir = displayVec(engine, unit);
			setArrow(gizmoArrows[i], dir, 0.85);
			gizmoArrows[i].userData.material.color.set(colours[letter.toLowerCase()]);
			gizmoText[i].position.set(...scale3(dir, 1.05));
		});
		appliedLabels = null;
	}

	/* ---- labels: translated text, re-set when the language changes ---- */
	let appliedLabels = null;
	function applyLabels() {
		appliedLabels = labels;
		const letters = ENGINE_AXES[engine];
		for (const key of Object.keys(LOCAL)) {
			setLabel(localLabels[key], `${labels[key]} (${letters[key]})`, letterColour(letters[key]));
		}
		for (const [ring, semantic] of Object.entries(SEMANTIC)) {
			const letter = letters[semantic];
			setLabel(ringLabels[ring], `${labels[ring]} (${letter.slice(-1)})`, letterColour(letter));
		}
		["X", "Y", "Z"].forEach((letter, i) => {
			setLabel(gizmoText[i], letter, letter.toLowerCase());
		});
		setLabel(targetLabel, labels.target, "target");
		setLabel(axisLabel, labels.axis, "quiet");
	}

	/* ---- per-frame sync from props ---- */
	const matrix = new Matrix4();
	let appliedTrails = null;
	let appliedAxis = null;
	let appliedTarget = null;

	function sync(time) {
		if (engine !== appliedEngine) applyEngine();
		if (labels !== appliedLabels) applyLabels();

		if (cols) {
			const [a, b, c] = cols;
			aircraft.matrixAutoUpdate = false;
			matrix.set(a[0], b[0], c[0], 0, a[1], b[1], c[1], 0, a[2], b[2], c[2], 0, 0, 0, 0, 1);
			aircraft.matrix.copy(matrix);
			aircraft.matrixWorldNeedsUpdate = true;
		} else {
			aircraft.matrixAutoUpdate = true;
			aircraft.quaternion.set(...normalize(q));
		}
		for (const key of Object.keys(LOCAL)) {
			localArrows[key].visible = showAxes;
			localLabels[key].visible = showAxes;
		}

		gimbalGroup.visible = Boolean(gimbal);
		if (gimbal) {
			const qYaw = fromAxisAngle([0, 1, 0], -gimbal.yaw * DEG);
			const qYawPitch = mul(qYaw, fromAxisAngle([1, 0, 0], gimbal.pitch * DEG));
			ringHolders.yaw.quaternion.set(...qYaw);
			ringHolders.pitch.quaternion.set(...qYaw);
			ringHolders.roll.quaternion.set(...qYawPitch);
			const axes = {
				yaw: [0, 1, 0],
				pitch: rotate(qYaw, [1, 0, 0]),
				roll: rotate(qYawPitch, [0, 0, -1]),
			};
			for (const key of Object.keys(RINGS)) {
				setArrow(ringAxes[key], axes[key], RINGS[key] + 0.3);
				ringLabels[key].position.set(...scale3(axes[key], RINGS[key] + 0.55));
			}
		}

		ghostPool.forEach((g, i) => {
			const ghost = ghosts[i];
			g.plane.visible = Boolean(ghost);
			g.label.visible = Boolean(ghost);
			if (ghost) {
				g.plane.quaternion.set(...normalize(ghost.q));
				setLabel(g.label, ghost.label, "quiet");
			}
		});

		if (trails !== appliedTrails) {
			appliedTrails = trails;
			for (const kind of ["good", "bad"]) {
				const trail = trails.find((t) => (kind === "good") === t.good);
				const slot = trailPool[kind];
				setPolylines(slot.lines, trail ? [trail.points] : []);
				slot.label.visible = Boolean(trail);
				if (trail) {
					slot.label.position.set(...trail.points.at(-1));
					setLabel(slot.label, trail.label, kind);
				}
			}
		}

		axisGroup.visible = Boolean(axisArrow);
		if (axisArrow && axisArrow !== appliedAxis) {
			appliedAxis = axisArrow;
			const axis = normalize3(axisArrow.axis) ?? [0, 1, 0];
			setArrow(axisPlus, axis, 2.5);
			setPolylines(axisMinus, [[[0, 0, 0], scale3(axis, -2.5)]]);
			axisLabel.position.set(...scale3(axis, 2.75));
			// The positive direction of turn, by the right-hand rule, drawn as
			// an arc around the axis near its tip.
			const helper = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
			const u = normalize3(cross(axis, helper));
			const v = cross(axis, u);
			const centre = scale3(axis, 1.9);
			const sweep = Math.min(330, Math.max(20, axisArrow.angle % 360 || 360)) * DEG;
			const at = (t) => add3(centre, add3(scale3(u, 0.5 * Math.cos(t)), scale3(v, 0.5 * Math.sin(t))));
			const points = [];
			for (let i = 0; i <= 40; i++) points.push(at((i / 40) * sweep));
			setPolylines(arc, [points]);
			const end = at(sweep);
			const tangent = add3(scale3(u, -Math.sin(sweep)), scale3(v, Math.cos(sweep)));
			arcHead.position.set(...end);
			setArrow(arcHead, tangent, 0.2);
			arcLabel.position.set(...add3(centre, scale3(u, 0.95)));
		}
		if (axisArrow) setLabel(arcLabel, axisArrow.label, "quiet");

		targetGroup.visible = Boolean(target);
		if (target && target !== appliedTarget) {
			appliedTarget = target;
			targetDot.position.set(...target);
			targetPick.position.set(...target);
			setPolylines(sightLine, [[[0, 0, 0], target]]);
		}

		let firing = null;
		rayPool.forEach((slot, i) => {
			const ray = rays[i];
			slot.arrow.visible = Boolean(ray);
			slot.label.visible = Boolean(ray);
			if (!ray) return;
			setArrow(slot.arrow, ray.dir, 2.6);
			slot.arrow.userData.material.color.set(ray.good ? colours.good : colours.bad);
			slot.label.position.set(...scale3(normalize3(ray.dir) ?? [0, 0, -1], 2.95));
			setLabel(slot.label, ray.label, ray.good ? "good" : "bad");
			if (ray.fire) firing = ray;
		});
		bullet.visible = Boolean(firing);
		if (firing) {
			const dir = normalize3(firing.dir) ?? [0, 0, -1];
			const s = reducedMotion ? 1 : (time / 1300) % 1;
			bullet.position.set(...scale3(dir, 0.9 + s * 1.9));
		}
	}

	/* ---- picking and dragging ---- */
	const raycaster = new Raycaster();
	const pointer = new Vector2();
	let drag = null;

	function aim(event) {
		const rect = canvas.getBoundingClientRect();
		pointer.set(
			((event.clientX - rect.left) / rect.width) * 2 - 1,
			-((event.clientY - rect.top) / rect.height) * 2 + 1,
		);
		raycaster.setFromCamera(pointer, camera);
	}

	function pick(event) {
		aim(event);
		if (target && raycaster.intersectObject(targetPick, false).length) return "target";
		if (dragObject && raycaster.intersectObject(aircraft, true).length) return "object";
		return null;
	}

	function down(event) {
		if (event.button !== 0 || event.target !== canvas) return;
		const hit = pick(event);
		if (!hit) return; // OrbitControls takes it
		event.stopPropagation();
		event.preventDefault();
		drag = { kind: hit, x: event.clientX, y: event.clientY };
		controls.enabled = false;
		host.setPointerCapture(event.pointerId);
		host.style.cursor = "grabbing";
		canvas.focus({ preventScroll: true });
	}

	const plane = new Plane();
	const hitPoint = new Vector3();
	const camRight = new Vector3();
	const camUp = new Vector3();

	function move(event) {
		if (!drag) {
			host.style.cursor = pick(event) ? "grab" : "";
			return;
		}
		if (drag.kind === "object") {
			const dx = event.clientX - drag.x;
			const dy = event.clientY - drag.y;
			drag.x = event.clientX;
			drag.y = event.clientY;
			camRight.setFromMatrixColumn(camera.matrixWorld, 0);
			camUp.setFromMatrixColumn(camera.matrixWorld, 1);
			const k = 0.011;
			onturn?.(
				mul(
					fromAxisAngle(camUp.toArray(), dx * k),
					fromAxisAngle(camRight.toArray(), dy * k),
				),
			);
		} else {
			aim(event);
			const normal = camera.getWorldDirection(new Vector3());
			plane.setFromNormalAndCoplanarPoint(normal, targetDot.position);
			if (raycaster.ray.intersectPlane(plane, hitPoint)) {
				ontarget?.(hitPoint.toArray().map((c) => Math.max(-4.5, Math.min(4.5, c))));
			}
		}
	}

	function up(event) {
		if (!drag) return;
		drag = null;
		controls.enabled = true;
		host.style.cursor = "";
		if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
	}

	host.addEventListener("pointerdown", down, { capture: true });
	host.addEventListener("pointermove", move);
	host.addEventListener("pointerup", up);
	host.addEventListener("pointercancel", up);
	const keys = (event) => onkeydown?.(event);
	canvas.addEventListener("keydown", keys);

	/* ---- size ---- */
	let width = 1;
	let height = 1;
	const observer = new ResizeObserver(() => {
		width = Math.max(1, host.clientWidth);
		height = Math.max(1, host.clientHeight);
		renderer.setSize(width, height);
		labelRenderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		fitCamera(camera, controls, frameDistance, 1.15);
		for (const m of lineMaterials) m.resolution.set(width, height);
	});
	observer.observe(host);

	/* ---- loop ---- */
	let frame;
	const loop = (time) => {
		sync(time);
		controls.update();
		gizmoCamera.position.copy(camera.position).sub(controls.target).setLength(3.4);
		gizmoCamera.up.copy(camera.up);
		gizmoCamera.lookAt(0, 0, 0);

		renderer.setScissorTest(false);
		renderer.setViewport(0, 0, width, height);
		renderer.render(scene, camera);
		labelRenderer.render(scene, camera);

		renderer.setScissorTest(true);
		renderer.setScissor(8, 8, GIZMO, GIZMO);
		renderer.setViewport(8, 8, GIZMO, GIZMO);
		renderer.render(gizmoScene, gizmoCamera);
		renderer.setScissorTest(false);
		gizmoLabels.render(gizmoScene, gizmoCamera);

		frame = requestAnimationFrame(loop);
	};

	applyColours();
	frame = requestAnimationFrame(loop);

	// Re-read the palette whenever the theme flips.
	const themeWatch = new MutationObserver(applyColours);
	themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

	return () => {
		cancelAnimationFrame(frame);
		observer.disconnect();
		themeWatch.disconnect();
		host.removeEventListener("pointerdown", down, { capture: true });
		host.removeEventListener("pointermove", move);
		host.removeEventListener("pointerup", up);
		host.removeEventListener("pointercancel", up);
		canvas.removeEventListener("keydown", keys);
		controls.dispose();
		disposeTree(scene);
		disposeTree(gizmoScene);
		renderer.dispose();
		canvas.remove();
		labelRenderer.domElement.remove();
		gizmoLabels.domElement.remove();
	};
});

// The accessible name and description follow the language and the pose.
$effect(() => {
	const canvas = host?.querySelector("canvas");
	if (!canvas) return;
	canvas.setAttribute("aria-label", ariaLabel);
	canvas.setAttribute("aria-describedby", describedBy);
});
</script>

<div class="viewport" bind:this={host}>
	{#if failed}
		<p class="no-webgl" role="alert">{labels.noWebgl}</p>
	{/if}
	<span class="gizmo-caption" aria-hidden="true">{labels.worldAxes}</span>
</div>

<style>
	.viewport {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 0;
		overflow: hidden;
		background: var(--view-bg);
		touch-action: none;
	}

	.viewport :global(canvas) {
		display: block;
	}

	/* Inset: the container clips overflow, so an outward ring would vanish. */
	.viewport :global(canvas:focus-visible) {
		outline-offset: -4px;
	}

	.viewport :global(.labels) {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.viewport :global(.gizmo-labels) {
		position: absolute;
		left: 8px;
		bottom: 8px;
		pointer-events: none;
	}

	.viewport :global(.gizmo-labels .label3d) {
		padding: 0 4px;
		font-size: 11px;
	}

	.gizmo-caption {
		position: absolute;
		left: 12px;
		/* Clear of the gizmo's own labels, which can sit just above its box. */
		bottom: calc(96px + 24px);
		font-size: 0.72rem;
		color: var(--muted);
		background: color-mix(in srgb, var(--surface) 80%, transparent);
		border-radius: 4px;
		padding: 0 4px;
		pointer-events: none;
	}

	.no-webgl {
		position: absolute;
		inset: 1rem;
		margin: 0;
		display: grid;
		place-items: center;
		text-align: center;
		color: var(--text);
	}
</style>
