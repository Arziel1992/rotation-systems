/**
 * three.js building blocks shared by the two views. Rendering only: nothing
 * here decides an orientation, it draws the one it is given.
 *
 * Arrows, rings and lines use unlit materials so their colour on screen is the
 * colour in app.css - which is what the contrast check measured. A lit
 * material would shade an axis arrow below 3:1 on its dark side.
 */

import {
	BoxGeometry,
	ConeGeometry,
	CylinderGeometry,
	Group,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	SphereGeometry,
	TorusGeometry,
	Vector3,
} from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

const Y_AXIS = new Vector3(0, 1, 0);

/**
 * The palette, read from the CSS tokens so the views follow the theme.
 *
 * A token read by name from JavaScript has no compiler behind it: when the
 * restyle renamed --muted, this returned "" and three.js quietly kept its
 * default WHITE for a dozen lines, invisible on the light theme (MISTAKES.md,
 * 2026-09-21). So an empty token is reported as an error, not tolerated.
 */
export function readColours(element) {
	const style = getComputedStyle(element);
	const get = (name) => style.getPropertyValue(`--${name}`).trim();
	const colours = readTokens(get);
	const missing = Object.entries(colours).filter(([, value]) => !value);
	if (missing.length) {
		console.error(
			`readColours: no CSS value for ${missing.map(([key]) => key).join(", ")}`,
		);
	}
	return colours;
}

function readTokens(get) {
	return {
		view: get("view-bg"),
		x: get("axis-x"),
		y: get("axis-y"),
		z: get("axis-z"),
		object: get("object"),
		nose: get("object-nose"),
		fin: get("object-fin"),
		grid: get("grid"),
		target: get("target"),
		ghost: get("ghost"),
		good: get("good"),
		bad: get("bad"),
		muted: get("text-secondary"),
		lattice: get("control-border"),
	};
}

/** Colour name for a signed axis letter such as "−Z". */
export const letterColour = (letter) => letter.slice(-1).toLowerCase();

/**
 * A small aircraft: the shape says which way is forward (the nose cone), which
 * way is up (the tail fin) and which way is across (the wings), so an
 * orientation can be read without any labels at all. Nose along -Z.
 */
export function makeAircraft({ ghost = false } = {}) {
	const make = () =>
		ghost
			? new MeshBasicMaterial({
					wireframe: true,
					transparent: true,
					opacity: 0.45,
				})
			: new MeshStandardMaterial({
					flatShading: true,
					roughness: 0.55,
					metalness: 0.05,
				});
	const body = make();
	const nose = make();
	const fin = make();

	const group = new Group();
	const fuselage = new Mesh(new CylinderGeometry(0.13, 0.08, 1.3, 12), body);
	fuselage.rotation.x = -Math.PI / 2;
	const cone = new Mesh(new ConeGeometry(0.13, 0.42, 12), nose);
	cone.rotation.x = -Math.PI / 2;
	cone.position.z = -0.86;
	const wings = new Mesh(new BoxGeometry(1.8, 0.04, 0.38), body);
	wings.position.z = -0.05;
	const tailplane = new Mesh(new BoxGeometry(0.66, 0.03, 0.2), body);
	tailplane.position.z = 0.55;
	const tailFin = new Mesh(new BoxGeometry(0.03, 0.36, 0.26), fin);
	tailFin.position.set(0, 0.19, 0.55);
	group.add(fuselage, cone, wings, tailplane, tailFin);
	group.userData.materials = { body, nose, fin };
	return group;
}

export function colourAircraft(aircraft, c, ghost = false) {
	const { body, nose, fin } = aircraft.userData.materials;
	if (ghost) {
		for (const m of [body, nose, fin]) m.color.set(c.ghost);
		return;
	}
	body.color.set(c.object);
	nose.color.set(c.nose);
	fin.color.set(c.fin);
}

/** An arrow from the origin: a cylinder and a cone, thick enough to see. */
export function makeArrow(radius = 0.022) {
	const material = new MeshBasicMaterial();
	const shaft = new Mesh(new CylinderGeometry(radius, radius, 1, 10), material);
	const head = new Mesh(new ConeGeometry(radius * 3.2, 1, 14), material);
	const group = new Group();
	group.add(shaft, head);
	group.userData = { shaft, head, material };
	return group;
}

/** Point an arrow along `dir` (display frame) with total `length`. */
export function setArrow(arrow, dir, length) {
	const d = new Vector3(dir[0], dir[1], dir[2]);
	if (d.lengthSq() < 1e-12 || length < 1e-6) {
		arrow.visible = false;
		return;
	}
	arrow.visible = true;
	arrow.quaternion.setFromUnitVectors(Y_AXIS, d.normalize());
	const headLength = Math.min(0.2, length * 0.3);
	const { shaft, head } = arrow.userData;
	shaft.scale.y = length - headLength;
	shaft.position.y = (length - headLength) / 2;
	head.scale.y = headLength;
	head.position.y = length - headLength / 2;
}

