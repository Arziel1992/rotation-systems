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
 * With `motion` set, it also shows what multiplying by q does to the whole
 * hypersphere: six reference circles carried along by q^s.
 */
import { onMount } from "svelte";
import {
	Color,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	SphereGeometry,
	WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import {
	DEG,
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
	paths = [],
	motion = null,
	reducedMotion = false,
	labels,
	ariaLabel,
	describedBy,
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

const REFERENCE = [
	{ key: "x", a: [0, 0, 0, 1], b: [1, 0, 0, 0] },
	{ key: "y", a: [0, 0, 0, 1], b: [0, 1, 0, 0] },
	{ key: "z", a: [0, 0, 0, 1], b: [0, 0, 1, 0] },
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
	camera.position.set(3.4, 2.5, 4.5);
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

	const sphere = new Mesh(
		new SphereGeometry(1, 24, 16),
		new MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.28 }),
	);
	const sphereLabel = makeLabel("quiet");
	sphereLabel.position.set(0.1, 1.12, 0);
	scene.add(sphere, sphereLabel);

	const axes = ["x", "y", "z"].map((key, i) => {
		const arrow = makeArrow(0.012);
		const dir = [0, 0, 0];
		dir[i] = 1;
		setArrow(arrow, dir, 1.55);
		const label = makeLabel(key);
		label.position.set(...scale3(dir, 1.72));
		scene.add(arrow, label);
		return { key, arrow, label };
	});

	const origin = makeDot(0.045);
	const originLabel = makeLabel("quiet");
	originLabel.center.set(1.08, 1.2);
	origin.add(originLabel);
	const qDot = makeDot(0.07);
	const qLabel = makeLabel();
	qLabel.center.set(-0.1, 1.2);
	qDot.add(qLabel);
	const minusDot = makeDot(0.055);
	const minusLabel = makeLabel("quiet");
	minusLabel.center.set(-0.1, 1.2);
	minusDot.add(minusLabel);
	scene.add(origin, qDot, minusDot);

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
		x: track(makeLines(2.5)),
		y: track(makeLines(2.5)),
		z: track(makeLines(2.5)),
		sphere: track(makeLines(2)),
	};
	scene.add(...Object.values(circleLines));

	let colours;
	function applyColours() {
		colours = readColours(host);
		scene.background = new Color(colours.view);
		sphere.material.color.set(colours.muted);
		for (const a of axes) a.arrow.userData.material.color.set(colours[a.key]);
		origin.material.color.set(colours.muted);
		qDot.material.color.set(colours.nose);
		minusDot.material.color.set(colours.ghost);
		axisLine.material.color.set(colours.muted);
		for (const t of ticks) t.dot.material.color.set(colours.muted);
		pathLines.good.material.color.set(colours.good);
		pathLines.bad.material.color.set(colours.bad);
		for (const key of ["x", "y", "z"]) circleLines[key].material.color.set(colours[key]);
		circleLines.sphere.material.color.set(colours.muted);
	}

	let appliedLabels = null;
	let appliedQ = null;
	let appliedPaths = null;
	let appliedMotion = null;

	function sync() {
		if (labels !== appliedLabels) {
			appliedLabels = labels;
			setLabel(sphereLabel, labels.sphere, "quiet");
			setLabel(originLabel, labels.identity, "quiet");
			setLabel(qLabel, labels.q);
			setLabel(minusLabel, labels.minusQ, "quiet");
			for (const a of axes) setLabel(a.label, a.key, a.key);
		}

		const unit = normalize(q);
		const qKey = unit.map((c) => c.toFixed(5)).join();
		if (qKey !== appliedQ) {
			appliedQ = qKey;
			const p = stereographic(unit);
			qDot.visible = Boolean(p && len3(p) < CLIP);
			if (qDot.visible) qDot.position.set(...p);
			const m = stereographic(neg(unit));
			minusDot.visible = Boolean(m && len3(m) < CLIP);
			if (minusDot.visible) minusDot.position.set(...m);

			// The great circle through 1 and q is a straight line through the
			// centre, along q's axis. Its ticks mark the turn angle: a θ turn
			// about that axis sits at tan(θ/4), for every θ in (0°, 360°).
			const axis = normalize3(unit.slice(0, 3));
			axisLine.visible = Boolean(axis);
			for (const t of ticks) t.dot.visible = Boolean(axis);
			if (axis) {
				setPolylines(axisLine, [[scale3(axis, -CLIP), scale3(axis, CLIP)]]);
				for (const t of ticks) t.dot.position.set(...scale3(axis, Math.tan((t.deg / 4) * DEG)));
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
					? REFERENCE.filter((r) => r.key === key).map((r) => r.points.map((p) => project(mul(by, p))))
					: [];
				setPolylines(circleLines[key], circles);
			}
		}
	}

	let width = 1;
	let height = 1;
	const observer = new ResizeObserver(() => {
		width = Math.max(1, host.clientWidth);
		height = Math.max(1, host.clientHeight);
		renderer.setSize(width, height);
		labelRenderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		fitCamera(camera, controls, frameDistance, 1.3);
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
