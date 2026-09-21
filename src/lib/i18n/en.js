/**
 * English — the baseline locale, and the one every other falls back to.
 * It must stay complete: a key missing here has nothing behind it.
 *
 * Australian English, matching the units this tool serves. Not translated
 * anywhere: "E. Ketterer", unit codes, the version, mathematical notation,
 * code identifiers, and the code samples (code.js).
 *
 * Engine behaviour stated here was checked against each vendor's own
 * documentation or source on 2026-09-21 (see the tool's CHANGELOG.md).
 */
export default {
	documentTitle: "Rotation Systems",
	documentDescription:
		"Turn a 3D object with Euler angles, quaternions, a basis or look-at, and watch the same orientation written live in GDScript, Unity C# and Unreal C++ - including where each method breaks.",

	/* Shell */
	title: "Rotation Systems",
	tagline: "Euler angles, quaternions, bases and look-at, in three engines",
	skipToContent: "Skip to content",
	stageLabel: "The 3D view and the code",
	hideTheory: "Hide the textbook",
	showTheory: "Show the textbook",
	hideControls: "Hide the controls",
	showControls: "Show the controls",
	toolbarLabel: "Tool settings",
	manualButton: "Manual",
	languageLabel: "Language",
	themeToggle: "Dark theme",
	"tab.euler": "Euler angles",
	"tab.quat": "Quaternion",
	"tab.basis": "Basis / matrix",
	"tab.lookat": "Look-at",
	"tabSub.euler": "Three turns, in order",
	"tabSub.quat": "One turn about one axis",
	"tabSub.basis": "Three arrows",
	"tabSub.lookat": "Face a target",
	methodChosen: "{method} selected.",
	footerMadeWith: "Made with ❤️ for Swinburne",
	footerSubject: "3D Rotation",
	versionTitle: "Version: the date and time of this release",
	resetDone: "Reset.",
	"kbHint.euler":
		"Drag the aircraft or a ring · arrows and Q/E turn it · 1–4 method · G glossary",
	"kbHint.quat":
		"Drag the aircraft, the axis tip or the θ ring · arrows and Q/E turn it · 1–4 method · G glossary",
	"kbHint.basis":
		"Drag the aircraft or a gizmo ring · arrows and Q/E turn it · 1–4 method · G glossary",
	"kbHint.lookat":
		"Drag the target · arrows and Page Up/Down move it · 1–4 method · G glossary",

	/* Views */
	"viewLabel.aircraft":
		"3D view of the aircraft: yaw {yaw}°, pitch {pitch}°, roll {roll}°",
	"viewLabel.capybara":
		"3D view of a capybara: yaw {yaw}°, pitch {pitch}°, roll {roll}°",
	"objectTitle.aircraft": "The aircraft",
	"objectTitle.capybara": "The capybara",
	capybaraFound:
		"A capybara has taken the aircraft's place for this visit. Its nose points forward and the orange on its head points up; everything else works the same.",
	repository: "Repository",
	modelCredit: "3D model",
	hyperTitle: "q on the hypersphere (4D)",
	hyperLabel:
		"Stereographic projection of the unit quaternion q, in the scene's directions: no turn at the centre, every 180° turn on the unit sphere",
	hyperHint:
		"Drag q to turn the aircraft · centre = no turn · sphere = 180° · infinity = 360°",
	hyperSphere: "w = 0 · every 180° turn",
	hyperIdentity: "1 · no turn",
	hyperMinus: "−q · same orientation",
	alignViews: "Align the views",
	alignHint:
		"Orbit either view and the other follows, so q's point lines up with the turn's axis.",
	alignOn: "The two views are aligned.",
	alignOff: "The two views move independently.",
	noWebgl:
		"This browser cannot draw in 3D (WebGL is unavailable). The code and the read-out still work.",
	worldAxes: "World axes",
	axisForward: "forward",
	axisRight: "right",
	axisUp: "up",
	axisBack: "back",
	axisDiagonal: "Diagonal",
	axis: "Axis",
	angle: "Angle θ",
	yaw: "Yaw",
	pitch: "Pitch",
	roll: "Roll",
	target: "Target",
	trailLong: "✗ long way",
	trailShort: "✓ short way",
	trailSlerp: "✓ slerp",
	ghostShort: "short way",
	rayWorld: "world constant",
	rayOwn: "own forward",
	lookDegenerate: "The target is straight above: look-at is undefined here.",
	lookFlipped:
		"The aircraft flipped 180 degrees as the target passed overhead.",

	/* Code panel */
	codeHeading: "The same pose in code",
	hideCode: "Hide code",
	showCode: "Show code",
	resizeCode: "Resize the code panel",
	codeSizeValue: "{n}% of the window height",
	enginesLabel: "Engine",
	"engine.godot": "Godot · GDScript",
	"engine.unity": "Unity · C#",
	"engine.unreal": "Unreal · C++",
	"engineShort.godot": "Godot",
	"engineShort.unity": "Unity",
	"engineShort.unreal": "Unreal",
	codeRegion: "{engine} code sample",
	copy: "Copy",
	copied: "Code copied to the clipboard.",
	copyFailed: "Could not copy. Select the code and copy it by hand.",
	scrubLegend: "drag up or down, or focus and use the arrow keys;",
	liveLegend: "follows the pose on screen.",
	"scrub.e": "Euler number {n}",
	"scrub.ax": "Axis component {n}",
	"scrub.ang": "Angle",
	"scrub.tg": "Target component {n}",
	"scrub.rate": "Turn rate",
	"scrub.t": "Fraction t",
	"scrub.tu": "Turn number {n}",

	/* Controls */
	glossaryFor: "Glossary: {topic}",
	methodsHeading: "Rotation method",
	"controls.euler": "Euler angles",
	"controls.quat": "Axis and angle",
	"controls.basis": "Turn the object",
	"controls.lookat": "The target",
	yawHint: "+ turns the nose right",
	pitchHint: "+ lifts the nose",
	rollHint: "+ drops the right wing",
	clampPitch: "Clamp pitch to ±89°",
	clampPitchHint: "The one-line defence against gimbal lock.",
	showRings: "Show the gimbal rings",
	showRingsHint:
		"One ring per angle; drag a ring to turn it. Colours follow the engine's X, Y and Z.",
	showAxes: "Show the object's own axes",
	axisPresets: "Axis",
	angleHint:
		"At 360° the aircraft is back where it started but the numbers are not; at 720° both are.",
	formulaLabel: "The quaternion built from the axis and angle",
	formulaHint: "Components in {engine}'s own axes.",
	slerpHeading: "Slerp",
	slerpHint:
		"Turn the aircraft and set it as A; turn it again and set it as B.",
	setA: "Set A to this pose",
	setB: "Set B to this pose",
	setAdone: "A set to the current pose.",
	setBdone: "B set to the current pose.",
	spaceLegend: "Turn about",
	spaceLocal: "its own axes (local)",
	spaceWorld: "the world's axes",
	turnsLabel: "Turn by 15°",
	turnPitchUp: "Pitch up",
	turnPitchDown: "Pitch down",
	turnYawLeft: "Turn left",
	turnYawRight: "Turn right",
	turnRollLeft: "Bank left",
	turnRollRight: "Bank right",
	turnsHint:
		"Each press adds one 15° turn. The code shows the last turn as three angles; drag any of them to reshape it.",
	showGizmo: "Show the rotation gizmo",
	showGizmoHint:
		"Drag a ring to turn about that axis, in the space chosen above.",
	targetRight: "Target: right",
	targetUp: "Target: up",
	targetForward: "Target: forward",
	smooth: "Turn smoothly",
	smoothHint:
		"Ease towards the target a little each frame instead of snapping.",
	turnRate: "Turn rate",
	turnRateHint:
		"How much of the remaining turn to close per second: higher is snappier.",
	clampElevation: "Keep the target below 89°",
	clampElevationHint: "The look-at twin of clamping pitch.",
	reset: "Reset this method",
	breakHeading: "Break it",
	breakIntro:
		"Each card shows a failure you will meet in a real project, and its fix.",
	playerLabel: "Scenario playback",
	play: "Play",
	pause: "Pause",
	resume: "Resume",
	replay: "Replay",
	stop: "Stop",
	progressLabel: "Scenario progress",
	scenarioStopped: "Scenario stopped.",
	qLength: "Length |q|",
	qLengthHint:
		"Exactly 1 is a rotation. Anything else also scales, by the square.",
	orthonormalize: "Orthonormalise every frame",
	orthonormalizeHint:
		"Godot: orthonormalized(). Unity and Unreal: renormalise the quaternion.",
	driftHalted:
		"Drift stopped: the basis is badly skewed. Tick orthonormalise to see the fix, or press Stop to straighten it.",
	fireAlong: "Fire along",

	/* Break it, and explore */
	"break.gimbal.title": "Gimbal lock",
	"break.gimbal.body":
		"Pitch to 90° with no clamp, then move yaw and roll: both spin the aircraft about the same vertical axis.",
	"break.gimbal.action": "Show gimbal lock",
	"break.gimbal.fix":
		"Clamp pitch to ±89°, or put yaw and pitch on different objects.",
	"break.gimbal.started":
		"Pitching the nose up to 90 degrees, with the clamp off.",
	"break.gimbal.phase0": "Pitching up.",
	"break.gimbal.phase1": "Pitch is 90 degrees. Now moving yaw.",
	"break.gimbal.phase2": "Now moving roll: the same motion as yaw.",
	"break.gimbal.done": "Gimbal lock shown. Turn the clamp on to prevent it.",

	"break.longway.title": "The long way round",
	"break.longway.body":
		"Interpolating the number from 350° to 10° sweeps 340°, although the two poses are only 20° apart.",
	"break.longway.action": "Lerp 350° → 10°",
	"break.longway.fix":
		"Interpolate orientations with Slerp, or use LerpAngle for a single angle.",
	"break.longway.started": "Interpolating the yaw number from 350 to 10.",
	"break.longway.done":
		"The number took the long way. The ghost took the short way.",

	"break.fullpath.title": "Slerp without the shortest-path check",
	"break.fullpath.body":
		"B is flipped to −B: the same orientation, opposite numbers. A slerp that skips the sign check follows the numbers the long way round.",
	"break.fullpath.action": "Slerp A → −B",
	"break.fullpath.fix":
		"Flip b when dot(a, b) < 0. Godot's slerp, Unreal's Slerp and Unity's Slerp all take the short way.",
	"break.fullpath.started": "Slerping to minus B without the sign check.",
	"break.fullpath.done":
		"That was the long way round. The ghost shows the short way.",

	"break.negate.title": "q and −q",
	"break.negate.body":
		"Every component changes sign, and the aircraft does not move. In the 4D view the point jumps to the other side of the sphere.",
	"break.negate.action": "Negate q",
	"break.negate.fix":
		"Compare orientations with the absolute dot product (Unity's Angle does), never with ==.",
	"break.negate.started":
		"Every component of q negated. The aircraft has not moved.",

	"break.unnormalised.title": "Forget to normalise",
	"break.unnormalised.body":
		"A quaternion whose length is not 1 is not a rotation. The raw maths (q·v·q*) scales the object by |q|²; Godot's Basis quietly divides it out, but its q * v and slerp report an error in debug builds.",
	"break.unnormalised.action": "Scale q",
	"break.unnormalised.fix":
		"Normalise it: q.normalized(), q.normalized or Q.Normalize().",
	"break.unnormalised.started":
		"q is no longer length 1. Drag the length slider.",

	"break.drift.title": "Drift",
	"break.drift.body":
		"Spin a basis frame after frame and rounding error piles up. It is exaggerated here so it shows in seconds rather than minutes: the arrows shear and stretch.",
	"break.drift.action": "Start spinning",
	"break.drift.fix":
		"Orthonormalise the basis, or renormalise the quaternion, every frame.",
	"break.drift.started": "Spinning, with the rounding error exaggerated.",

	"break.worldconst.title": "A world constant for forward",
	"break.worldconst.body":
		"Vector3.forward and its twins never change. Fire along one and the shot ignores how the aircraft is turned.",
	"break.worldconst.action": "Compare the two",
	"break.worldconst.fix":
		"Ask the object: transform.forward, −basis.z or GetActorForwardVector().",
	"break.worldconst.started":
		"Two arrows: the world constant, and the aircraft's own forward.",

	"break.overhead.title": "Target straight overhead",
	"break.overhead.body":
		"As the target passes over the top, the look direction lines up with the up hint. Look-at has no good answer there, and the aircraft swings round 180°.",
	"break.overhead.action": "Pass the target overhead",
	"break.overhead.fix":
		"Keep the target below 89°, pass a different up hint near the pole, or turn smoothly.",
	"break.overhead.started": "Moving the target up and over the aircraft.",
	"break.overhead.done": "The target has passed overhead.",

	"break.slerp.title": "Slerp from A to B",
	"break.slerp.body":
		"Turn from A to B along the shortest arc, at a steady rate. In the 4D view the path is an arc of a great circle.",
	"break.slerp.action": "Play A → B",
	"break.slerp.started": "Slerping from A to B.",
	"break.slerp.done": "Arrived at B.",

	"break.apply.title": "Apply q gradually",
	"break.apply.body":
		"Watch q^s as s goes from 0 to 1. The aircraft turns from no rotation to q, and in the 4D view multiplying by q carries the whole hypersphere along.",
	"break.apply.action": "Apply q",
	"break.apply.started": "Applying q a little at a time.",
	"break.apply.done": "q fully applied.",

	/* Read-out */
	readoutHeading: "Live read-out",
	readoutIntro: "The same orientation, four ways, as {engine} reports it.",
	readEuler: "Euler, read back",
	readQuat: "Quaternion",
	matrixCaption:
		"The rotation matrix in {engine}. Each column is where that axis ends up.",
	healthLengths: "Column lengths (should be 1)",
	healthCorners: "Angles between columns (should be 90°)",
	freedom: "Angle between yaw and roll axes",
	freedomLocked: "Gimbal lock: two controls, one motion",
	freedomHint: "90° in level flight; it closes as |pitch| rises.",
	qNorm: "Length |q|",
	qNotUnit: "Not a rotation: its length is not 1.",
	upAngle: "Look direction to up hint",
	degenerateNow: "Undefined: straight up",
	distance: "Distance to the target",
	readoutScenario: "The values follow the scenario while it plays.",

	/* Theory */
	intro:
		"A game can store which way something faces as three angles (Euler), as four numbers (a quaternion) or as three arrows (a basis); look-at builds one from a direction. Pick a method on the right and turn the aircraft: the code underneath writes the pose in Godot, Unity and Unreal as you go, and the Break it cards show where each method fails.",
	textbookHeading: "The textbook: {method}",
	"formula.euler.yaw":
		"a turn about the world's up axis; + turns the nose right",
	"formula.euler.pitch": "a turn about the new right axis; + lifts the nose",
	"formula.euler.roll":
		"a turn about the new forward axis; + drops the right wing",
	"formula.euler.order":
		"read right to left about fixed axes, or left to right about the object's own: yaw first, either way",
	"formula.quat.axis": "the unit axis of the turn",
	"formula.quat.theta": "the angle of the turn",
	"formula.quat.w":
		"cos(θ/2): 1 for no turn, 0 for a half turn, −1 for a full turn",
	"formula.quat.unit": "a rotation always has length 1",
	"formula.quat.p":
		"where q is drawn in the 4D view: the centre is no turn, the unit sphere every 180° turn",
	"formula.basis.columns":
		"where the engine's X, Y and Z axes end up: the object's own axes",
	"formula.basis.orthonormal":
		"a pure rotation when every column has length 1 and every pair meets at 90°",
	"formula.lookat.forward": "the direction to face",
	"formula.lookat.hint":
		"the up hint: it settles the roll, and must not be parallel to forward",
	"formula.lookat.cross": "the cross product: a vector at right angles to both",

	"theory.e1.title": "Three numbers, applied in order",
	"theory.e1.body":
		"All three engines apply yaw first, then pitch about the new right axis, then roll about the new forward axis. They name and sign the angles differently, though: Unity types nose-up as a negative x, Godot types turn-right as a negative y, and Unreal names them Pitch, Yaw and Roll. Same pose, three sets of numbers.",
	"theory.e2.title": "Gimbal lock",
	"theory.e2.body":
		"Pitch the nose to 90° and the roll ring lies flat on the yaw ring: yaw and roll now turn about the same axis, and one of your three controls is gone. It is not an engine bug and no engine can fix it; it is what storing three turns in sequence means.",
	"theory.e3.title": "The two defences",
	"theory.e3.body":
		"Clamp pitch to about ±89°: one line, and the standard fix for a first-person camera. Better still, put yaw and pitch on different objects: yaw the body, and pitch a camera that is its child.",
	"theory.e4.title": "Reading back is not writing",
	"theory.e4.body":
		"Many triples describe the same orientation, and the engine gives you back its own choice. Turn the clamp off, push pitch past 90° and look at the read-out: a different triple, the same pose. That is why adding to rotation.y every frame drifts.",

	"theory.q1.title": "Four numbers, no sequence",
	"theory.q1.body":
		"A quaternion stores one turn about one axis. There is no order of operations to get wrong, so there is nothing to lock. The cost is that you cannot read one at a glance, which is why every editor still shows you degrees.",
	"theory.q2.title": "Why half the angle",
	"theory.q2.body":
		"Because of the halves, a 360° turn does not bring the numbers back: w goes from 1 to −1. Drag the angle to 360° and watch the aircraft return while the numbers do not. Only at 720° do both agree again.",
	"theory.q3.title": "q and −q are the same orientation",
	"theory.q3.body":
		"Change every sign and the object does not move. Compare orientations, not numbers: Unity's Quaternion.Angle uses the absolute dot product and treats q and −q as the same, while == in Unity and Unreal does not.",
	"theory.q4.title": "Slerp: the shortest arc",
	"theory.q4.body":
		"Spherical interpolation turns from A to B at a steady rate along the shortest path. Skip its sign check, as Godot's slerpni and Unreal's SlerpFullPath do, and when A and B sit in opposite halves the turn goes the long way round.",
	"theory.q5.title": "The hypersphere, projected",
	"theory.q5.body":
		"Every unit quaternion is a point on a sphere in four dimensions. The right-hand view flattens it into three, as a map flattens the globe: no turn is the centre, every 180° turn lies on the unit sphere, and a 360° turn lies at infinity. Drag q there and the aircraft turns.",
	"theory.q6.title": "Multiplying moves everything",
	"theory.q6.body":
		"Apply q gradually shows what multiplying by q does to the whole hypersphere: the centre travels to q, and the coloured reference circles are carried along. You do not need this arithmetic to use quaternions; it is here for when you want to know why they work.",

	"theory.b1.title": "Three arrows are the rotation",
	"theory.b1.body":
		"A basis is the object's own right, up and forward vectors, each of length 1 and at right angles to the others. Written as columns, they are the rotation matrix. Godot stores one as a Basis; Unity and Unreal build it from a quaternion and hand you the vectors.",
	"theory.b2.title": "Ask the object, not the world",
	"theory.b2.body":
		"Forward is a question you ask the object every frame, not a constant. Vector3.forward, Vector3.FORWARD and FVector::ForwardVector never change, however the object turns. Godot's forward is −basis.z: forget the minus sign and your character walks backwards.",
	"theory.b3.title": "Local or world",
	"theory.b3.body":
		"Once the object is already turned, a turn about its own axis and the same turn about the world's axis give different results. Drag the gizmo rings in both modes: a local turn follows the object, a world turn does not.",
	"theory.b4.title": "Drift",
	"theory.b4.body":
		"Rounding error builds up when you keep multiplying into a stored rotation, until the arrows are no longer length 1 or at right angles and the object shears or shrinks. Orthonormalising the basis, or renormalising the quaternion, resets it. It is cheap, so do it.",

	"theory.l1.title": "Build it from a direction",
	"theory.l1.body":
		"If you know where something should face, ask the engine to build the orientation from that direction rather than working out three angles yourself. It is less code, and it is right in every case the angles get wrong.",
	"theory.l2.title": "The up hint",
	"theory.l2.body":
		"A direction fixes where the nose points, but not how the wings sit around it. The up hint settles that: of every way to face the target, take the one whose up is closest to it.",
	"theory.l3.title": "Straight up",
	"theory.l3.body":
		"With the target directly above, the direction is parallel to the up hint and no roll is best. Godot's look_at() prints a warning and picks an arbitrary one, Unity's LookRotation falls back to a rotation from +Z, and Unreal's FindLookAtRotation swaps its reference axis so the yaw jumps. Keep the target below about 89°.",
	"theory.l4.title": "Turning smoothly",
	"theory.l4.body":
		"Setting the orientation at once snaps. Closing a fraction of the gap each frame (Slerp, basis.slerp, RInterpTo) turns smoothly, and turns a sudden flip into a quick sweep.",

	inEngines: "In your engine",
	"engineNote.euler.godot":
		"rotation is in radians; rotation_degrees is what the Inspector shows. The default order is YXZ, and Godot's 3D transforms guide advises against composing all three angles in gameplay code.",
	"engineNote.euler.unity":
		"Quaternion.Euler applies z, then x, then y; transform.eulerAngles reads back from 0° to 360°. +x pitches the nose down.",
	"engineNote.euler.unreal":
		"FRotator(Pitch, Yaw, Roll) names its angles: +Pitch is nose up, +Yaw turns right, +Roll is clockwise looking forward. GetActorRotation reads back from −180° to 180°.",
	"engineNote.quat.godot":
		"Quaternion(axis, angle) takes radians and a normalised axis. slerp takes the short way; slerpni does not. q * v reports an error in debug builds if q is not normalised.",
	"engineNote.quat.unity":
		"Quaternion.AngleAxis takes degrees. Slerp takes the short way. == compares the dot product with 1, so q == −q is false, while Quaternion.Angle(q, −q) is 0.",
	"engineNote.quat.unreal":
		"FQuat(Axis, AngleRad) takes radians. Slerp corrects the alignment first; SlerpFullPath does not. == compares components exactly, and | is the dot product.",
	"engineNote.basis.godot":
		"transform.basis.x, .y and .z are the node's axes; forward is −basis.z. rotate_object_local and global_rotate turn it about one axis; multiplying by Basis.from_euler turns it by all three at once, on the right for its own axes and on the left for the world's. orthonormalized() cleans up drift.",
	"engineNote.basis.unity":
		"transform.right, up and forward are the object's axes. Rotate(x, y, z, Space.Self or Space.World) turns it, with the three angles typed as in Quaternion.Euler, and Matrix4x4.Rotate gives the matrix.",
	"engineNote.basis.unreal":
		"GetActorForwardVector, GetActorRightVector and GetActorUpVector are the Actor's X, Y and Z. AddActorLocalRotation and AddActorWorldRotation turn it.",
	"engineNote.lookat.godot":
		"look_at(target, up) points −Z at the target. A zero direction is an error; an up hint parallel to the direction prints a warning and picks an arbitrary roll.",
	"engineNote.lookat.unity":
		"Quaternion.LookRotation(forward, up). A zero forward logs an error and returns the identity; a forward colinear with up falls back to FromToRotation(+Z, forward).",
	"engineNote.lookat.unreal":
		"UKismetMathLibrary::FindLookAtRotation builds from the direction alone (MakeFromX), so it never rolls; near vertical its reference axis swaps and the yaw jumps. RInterpTo turns smoothly.",

	rulesTitle: "Four rules that avoid most rotation bugs",
	rule1: "Set an orientation from a direction, not from angles.",
	rule2:
		"Never add to Euler angles frame after frame. Keep your own angles and set the rotation from them.",
	rule3: "Clamp pitch before it reaches 90°.",
	rule4: "Put yaw and pitch on different objects.",

	tableTitle: "Three engines, three conventions",
	selectedEngine: "(the engine selected in the code panel)",
	rowUp: "Up",
	rowForward: "Forward",
	rowHanded: "Handedness",
	rowUnit: "One unit",
	rowEuler: "Euler, as typed",
	rowOrder: "Euler order",
	rowStored: "Stored as",
	handedRight: "Right",
	handedLeft: "Left",
	unitMetre: "1 metre",
	unitCentimetre: "1 centimetre",
	orderGodot: "YXZ",
	orderUnity: "z, then x, then y",
	orderUnreal: "Yaw, then Pitch, then Roll",

	refsTitle: "References",
	refEater:
		"Ben Eater and Grant Sanderson's interactive quaternion explorer, which this tool's 4D view follows.",
	ref3b1b: "Quaternions and 3D rotation, explained interactively (video).",
	refUnity: "Quaternion and Euler rotations.",
	refGodot: "Using 3D transforms.",
	refUnreal: "Coordinate system and spaces.",

	/* Manual and glossary */
	glossaryTitle: "Manual and glossary",
	closeGlossary: "Close",
	glossaryFooter:
		"Every engine behaviour described here was checked against that engine's documentation or source on 21 September 2026.",
	glossGroupUse: "Using the tool",
	glossGroupEuler: "Euler angles",
	glossGroupQuat: "Quaternions",
	glossGroupBasis: "Basis",
	glossGroupLook: "Look-at",
	glossGroupEngines: "Across engines",

	"gloss.manual.title": "How to use this tool",
	"gloss.manual.body":
		"Pick a method on the right: Euler angles, quaternion, basis or look-at. Each one turns the same aircraft its own way, and the code under the view writes that pose in Godot, Unity or Unreal; choose the engine with the tabs above the code.\nYou can turn the aircraft almost anywhere: drag it, drag the coloured rings, drag the tip of the quaternion's axis, drag q in the 4D view, or drag the numbers in the code up and down. The sliders on the right do the same, and the read-out below them shows the result four ways at once.\nThe textbook on the left explains the method in use, and the Break it cards show how each method fails when nothing guards its limits, and the fix. Both side panels fold away with the tabs on the edges of the view.",
	"gloss.keys.title": "Keyboard and mouse",
	"gloss.keys.body":
		"1–4 choose a method, and G opens this glossary. With the 3D view focused (click it, or Tab to it), the arrow keys turn the aircraft and Q and E roll it; hold Shift for bigger steps. In look-at the arrow keys and Page Up / Page Down move the target instead.\nDrag the aircraft to turn it, drag a ring to turn about that ring's axis, and drag empty space to orbit the camera; scroll to zoom.\nIn the code, a highlighted number with a dotted underline is a slider: drag it up or down, or Tab to it and use the arrow keys (Shift for ten times the step).",
	"gloss.code-panel.title": "The code panel",
	"gloss.code-panel.body":
		"The code writes the pose on screen in the engine you pick. Highlighted numbers come from the pose and change as you turn it; those with a dotted underline can be dragged too, and dragging one moves the aircraft exactly as changing that number in the engine would. Numbers inside comments are explanation, not code, and are shown as comments.\nThe same pose is typed differently in each engine, because the engines disagree about axes, handedness and signs. Showing that difference is one of the things this tool is for.",
	"gloss.break-it.title": "The Break it cards",
	"gloss.break-it.body":
		"Each card sets up a failure you will meet in a real project, shows it, and then names the fix. Scenarios that play over time can be paused and scrubbed with their slider; if your system asks for reduced motion, they wait for you to scrub instead of playing by themselves. Stop puts the aircraft back.",
	"gloss.methods.title": "Four ways to set an orientation",
	"gloss.methods.body":
		"Euler angles store three turns applied in order. A quaternion stores one turn about one axis, as four numbers. A basis stores the object's own three axes, which is the rotation matrix. Look-at stores nothing new: it builds an orientation from a direction. Games use all four, usually with quaternions underneath and Euler angles in the editor.",
	"gloss.euler.title": "Euler angles",
	"gloss.euler.body":
		"Three angles, applied one after another about three axes. They are easy to read and type, which is why every inspector shows them; but the order matters, one orientation has many triples, and at 90° of pitch two of the turns collapse into one (gimbal lock).",
	"gloss.yaw-pitch-roll.title": "Yaw, pitch and roll",
	"gloss.yaw-pitch-roll.body":
		"Names for the three turns, taken from aircraft. Yaw turns the nose left or right about the vertical axis, pitch lifts or dips it about the side-to-side axis, and roll banks the wings about the nose-to-tail axis. In this tool + yaw turns right, + pitch lifts the nose and + roll drops the right wing; each engine types those with its own signs.",
	"gloss.euler-order.title": "Rotation order",
	"gloss.euler-order.body":
		"Two turns in one order give a different result from the same two turns in the other order, so an engine must choose an order. All three engines here apply yaw first, then pitch about the new right axis, then roll about the new forward axis. Unity describes the same thing as z, then x, then y about fixed axes; Godot calls it YXZ.",
	"gloss.gimbal-lock.title": "Gimbal lock",
	"gloss.gimbal-lock.body":
		"When the middle turn (pitch) reaches ±90°, the first and last turn axes line up, and yaw and roll spin the object about the same axis. One degree of freedom is lost: some nearby orientations can no longer be reached by small changes. It is a property of storing three turns in sequence, not an engine bug.",
	"gloss.clamp.title": "Clamping pitch",
	"gloss.clamp.body":
		"Keeping pitch between about −89° and +89° stops it ever reaching the lock. It is one line, and the standard defence for a first-person camera. Putting yaw and pitch on separate objects (yaw the body, pitch a child camera) is the fuller fix, because each object then turns about one axis only.",
	"gloss.read-back.title": "Reading angles back",
	"gloss.read-back.body":
		"An engine stores an orientation, not the numbers you typed, and many Euler triples describe the same one. Reading the angles back gives you the engine's own choice: Unity reports 0° to 360°, Godot and Unreal −180° to 180°, and past 90° of pitch you get a different triple for the same pose. The read-out shows what the chosen engine would hand back.",
	"gloss.quaternion.title": "Quaternion",
	"gloss.quaternion.body":
		"Four numbers (x, y, z, w) that store a single turn about a single axis. There is no sequence of turns, so there is nothing to lock, and combining or interpolating rotations is cheap and smooth. Engines store rotations as quaternions and show you degrees, because a quaternion cannot be read at a glance.",
	"gloss.axis-angle.title": "Axis and angle",
	"gloss.axis-angle.body":
		"Any orientation can be reached by one turn of some angle θ about some axis. A quaternion is exactly that pair, packed as (axis · sin(θ/2), cos(θ/2)). The axis must be a unit vector. Unity's AngleAxis takes the angle in degrees; Godot's Quaternion(axis, angle) and Unreal's FQuat(Axis, AngleRad) take radians.",
	"gloss.half-angle.title": "Why half the angle: 720°",
	"gloss.half-angle.body":
		"Because the quaternion uses θ/2, turning 360° takes the numbers from (0, 0, 0, 1) to (0, 0, 0, −1): the object is back where it started, but the quaternion is not. Only after 720° do the numbers return too.",
	"gloss.double-cover.title": "q and −q",
	"gloss.double-cover.body":
		"Every orientation has exactly two quaternions, q and −q, with every sign flipped. They rotate everything identically. So compare orientations, not numbers: Unity's Quaternion.Angle uses the absolute dot product and reports 0 for q and −q, while == in Unity and Unreal says they differ.",
	"gloss.unit.title": "Unit length and normalising",
	"gloss.unit.body":
		"Only a quaternion of length 1 is a rotation. Numbers typed by hand, or accumulated over many frames, drift away from 1. Engines react differently: Godot's Basis quietly divides the length out, but its q * v and slerp report an error in debug builds; the raw maths (q·v·q*) also scales the object by |q|². Normalising, dividing by the length, puts it right.",
	"gloss.slerp.title": "Slerp",
	"gloss.slerp.body":
		"Spherical linear interpolation: a turn from A to B at a steady angular speed along the shortest arc of the hypersphere. It is how a camera or a turret turns smoothly between two orientations. Interpolating the four numbers directly cuts across the sphere and speeds up in the middle.",
	"gloss.shortest-path.title": "The shortest path",
	"gloss.shortest-path.body":
		"Because q and −q are the same orientation, there are two arcs from A to B, one short and one long. If the dot product of A and B is negative, the short way is towards −B. Godot's slerp and Unreal's Slerp flip B for you, and Unity's Slerp takes the short way; Godot's slerpni and Unreal's SlerpFullPath do not, and can go the long way round.",
	"gloss.hypersphere.title": "The hypersphere and its projection",
	"gloss.hypersphere.body":
		"Unit quaternions are the points of a sphere in four dimensions. The 4D view flattens it into three, as a map flattens the globe, by a stereographic projection from −1: no turn is the centre, every 180° turn lies on the unit sphere, and a 360° turn (−1) lies at infinity. A turn of θ about an axis sits tan(θ/4) out along that axis, drawn with the right-hand rule in the scene's own directions.",
	"gloss.multiply.title": "Multiplying quaternions",
	"gloss.multiply.body":
		"Multiplying two quaternions composes their rotations, and multiplying by q moves every point of the hypersphere at once. Apply q gradually shows it: the centre travels to q, and six reference circles are carried along. Order matters, q₁q₂ is usually not q₂q₁, for the same reason Euler order does.",
	"gloss.alignment.title": "Aligned views",
	"gloss.alignment.body":
		"With the two views aligned, orbiting either camera orbits both. Because the 4D view uses the scene's directions, q's point then sits in the same screen direction as the aircraft's turn axis. Dragging q in the 4D view turns the aircraft, and turning the aircraft moves q.",
	"gloss.basis.title": "Basis",
	"gloss.basis.body":
		"The object's own right, up and forward vectors, expressed in world (or parent) space. Written as the columns of a matrix, they are the rotation. Godot stores a Basis directly; Unity and Unreal store a quaternion and give you the vectors.",
	"gloss.orthonormal.title": "Orthonormal",
	"gloss.orthonormal.body":
		"Each of the three axes has length 1, and every pair meets at 90°. Only then is the basis a pure rotation; otherwise it also stretches or shears. Orthonormalising (Godot's orthonormalized) restores both.",
	"gloss.local-world.title": "Local and world space",
	"gloss.local-world.body":
		"A turn about the object's own axis (local) and the same turn about the world's axis agree only while the object is unturned. Engines let you choose: Unity's Rotate takes Space.Self or Space.World, Godot has rotate_object_local and global_rotate, and Unreal has AddActorLocalRotation and AddActorWorldRotation.",
	"gloss.drift.title": "Drift",
	"gloss.drift.body":
		"Every multiplication rounds a little. Accumulate a rotation over thousands of frames and the error builds up until the object visibly shears, stretches or shrinks. Renormalise a stored quaternion, or orthonormalise a stored basis, regularly; it costs almost nothing.",
	"gloss.forward.title": "Forward is a question",
	"gloss.forward.body":
		"Forward is a property of the object, not a constant. Vector3.forward (Unity), Vector3.FORWARD (Godot) and FVector::ForwardVector (Unreal) are fixed world directions; transform.forward, −transform.basis.z and GetActorForwardVector() are the object's own. Note the minus sign in Godot, where forward is −Z.",
	"gloss.look-at.title": "Look-at",
	"gloss.look-at.body":
		"Builds the orientation whose forward points at a target: Quaternion.LookRotation in Unity, look_at in Godot, FindLookAtRotation in Unreal. It is less code than working out angles, and right in the cases angles get wrong. It needs a direction that is not zero, and an up hint that is not parallel to it.",
	"gloss.up-hint.title": "The up hint",
	"gloss.up-hint.body":
		"A direction fixes where the nose points but not how the object sits around it. The up hint settles the roll: of all the ways to face the target, take the one whose up is closest to the hint. With the target straight above, the hint is parallel to the direction and no choice is best: Godot warns and picks an arbitrary roll, Unity falls back to a rotation from +Z, and Unreal's yaw jumps as the target passes overhead.",
	"gloss.smooth.title": "Turning smoothly",
	"gloss.smooth.body":
		"Setting the orientation at once snaps. Moving a fraction of the remaining turn each frame (Slerp in Unity, basis.slerp in Godot, RInterpTo in Unreal) eases towards it, and turns a sudden flip into a quick sweep. Unity's RotateTowards is the fixed-speed alternative.",
	"gloss.handedness.title": "Handedness",
	"gloss.handedness.body":
		"In a right-handed system (Godot) a positive turn is anticlockwise when the axis points at you; in a left-handed one (Unity, Unreal) it is clockwise. That is why the same turn about the same axis is a negative angle in this tool's Unity and Unreal code. You cannot fix a handedness mismatch by rotating a model.",
	"gloss.conventions.title": "Engine conventions",
	"gloss.conventions.body":
		"Unity: Y up, +Z forward, left-handed, one unit is a metre. Godot: Y up, −Z forward, right-handed, one unit is a metre. Unreal: Z up, +X forward, left-handed, one unit is a centimetre. A vector or a number copied between engines without converting points the wrong way, or is a hundred times off.",
	"gloss.degrees-radians.title": "Degrees and radians",
	"gloss.degrees-radians.body":
		"Unity's Euler angles and AngleAxis use degrees. Godot's rotation and Quaternion(axis, angle) use radians, and rotation_degrees is the degree version. Unreal's FRotator uses degrees and FQuat(Axis, AngleRad) radians. One radian is about 57°, so a mix-up is a 57-fold error.",
};
