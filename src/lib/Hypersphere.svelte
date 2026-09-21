<script>
/**
 * The quaternion's own space, drawn the way eater.net and 3Blue1Brown draw it:
 * every unit quaternion is a point on a 4D hypersphere, projected
 * stereographically from -1 into ordinary 3D.
 *
 *   1 (no turn)          the centre
 *   every 180° turn      the unit sphere (w = 0)
 *   -1 (a 360° turn)     infinity - the same orientation as 1, a different point
 *
 * Drawn in the SCENE's frame, not an engine's: q's point then lies along the
 * same direction as the turn's axis in the aircraft view (right-hand rule),
 * which is what makes the two views line up when their cameras are aligned.
 * The axes wear the same colours as the aircraft's own axes for the chosen
 * engine.
 *
 * q can be dragged: the point moves, and the aircraft turns to match.
 * With `motion` set, six reference circles show what multiplying by q^s does
 * to the whole hypersphere.
 */
import { onMount } from "svelte";
import {
	Color,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Plane,
	Raycaster,
	Scene,
	SphereGeometry,
	Vector2,
	Vector3,
	WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import {
	DEG,
	ENGINE_AXES,
	fromStereographic,
	greatCircle,
	len3,
	mul,
	neg,
	normalize,
	normalize3,
	power,
	scale3,
	stereographic,
} from "./rotation.js";
import {
	disposeTree,
	fitCamera,
	letterColour,
	makeArrow,
	makeDot,
	makeLabel,
	makeLines,
	readColours,
	setArrow,
	setLabel,
	setPolylines,
} from "./scene3d.js";

let {
	q,
	engine,
	paths = [],
	motion = null,
	reducedMotion = false,
	alignDir = null,
	labels,
	ariaLabel,
	describedBy,
	onq,
	onview,
} = $props();

let host;
let failed = $state(false);

// Beyond this radius a projected point is drawn as a break in the line: the
// path is heading for infinity, which is where -1 lives.
const CLIP = 3.4;
const project = (p) => {
	const s = stereographic(p);
	return s && len3(s) < CLIP ? s : null;
};

// The scene's axes, and which semantic direction each one is.
const AXES = [
	{ dir: [1, 0, 0], name: "right", semantic: "right" },
	{ dir: [0, 1, 0], name: "up", semantic: "up" },
	{ dir: [0, 0, 1], name: "back", semantic: "forward" },
];

const REFERENCE = [
	{ key: 0, a: [0, 0, 0, 1], b: [1, 0, 0, 0] },
	{ key: 1, a: [0, 0, 0, 1], b: [0, 1, 0, 0] },
	{ key: 2, a: [0, 0, 0, 1], b: [0, 0, 1, 0] },
	{ key: "sphere", a: [1, 0, 0, 0], b: [0, 1, 0, 0] },
	{ key: "sphere", a: [0, 1, 0, 0], b: [0, 0, 1, 0] },
	{ key: "sphere", a: [0, 0, 1, 0], b: [1, 0, 0, 0] },
].map((r) => ({ ...r, points: greatCircle(r.a, r.b, 200) }));

onMount(() => {
	let renderer;
	try {
		renderer = new WebGLRenderer({ antialias: true });
	} catch {
		failed = true;
		return;
	}
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	const canvas = renderer.domElement;
	canvas.tabIndex = 0;
	canvas.setAttribute("role", "img");
	host.prepend(canvas);
	const labelRenderer = new CSS2DRenderer();
	labelRenderer.domElement.className = "labels";
	host.append(labelRenderer.domElement);

	const scene = new Scene();
	const camera = new PerspectiveCamera(40, 1, 0.05, 100);
	camera.position.set(...scale3(normalize3([6.3, 3.8, 5.6]), 6.2));
	const controls = new OrbitControls(camera, canvas);
	controls.enablePan = false;
	controls.enableDamping = !reducedMotion;
	controls.minDistance = 2;
	controls.maxDistance = 16;
	const frameDistance = camera.position.length();

	const lineMaterials = [];
	const track = (lines) => {
		lineMaterials.push(lines.material);
		return lines;
	};

	// The unit sphere (w = 0): solid lattice lines in a colour that clears 3:1
	// on the view background in both themes, over a faint fill for depth. It
	// was a 28%-opacity wireframe, which blended below 3:1 in the light theme.
	const sphere = new Mesh(
		new SphereGeometry(1, 32, 24),
		new MeshBasicMaterial({ transparent: true, opacity: 0.07, depthWrite: false }),
	);
	const lattice = track(makeLines(1.4));
	const circle = (at) => Array.from({ length: 97 }, (_, i) => at((i / 96) * 2 * Math.PI));
	const meridians = [0, 1, 2, 3, 4, 5].map((m) => {
		const phi = (m / 6) * Math.PI;
		return circle((s) => [Math.sin(s) * Math.cos(phi), Math.cos(s), Math.sin(s) * Math.sin(phi)]);
	});
	const parallels = [-60, -30, 0, 30, 60].map((lat) => {
		const y = Math.sin(lat * DEG);
		const r = Math.cos(lat * DEG);
		return circle((s) => [r * Math.cos(s), y, r * Math.sin(s)]);
	});
	setPolylines(lattice, [...meridians, ...parallels]);
	const sphereLabel = makeLabel("quiet");
	sphereLabel.position.set(0.1, 1.12, 0);
	scene.add(sphere, lattice, sphereLabel);

	const axes = AXES.map((axis) => {
		const arrow = makeArrow(0.012);
		setArrow(arrow, axis.dir, 1.55);
		const label = makeLabel();
		label.position.set(...scale3(axis.dir, 1.72));
		scene.add(arrow, label);
		return { ...axis, arrow, label };
	});

	const origin = makeDot(0.045);
	const originLabel = makeLabel("quiet");
	originLabel.center.set(1.08, 1.2);
	origin.add(originLabel);
	const qDot = makeDot(0.08);
	const qPick = makeDot(0.28);
	qPick.material = new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
	const qLabel = makeLabel();
	qLabel.center.set(-0.1, 1.2);
	qDot.add(qLabel);
	const minusDot = makeDot(0.055);
	const minusLabel = makeLabel("quiet");
	minusLabel.center.set(-0.1, 1.2);
	minusDot.add(minusLabel);
	scene.add(origin, qDot, qPick, minusDot);

	const axisLine = track(makeLines(1.8, true));
	const ticks = [90, 180, 270].map((deg) => {
		const dot = makeDot(0.03);
		const label = makeLabel("quiet");
		label.center.set(-0.15, 0.5);
		setLabel(label, `${deg}°`, "quiet");
		dot.add(label);
		scene.add(dot);
		return { deg, dot };
	});
	scene.add(axisLine);

	const pathLines = { good: track(makeLines(3.5, false)), bad: track(makeLines(3.5, true)) };
	scene.add(pathLines.good, pathLines.bad);

	const circleLines = {
		0: track(makeLines(2.5)),
		1: track(makeLines(2.5)),
		2: track(makeLines(2.5)),
		sphere: track(makeLines(2)),
	};
	scene.add(...Object.values(circleLines));

	let colours;
	let appliedEngine = null;
	function applyColours() {
		colours = readColours(host);
		scene.background = new Color(colours.view);
		sphere.material.color.set(colours.muted);
		lattice.material.color.set(colours.lattice);
		origin.material.color.set(colours.muted);
		qDot.material.color.set(colours.nose);
		qPick.material.color.set(colours.nose);
		minusDot.material.color.set(colours.ghost);
		axisLine.material.color.set(colours.muted);
		for (const tk of ticks) tk.dot.material.color.set(colours.muted);
		pathLines.good.material.color.set(colours.good);
		pathLines.bad.material.color.set(colours.bad);
		circleLines.sphere.material.color.set(colours.muted);
		appliedEngine = null;
	}

	/** The same colour each direction wears in the aircraft view. */
	function applyEngine() {
		appliedEngine = engine;
		axes.forEach((axis, i) => {
			const c = colours[letterColour(ENGINE_AXES[engine][axis.semantic])];
			axis.arrow.userData.material.color.set(c);
			circleLines[i].material.color.set(c);
		});
		appliedLabels = null;
	}

	let appliedLabels = null;
	let appliedQ = null;
	let appliedPaths = null;
	let appliedMotion = null;

	function sync() {
		if (engine !== appliedEngine) applyEngine();
		if (labels !== appliedLabels) {
			appliedLabels = labels;
			setLabel(sphereLabel, labels.sphere, "quiet");
			setLabel(originLabel, labels.identity, "quiet");
			setLabel(qLabel, labels.q);
			setLabel(minusLabel, labels.minusQ, "quiet");
			for (const axis of axes) {
				setLabel(axis.label, labels[axis.name], letterColour(ENGINE_AXES[engine][axis.semantic]));
			}
		}

		const unit = normalize(q);
		const qKey = unit.map((c) => c.toFixed(5)).join();
		if (qKey !== appliedQ) {
			appliedQ = qKey;
			const p = stereographic(unit);
			qDot.visible = Boolean(p && len3(p) < CLIP);
			if (qDot.visible) {
				qDot.position.set(...p);
				qPick.position.set(...p);
			}
			const m = stereographic(neg(unit));
			minusDot.visible = Boolean(m && len3(m) < CLIP);
			if (minusDot.visible) minusDot.position.set(...m);

			// The great circle through 1 and q is a straight line through the
			// centre, along q's axis. Its ticks mark the turn angle: a θ turn
			// about that axis sits at tan(θ/4), for every θ in (0°, 360°).
			const axis = normalize3(unit.slice(0, 3));
			axisLine.visible = Boolean(axis);
			for (const tk of ticks) tk.dot.visible = Boolean(axis);
			if (axis) {
				setPolylines(axisLine, [[scale3(axis, -CLIP), scale3(axis, CLIP)]]);
				for (const tk of ticks) tk.dot.position.set(...scale3(axis, Math.tan((tk.deg / 4) * DEG)));
			}
		}

		if (paths !== appliedPaths) {
			appliedPaths = paths;
			for (const kind of ["good", "bad"]) {
				const path = paths.find((p) => (kind === "good") === p.good);
				setPolylines(pathLines[kind], path ? [path.quats.map(project)] : []);
			}
		}

		const motionKey = `${motion}|${qKey}`;
		if (motionKey !== appliedMotion) {
			appliedMotion = motionKey;
			const by = motion === null ? null : power(unit, motion);
			for (const key of Object.keys(circleLines)) {
				const circles = by
					? REFERENCE.filter((r) => String(r.key) === key).map((r) => r.points.map((p) => project(mul(by, p))))
					: [];
				setPolylines(circleLines[key], circles);
			}
		}

		controls.enableDamping = !reducedMotion && !alignDir;
		if (alignDir && !orbiting) {
			const offset = camera.position.clone().sub(controls.target);
			const want = new Vector3(...alignDir);
			if (offset.clone().normalize().distanceTo(want) > 1e-4) {
				camera.position.copy(controls.target).addScaledVector(want, offset.length());
				camera.lookAt(controls.target);
			}
		}
	}

	/* ---- dragging q ---- */
	const raycaster = new Raycaster();
	const pointer = new Vector2();
	const plane = new Plane();
	const hit = new Vector3();
	let dragging = false;

	function aim(event) {
		const rect = canvas.getBoundingClientRect();
		pointer.set(
			((event.clientX - rect.left) / rect.width) * 2 - 1,
			-((event.clientY - rect.top) / rect.height) * 2 + 1,
		);
		raycaster.setFromCamera(pointer, camera);
	}

	const overQ = (event) => {
		aim(event);
		return qDot.visible && raycaster.intersectObject(qPick, false).length > 0;
	};

	function down(event) {
		if (event.button !== 0 || event.target !== canvas || !overQ(event)) return;
		event.stopPropagation();
		event.preventDefault();
		dragging = true;
		controls.enabled = false;
		host.setPointerCapture(event.pointerId);
		host.style.cursor = "grabbing";
	}

	function move(event) {
		if (!dragging) {
			const over = overQ(event);
			host.style.cursor = over ? "grab" : "";
			qPick.material.opacity = over ? 0.25 : 0;
			return;
		}
		aim(event);
		plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new Vector3()), qDot.position);
		if (!raycaster.ray.intersectPlane(plane, hit)) return;
		const p = hit.toArray();
		const r = len3(p);
		const limited = r > CLIP * 0.9 ? scale3(p, (CLIP * 0.9) / r) : p;
		onq?.(fromStereographic(limited));
	}

	function up(event) {
		if (!dragging) return;
		dragging = false;
		controls.enabled = true;
		host.style.cursor = "";
		if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
	}

	host.addEventListener("pointerdown", down, { capture: true });
	host.addEventListener("pointermove", move);
	host.addEventListener("pointerup", up);
	host.addEventListener("pointercancel", up);

	let orbiting = false;
	controls.addEventListener("start", () => {
		orbiting = true;
	});
	controls.addEventListener("end", () => {
		orbiting = false;
	});
	controls.addEventListener("change", () => {
		if (orbiting && alignDir) {
			onview?.(camera.position.clone().sub(controls.target).normalize().toArray());
		}
	});

	let width = 1;
	let height = 1;
	const observer = new ResizeObserver(() => {
		width = Math.max(1, host.clientWidth);
		height = Math.max(1, host.clientHeight);
		renderer.setSize(width, height);
		labelRenderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		// The unit sphere is what matters here, not the clip radius, so a
		// half-width view needs far less backing off than the aircraft view.
		fitCamera(camera, controls, frameDistance, 0.8);
		for (const m of lineMaterials) m.resolution.set(width, height);
	});
	observer.observe(host);

	let frame;
	const loop = () => {
		sync();
		controls.update();
		renderer.render(scene, camera);
		labelRenderer.render(scene, camera);
		frame = requestAnimationFrame(loop);
	};
	applyColours();
	frame = requestAnimationFrame(loop);
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
		controls.dispose();
		disposeTree(scene);
		renderer.dispose();
		canvas.remove();
		labelRenderer.domElement.remove();
	};
});

$effect(() => {
	const canvas = host?.querySelector("canvas");
	if (!canvas) return;
	canvas.setAttribute("aria-label", ariaLabel);
	canvas.setAttribute("aria-describedby", describedBy);
});
</script>

<div class="hyper" bind:this={host}>
	{#if failed}
		<p class="no-webgl" role="alert">{labels.noWebgl}</p>
	{/if}
</div>

<style>
	.hyper {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 0;
		overflow: hidden;
		background: var(--view-bg);
		touch-action: none;
	}

	.hyper :global(canvas) {
		display: block;
	}

	/* Inset: the container clips overflow, so an outward ring would vanish. */
	.hyper :global(canvas:focus-visible) {
		outline-offset: -4px;
	}

	.hyper :global(.labels) {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.no-webgl {
		position: absolute;
		inset: 1rem;
		margin: 0;
		display: grid;
		place-items: center;
		text-align: center;
	}
</style>