/** A ring in the plane perpendicular to +Z (rotate the group to place it). */
export function makeRing(radius, tube = 0.02) {
	return new Mesh(
		new TorusGeometry(radius, tube, 8, 120),
		new MeshBasicMaterial(),
	);
}

/**
 * An invisible, fat twin of a ring, so a 2 px ring can be grabbed without
 * pixel hunting. Shown faintly on hover. `pick` says what it is for.
 */
export function makePickRing(radius, pick) {
	const ring = new Mesh(
		new TorusGeometry(radius, 0.11, 8, 72),
		new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
	);
	ring.userData.pick = pick;
	return ring;
}

/**
 * Turn a pointer drag into degrees of rotation about a ring's axis.
 *
 * At the grab point, the ring's positive direction (right-hand rule about
 * `axis`) is projected to the screen; dragging along it turns positive, and
 * a drag the length of the ring's on-screen radius is one radian. Unlike
 * intersecting a plane, this still works when the ring is seen edge-on.
 * Returns (dx, dy) => degrees, both in screen pixels.
 */
export function ringDragger(camera, size, centre, axis, radius, hit) {
	const c = new Vector3(...centre);
	const a = new Vector3(...axis).normalize();
	const h = new Vector3(...hit).sub(c);
	h.addScaledVector(a, -h.dot(a));
	if (h.lengthSq() < 1e-9) h.set(1, 0, 0).cross(a);
	const grab = c.clone().addScaledVector(h.normalize(), radius);
	const tangent = a.clone().cross(h).normalize();
	const px = (v) => {
		const p = v.clone().project(camera);
		return [((p.x + 1) / 2) * size.width, ((1 - p.y) / 2) * size.height];
	};
	const g = px(grab);
	const ahead = px(grab.clone().addScaledVector(tangent, 0.25));
	const mid = px(c);
	let tx = ahead[0] - g[0];
	let ty = ahead[1] - g[1];
	const tl = Math.hypot(tx, ty) || 1;
	tx /= tl;
	ty /= tl;
	const onScreen = Math.max(30, Math.hypot(g[0] - mid[0], g[1] - mid[1]));
	return (dx, dy) => ((dx * tx + dy * ty) / onScreen) * (180 / Math.PI);
}

export function makeDot(radius = 0.07, lit = false) {
	return new Mesh(
		new SphereGeometry(radius, 20, 14),
		lit
			? new MeshStandardMaterial({ roughness: 0.4 })
			: new MeshBasicMaterial(),
	);
}

/** Fat lines: WebGL draws every ordinary line 1px wide, too thin to follow. */
export function makeLines(width = 3, dashed = false) {
	const material = new LineMaterial({
		linewidth: width,
		dashed,
		dashSize: 0.14,
		gapSize: 0.09,
	});
	const lines = new LineSegments2(new LineSegmentsGeometry(), material);
	lines.visible = false;
	return lines;
}

/**
 * Replace a line's content with polylines (arrays of [x, y, z]). A null point
 * breaks the line, which is how a path through infinity is drawn.
 */
export function setPolylines(lines, polylines) {
	const positions = [];
	for (const points of polylines) {
		for (let i = 1; i < points.length; i++) {
			if (points[i - 1] && points[i])
				positions.push(...points[i - 1], ...points[i]);
		}
	}
	lines.geometry.dispose();
	lines.visible = positions.length > 0;
	if (!lines.visible) return;
	lines.geometry.setPositions(positions);
	if (lines.material.dashed) lines.computeLineDistances();
}

export function makeLabel(className = "") {
	const element = document.createElement("div");
	element.className = `label3d ${className}`;
	return new CSS2DObject(element);
}

export function setLabel(label, text, className) {
	if (label.element.textContent !== text) label.element.textContent = text;
	if (className !== undefined) {
		const next = `label3d ${className}`;
		if (label.element.className !== next) label.element.className = next;
	}
}

/**
 * The field of view is vertical, so a narrow view crops the sides: back the
 * camera off in proportion, keeping whatever direction the learner orbited
 * to. `wide` is the aspect ratio at which `distance` already frames the scene.
 */
export function fitCamera(camera, controls, distance, wide) {
	const fit = Math.max(1, wide / camera.aspect);
	const offset = camera.position.clone().sub(controls.target);
	camera.position.copy(controls.target).add(offset.setLength(distance * fit));
}

/** Free every geometry and material under an object. */
export function disposeTree(root) {
	root.traverse((node) => {
		node.geometry?.dispose();
		const m = node.material;
		if (Array.isArray(m)) for (const x of m) x.dispose();
		else m?.dispose();
	});
}
