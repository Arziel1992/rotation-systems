<script>
/**
 * The main 3D view. Draws what it is given and reports what the learner does
 * to it; it never decides an orientation itself (App.svelte does).
 *
 * Things that can be dragged, nearest hit first:
 *   the gimbal rings (Euler)       -> onring(kind, degrees)
 *   the gizmo rings (basis)        -> ongizmo(axis, degrees, phase)
 *   the axis tip and θ ring (quat) -> onaxis(axis), onangle(degrees)
 *   the target (look-at)           -> ontarget(position)
 *   the aircraft                   -> onturn(quaternion)
 *   empty space                    -> orbits the camera (and onview, aligned)
 * Degrees are always a turn about the ring's own axis, right-hand rule; App
 * turns that into the method's own angle (rotation.js, ringToAngle).
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
	Sphere,
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
	ringAxes,
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
	makePickRing,
	makeRing,
	readColours,
	ringDragger,
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
	gizmo = null,
	showAxes = true,
	ghosts = [],
	trails = [],
	axisArrow = null,
	target = null,
	rays = [],
	dragObject = true,
	alignDir = null,
	labels,
	ariaLabel,
	describedBy,
	onturn,
	ontarget,
	onring,
	ongizmo,
	onaxis,
	onangle,
	onview,
	onkeydown,
} = $props();

let host;
let failed = $state(false);

const GIZMO = 96;
const LOCAL = { right: [1, 0, 0], up: [0, 1, 0], forward: [0, 0, -1] };
const LOCAL_LENGTH = { right: 1.25, up: 1.0, forward: 1.55 };
const RINGS = { yaw: 2.15, pitch: 1.95, roll: 1.75 };
const SEMANTIC = { yaw: "up", pitch: "right", roll: "forward" };
const GIZMO_RADIUS = 1.45;
const AXIS_LENGTH = 2.5;
const ARC = { at: 1.9, radius: 0.5 };

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
	// Far enough back to frame the rings' labels and a target overhead.
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
	aircraft.userData.pick = { kind: "object" };
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

	/* ---- the gimbal: one ring and one axis per Euler angle, draggable ---- */
	const gimbalGroup = new Group();
	scene.add(gimbalGroup);
	const rings = {};
	const ringPicks = {};
	const ringHolders = {};
	const ringAxisArrows = {};
	const ringLabels = {};
	for (const key of Object.keys(RINGS)) {
		rings[key] = makeRing(RINGS[key]);
		ringPicks[key] = makePickRing(RINGS[key], { kind: "ring", name: key });
		ringHolders[key] = new Group();
		ringHolders[key].add(rings[key], ringPicks[key]);
		ringAxisArrows[key] = makeArrow(0.016);
		ringLabels[key] = makeLabel();
		gimbalGroup.add(ringHolders[key], ringAxisArrows[key], ringLabels[key]);
	}
	// perpendicular to up, and to right; roll's ring is already across -Z
	for (const mesh of [rings.yaw, ringPicks.yaw]) mesh.rotation.x = Math.PI / 2;
	for (const mesh of [rings.pitch, ringPicks.pitch]) mesh.rotation.y = Math.PI / 2;

	/* ---- the basis gizmo: rings about the object's own (or world) axes ---- */
	const gizmoGroup = new Group();
	scene.add(gizmoGroup);
	const gizmoRings = {};
	const gizmoPicks = {};
	for (const name of Object.keys(LOCAL)) {
		gizmoRings[name] = makeRing(GIZMO_RADIUS, 0.014);
		gizmoPicks[name] = makePickRing(GIZMO_RADIUS, { kind: "gizmo", name });
		gizmoGroup.add(gizmoRings[name], gizmoPicks[name]);
	}
	for (const mesh of [gizmoRings.up, gizmoPicks.up]) mesh.rotation.x = Math.PI / 2;
	for (const mesh of [gizmoRings.right, gizmoPicks.right]) mesh.rotation.y = Math.PI / 2;

	/* ---- ghosts, trails ---- */
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
	for (const tr of Object.values(trailPool)) scene.add(tr.lines, tr.label);

	/* ---- quaternion axis: a draggable tip, and a draggable θ ring ---- */
	const axisGroup = new Group();
	const axisPlus = makeArrow(0.022);
	const axisMinus = track(makeLines(2, true));
	const axisTip = makeDot(0.12);
	const axisTipPick = makeDot(0.32);
	axisTipPick.material = new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
	axisTipPick.userData.pick = { kind: "axis" };
	const arcHolder = new Group();
	const arcRing = makeRing(ARC.radius, 0.016);
	const arcPick = makePickRing(ARC.radius, { kind: "angle" });
	arcHolder.add(arcRing, arcPick);
	const arcSweep = track(makeLines(4, false));
	const arcHead = makeArrow(0.024);
	const axisLabel = makeLabel("quiet");
	const arcLabel = makeLabel();
	axisGroup.add(axisPlus, axisMinus, axisTip, axisTipPick, arcHolder, arcSweep, arcHead, axisLabel, arcLabel);
	scene.add(axisGroup);

	/* ---- look-at target ---- */
	const targetGroup = new Group();
	const targetDot = makeDot(0.15, true);
	const targetPick = makeDot(0.4);
	targetPick.material = new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
	targetPick.userData.pick = { kind: "target" };
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
	const cornerScene = new Scene();
	const cornerCamera = new PerspectiveCamera(40, 1, 0.1, 20);
	const cornerArrows = ["X", "Y", "Z"].map(() => makeArrow(0.05));
	const cornerText = ["X", "Y", "Z"].map(() => makeLabel());
	cornerScene.add(...cornerArrows, ...cornerText);

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
		for (const gh of ghostPool) colourAircraft(gh.plane, colours, true);
		trailPool.good.lines.material.color.set(colours.good);
		trailPool.bad.lines.material.color.set(colours.bad);
		for (const m of [axisPlus.userData.material, arcHead.userData.material]) m.color.set(colours.muted);
		axisMinus.material.color.set(colours.muted);
		axisTip.material.color.set(colours.nose);
		arcRing.material.color.set(colours.muted);
		arcSweep.material.color.set(colours.nose);
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
			const c = colourOf(letters[key]);
			localArrows[key].userData.material.color.set(c);
			gizmoRings[key].material.color.set(c);
			gizmoPicks[key].material.color.set(c);
		}
		for (const [ring, semantic] of Object.entries(SEMANTIC)) {
			const c = colourOf(letters[semantic]);
			rings[ring].material.color.set(c);
			ringPicks[ring].material.color.set(c);
			ringAxisArrows[ring].userData.material.color.set(c);
		}
		arcPick.material.color.set(colours.nose);
		["X", "Y", "Z"].forEach((letter, i) => {
			const unit = [0, 0, 0];
			unit[i] = 1;
			const dir = displayVec(engine, unit);
			setArrow(cornerArrows[i], dir, 0.85);
			cornerArrows[i].userData.material.color.set(colours[letter.toLowerCase()]);
			cornerText[i].position.set(...scale3(dir, 1.05));
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
			setLabel(cornerText[i], letter, letter.toLowerCase());
		});
		setLabel(targetLabel, labels.target, "target");
		setLabel(axisLabel, labels.axis, "quiet");
	}

	/* ---- per-frame sync from props ---- */
	const matrix = new Matrix4();
	let appliedTrails = null;
	let appliedAxis = null;
	let appliedTarget = null;
	let currentRingAxes = null;
	let axisNow = [0, 1, 0];

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
			currentRingAxes = ringAxes(gimbal);
			for (const key of Object.keys(RINGS)) {
				setArrow(ringAxisArrows[key], currentRingAxes[key], RINGS[key] + 0.3);
				ringLabels[key].position.set(...scale3(currentRingAxes[key], RINGS[key] + 0.42));
			}
		}

		gizmoGroup.visible = Boolean(gizmo);
		if (gizmo) {
			if (gizmo.space === "local") gizmoGroup.quaternion.set(...normalize(q));
			else gizmoGroup.quaternion.set(0, 0, 0, 1);
		}

		ghostPool.forEach((gh, i) => {
			const ghost = ghosts[i];
			gh.plane.visible = Boolean(ghost);
			gh.label.visible = Boolean(ghost);
			if (ghost) {
				gh.plane.quaternion.set(...normalize(ghost.q));
				setLabel(gh.label, ghost.label, "quiet");
			}
		});

		if (trails !== appliedTrails) {
			appliedTrails = trails;
			for (const kind of ["good", "bad"]) {
				const trail = trails.find((tr) => (kind === "good") === tr.good);
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
			axisNow = axis;
			setArrow(axisPlus, axis, AXIS_LENGTH);
			setPolylines(axisMinus, [[[0, 0, 0], scale3(axis, -AXIS_LENGTH)]]);
			axisTip.position.set(...scale3(axis, AXIS_LENGTH));
			axisTipPick.position.set(...scale3(axis, AXIS_LENGTH));
			axisLabel.position.set(...scale3(axis, AXIS_LENGTH + 0.3));
			// The θ ring sits around the axis; the orange sweep on it shows the
			// turn, and its arrowhead the positive direction (right-hand rule).
			const centre = scale3(axis, ARC.at);
			arcHolder.position.set(...centre);
			const from = new Vector3(0, 0, 1);
			arcHolder.quaternion.setFromUnitVectors(from, new Vector3(...axis));
			const helper = Math.abs(axis[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
			const u = normalize3(cross(axis, helper));
			const v = cross(axis, u);
			const sweep = Math.min(355, Math.max(1, axisArrow.angle % 360 || 360)) * DEG;
			const at = (s) => add3(centre, add3(scale3(u, ARC.radius * Math.cos(s)), scale3(v, ARC.radius * Math.sin(s))));
			const points = [];
			for (let i = 0; i <= 48; i++) points.push(at((i / 48) * sweep));
			setPolylines(arcSweep, [points]);
			const end = at(sweep);
			const tangent = add3(scale3(u, -Math.sin(sweep)), scale3(v, Math.cos(sweep)));
			arcHead.position.set(...end);
			setArrow(arcHead, tangent, 0.22);
			arcLabel.position.set(...add3(centre, scale3(u, ARC.radius + 0.45)));
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

		// Aligned with the 4D view: follow its camera unless we are the one
		// being orbited. Damping would keep moving after the drag ends and
		// drift the pair apart, so it is off while aligned.
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

	/* ---- picking and dragging ---- */
	const raycaster = new Raycaster();
	const pointer = new Vector2();
	let drag = null;
	let hovered = null;

	function aim(event) {
		const rect = canvas.getBoundingClientRect();
		pointer.set(
			((event.clientX - rect.left) / rect.width) * 2 - 1,
			-((event.clientY - rect.top) / rect.height) * 2 + 1,
		);
		raycaster.setFromCamera(pointer, camera);
	}

	// The raycaster tests hidden objects too, so visibility is checked here.
	const shown = (node) => {
		for (let n = node; n; n = n.parent) if (!n.visible) return false;
		return true;
	};

	function candidates() {
		const list = [];
		if (gimbal) list.push(...Object.values(ringPicks));
		if (gizmo) list.push(...Object.values(gizmoPicks));
		if (axisArrow) list.push(axisTipPick, arcPick);
		if (target) list.push(targetPick);
		if (dragObject) list.push(aircraft);
		return list;
	}

	/** The nearest draggable thing under the pointer, with where it was hit. */
	function pick(event) {
		aim(event);
		for (const hit of raycaster.intersectObjects(candidates(), true)) {
			if (!shown(hit.object)) continue;
			let node = hit.object;
			while (node && !node.userData.pick) node = node.parent;
			if (node) return { ...node.userData.pick, node, point: hit.point.toArray() };
		}
		return null;
	}

	function setHover(next) {
		if (hovered === next) return;
		if (hovered?.material?.transparent) hovered.material.opacity = 0;
		hovered = next;
		if (hovered?.material?.transparent) hovered.material.opacity = 0.28;
	}

	const size = () => ({ width: canvas.clientWidth, height: canvas.clientHeight });

	function ringInfo(hit) {
		if (hit.kind === "ring") {
			return { centre: [0, 0, 0], axis: currentRingAxes[hit.name], radius: RINGS[hit.name] };
		}
		if (hit.kind === "gizmo") {
			const local = LOCAL[hit.name];
			const axis = gizmo.space === "local" ? rotate(normalize(q), local) : local;
			return { centre: [0, 0, 0], axis, radius: GIZMO_RADIUS };
		}
		return { centre: scale3(axisNow, ARC.at), axis: axisNow, radius: ARC.radius };
	}

	function down(event) {
		if (event.button !== 0 || event.target !== canvas) return;
		const hit = pick(event);
		if (!hit) return; // OrbitControls takes it
		event.stopPropagation();
		event.preventDefault();
		drag = { ...hit, x: event.clientX, y: event.clientY };
		if (hit.kind === "ring" || hit.kind === "gizmo" || hit.kind === "angle") {
			const info = ringInfo(hit);
			drag.measure = ringDragger(camera, size(), info.centre, info.axis, info.radius, hit.point);
			if (hit.kind === "gizmo") ongizmo?.(hit.name, 0, "start");
		}
		setHover(hit.node.material?.transparent ? hit.node : null);
		controls.enabled = false;
		host.setPointerCapture(event.pointerId);
		host.style.cursor = "grabbing";
		canvas.focus({ preventScroll: true });
	}

	const plane = new Plane();
	const hitPoint = new Vector3();
	const sphere = new Sphere(new Vector3(), AXIS_LENGTH);
	const camRight = new Vector3();
	const camUp = new Vector3();

	function move(event) {
		if (!drag) {
			const hit = pick(event);
			setHover(hit?.node.material?.transparent ? hit.node : null);
			host.style.cursor = hit ? "grab" : "";
			return;
		}
		const dx = event.clientX - drag.x;
		const dy = event.clientY - drag.y;
		drag.x = event.clientX;
		drag.y = event.clientY;
		if (drag.measure) {
			const deg = drag.measure(dx, dy);
			if (drag.kind === "ring") onring?.(drag.name, deg);
			else if (drag.kind === "gizmo") ongizmo?.(drag.name, deg, "move");
			else onangle?.(deg);
			return;
		}
		if (drag.kind === "object") {
			camRight.setFromMatrixColumn(camera.matrixWorld, 0);
			camUp.setFromMatrixColumn(camera.matrixWorld, 1);
			const k = 0.011;
			onturn?.(mul(fromAxisAngle(camUp.toArray(), dx * k), fromAxisAngle(camRight.toArray(), dy * k)));
			return;
		}
		aim(event);
		if (drag.kind === "axis") {
			// Slide the tip over the sphere it lives on; off the sphere, fall
			// back to a plane facing the camera through the tip.
			if (!raycaster.ray.intersectSphere(sphere, hitPoint)) {
				plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new Vector3()), axisTip.position);
				if (!raycaster.ray.intersectPlane(plane, hitPoint)) return;
			}
			const axis = normalize3(hitPoint.toArray());
			if (axis) onaxis?.(axis);
			return;
		}
		// target
		plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new Vector3()), targetDot.position);
		if (raycaster.ray.intersectPlane(plane, hitPoint)) {
			ontarget?.(hitPoint.toArray().map((c) => Math.max(-4.5, Math.min(4.5, c))));
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
	host.addEventListener("pointerleave", () => !drag && setHover(null));
	const keys = (event) => onkeydown?.(event);
	canvas.addEventListener("keydown", keys);

	/* ---- orbiting, reported when aligned ---- */
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
		cornerCamera.position.copy(camera.position).sub(controls.target).setLength(3.4);
		cornerCamera.up.copy(camera.up);
		cornerCamera.lookAt(0, 0, 0);

		renderer.setScissorTest(false);
		renderer.setViewport(0, 0, width, height);
		renderer.render(scene, camera);
		labelRenderer.render(scene, camera);

		renderer.setScissorTest(true);
		renderer.setScissor(8, 8, GIZMO, GIZMO);
		renderer.setViewport(8, 8, GIZMO, GIZMO);
		renderer.render(cornerScene, cornerCamera);
		renderer.setScissorTest(false);
		gizmoLabels.render(cornerScene, cornerCamera);

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
		disposeTree(cornerScene);
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
		/* Clear of the corner gizmo's own labels, which can sit above its box. */
		bottom: calc(96px + 24px);
		font-size: 0.72rem;
		color: var(--text-secondary);
		background: var(--glass-bg);
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
		color: var(--text-primary);
	}
</style>
