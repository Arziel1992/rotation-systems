/**
 * English — the baseline locale, and the one every other falls back to.
 * It must stay complete: a key missing here has nothing behind it.
 *
 * Australian English, matching the units this tool serves. Not translated
 * anywhere: "E. Ketterer", unit codes, the version, mathematical notation,
 * code identifiers, and the code samples (code.js).
 */
export default {
	documentTitle: "Rotation Systems",
	documentDescription:
		"Turn a 3D object with Euler angles, quaternions, a basis or look-at, and watch the same orientation written live in GDScript, Unity C# and Unreal C++ - including where each method breaks.",

	/* Shell */
	title: "Rotation Systems",
	tagline:
		"Euler angles, quaternions, bases and look-at: turned live, written in three engines.",
	skipToContent: "Skip to content",
	theoryToggle: "Explanation",
	languageLabel: "Language",
	themeToggle: "Dark theme",
	methodsLabel: "Rotation method",
	"tab.euler": "Euler angles",
	"tab.quat": "Quaternion",
	"tab.basis": "Basis / matrix",
	"tab.lookat": "Look-at",
	footerMadeWith: "Made with ❤️ for Swinburne",
	footerSubject: "3D Rotation",
	versionTitle: "Version: the date and time of this release",
	resetDone: "Reset.",

	/* Views */
	viewLabel:
		"3D view of the aircraft: yaw {yaw}°, pitch {pitch}°, roll {roll}°",
	viewHint:
		"Drag the aircraft to turn it · drag elsewhere to orbit · with the view focused, arrow keys and Q/E turn it (Shift for bigger steps)",
	viewHintLookat:
		"Drag the target to move it · drag elsewhere to orbit · with the view focused, arrow keys and Page Up/Down move the target",
	objectTitle: "The aircraft",
	hyperTitle: "q on the hypersphere (4D, projected)",
	hyperLabel:
		"Stereographic projection of the unit quaternion q: no turn at the centre, every 180° turn on the unit sphere",
	hyperHint:
		"Drag to orbit · centre = no turn · sphere = 180° · infinity = 360°",
	hyperSphere: "w = 0 · every 180° turn",
	hyperIdentity: "1 · no turn",
	hyperMinus: "−q · same orientation",
	noWebgl:
		"This browser cannot draw in 3D (WebGL is unavailable). The code and the read-out still work.",
	worldAxes: "World axes",
	axisForward: "forward",
	axisRight: "right",
	axisUp: "up",
	axisBack: "back",
	axisDiagonal: "Diagonal",
	axis: "Axis",
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
	liveLegend:
		"Highlighted values come from the pose on screen, and change as you turn it.",

	/* Controls */
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
		"One ring and one axis per angle. Colours follow the engine's X, Y and Z.",
	showAxes: "Show the object's own axes",
	axisPresets: "Axis",
	angle: "Angle θ",
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
	turnsHint: "Each press adds one 15° turn. The code shows the last one.",
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
	reset: "Reset this tab",
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
		"Flip b when dot(a, b) < 0. Every engine's own Slerp does this for you.",
	"break.fullpath.started": "Slerping to minus B without the sign check.",
	"break.fullpath.done":
		"That was the long way round. The ghost shows the short way.",

	"break.negate.title": "q and −q",
	"break.negate.body":
		"Every component changes sign, and the aircraft does not move. In the 4D view the point jumps to the other side of the sphere.",
	"break.negate.action": "Negate q",
	"break.negate.fix":
		"Compare orientations with Angle or AngularDistance, never with ==.",
	"break.negate.started":
		"Every component of q negated. The aircraft has not moved.",

	"break.unnormalised.title": "Forget to normalise",
	"break.unnormalised.body":
		"A quaternion whose length is not 1 is not a rotation. Applied as q·v·q*, it also scales the object by |q|².",
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
		"As the target passes over the top, the look direction lines up with the up hint. Look-at is undefined there, and the aircraft flips 180°.",
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
	readoutHeading: "The same orientation, four ways",
	readoutIntro: "As {engine} reports it.",
	readEuler: "Euler, read back",
	readQuat: "Quaternion",
	readAxisAngle: "Axis and angle",
	readAxes: "The object's own axes",
	matrixCaption:
		"The rotation matrix in {engine}. Each column is where that axis ends up.",
	healthLengths: "Column lengths (should be 1)",
	healthCorners: "Angles between columns (should be 90°)",
	freedom: "Angle between the yaw and roll axes",
	freedomLocked: "gimbal lock: two controls, one motion",
	freedomHint: "90° in level flight. It closes as |pitch| rises.",
	qNorm: "Length |q|",
	qNotUnit: "not a rotation",
	upAngle: "Look direction to up hint",
	degenerateNow: "undefined: straight up",
	distance: "Distance to the target",
	readoutScenario: "The values follow the scenario while it plays.",

	/* Theory */
	theoryHeading: "How it works",
	intro:
		"A game can store which way something faces in three ways: as three angles (Euler), as four numbers (a quaternion), or as three arrows (a basis). A fourth, look-at, builds one from a direction. Each tab turns the same aircraft one way. The code underneath writes that pose in Godot, Unity and Unreal, and changes as you turn it. The Break it cards show where each method fails when nothing guards its limits.",

	"theory.e1.title": "Three numbers, applied in order",
	"theory.e1.body":
		"Yaw turns the nose left or right, pitch lifts it, and roll banks the wings. All three engines apply them in the same order: yaw, then pitch about the new right axis, then roll about the new forward axis. They name and sign them differently, though. Unity types nose-up as a negative x, Godot types turn-right as a negative y, and Unreal names them Pitch, Yaw and Roll. Same pose, three sets of numbers: switch the code tabs and watch.",
	"theory.e2.title": "Gimbal lock",
	"theory.e2.body":
		"The rings show the three turns. Pitch the nose to 90° and the roll ring lies flat on the yaw ring: yaw and roll now turn about the same axis, and one of your three controls is gone. It is not an engine bug and no engine can fix it. It is what storing an orientation as three turns in sequence means. The read-out shows the angle between the yaw and roll axes draining away as pitch rises.",
	"theory.e3.title": "The two defences",
	"theory.e3.body":
		"Clamp pitch to about ±89°: one line, and the standard fix for a first-person camera. Better still, put yaw and pitch on different objects. Yaw the body, and pitch a camera that is its child. Each object then turns about one axis only, and the problem disappears rather than being managed.",
	"theory.e4.title": "Reading back is not writing",
	"theory.e4.body":
		"Many triples describe the same orientation, and the engine gives you back one of them, not necessarily yours. Turn the clamp off, push pitch past 90° and look at the read-out: a different triple, the same pose. That is why adding to rotation.y every frame drifts: you are adding to a number the engine may have rewritten.",

	"theory.q1.title": "Four numbers, no sequence",
	"theory.q1.body":
		"A quaternion stores one turn about one axis: w = cos(θ/2), and (x, y, z) = axis · sin(θ/2). There is no order of operations to get wrong, so there is nothing to lock. The cost is that you cannot read one at a glance, which is why every editor still shows you degrees.",
	"theory.q2.title": "Why half the angle",
	"theory.q2.body":
		"Because of the halves, a 360° turn does not bring the numbers back: w goes from 1 to −1. Drag the angle to 360° and watch the aircraft return while the numbers do not. Only at 720° do both agree again.",
	"theory.q3.title": "q and −q are the same orientation",
	"theory.q3.body":
		"Change every sign and the object does not move. So compare orientations, not numbers: Unity's Quaternion.Angle and Unreal's AngularDistance both treat q and −q as the same, and a plain == does not.",
	"theory.q4.title": "Slerp: the shortest arc",
	"theory.q4.body":
		"Spherical interpolation turns from A to B at a steady rate along the shortest path. Every engine's Slerp checks the sign first. Skip that check and, whenever the two quaternions sit in opposite halves, the turn goes the long way round.",
	"theory.q5.title": "The hypersphere, projected (4D)",
	"theory.q5.body":
		"Every unit quaternion is a point on a sphere in four dimensions. The right-hand view flattens it into three, the way a map flattens the globe (a stereographic projection). No turn is the centre, every 180° turn lies on the unit sphere, and a 360° turn lies at infinity. A turn of θ sits tan(θ/4) out along its axis.",
	"theory.q6.title": "Multiplying moves everything",
	"theory.q6.body":
		"Apply q gradually shows what multiplying by q does to the whole hypersphere: the centre travels to q, and the coloured reference circles are carried along with it. You do not need this arithmetic to use quaternions in a game. It is here for when you want to know why they work.",

	"theory.b1.title": "Three arrows are the rotation",
	"theory.b1.body":
		"A basis is the object's own right, up and forward vectors, each of length 1 and at right angles to the others. Written as columns, they are the rotation matrix. Godot stores one as a Basis; Unity and Unreal build it from a quaternion and hand you the vectors.",
	"theory.b2.title": "Ask the object, not the world",
	"theory.b2.body":
		"Forward is a question you ask the object every frame, not a constant. Vector3.forward, Vector3.FORWARD and FVector::ForwardVector never change, however the object turns. Godot's forward is −basis.z: forget the minus sign and your character walks backwards.",
	"theory.b3.title": "Local or world",
	"theory.b3.body":
		"Once the object is already turned, a turn about its own axis (local) and the same turn about the world's axis give different results. Try the same button in both modes: a local turn is applied after the current orientation, a world turn before it.",
	"theory.b4.title": "Drift",
	"theory.b4.body":
		"Rounding error builds up when you keep multiplying into a stored rotation. After enough frames the arrows are no longer length 1 or at right angles, and the object slowly shears or shrinks. Orthonormalising the basis, or renormalising the quaternion, resets it. It is cheap, so do it.",

	"theory.l1.title": "Build it from a direction",
	"theory.l1.body":
		"If you know where something should face, ask the engine to build the orientation from that direction rather than working out three angles yourself. It is less code, and it is right in every case the angles get wrong.",
	"theory.l2.title": "The up hint",
	"theory.l2.body":
		"A direction fixes where the nose points, but not how the wings sit around it. The up hint settles that: of every way to face the target, take the one whose up is closest to this vector.",
	"theory.l3.title": "Straight up",
	"theory.l3.body":
		"When the target is directly above, the direction is parallel to the up hint and there is no closest way to sit. Godot's look_at() reports an error, and the others flip the object 180° as the target passes over. Keep the target below about 89°, or pass a different up hint near the pole.",
	"theory.l4.title": "Turning smoothly",
	"theory.l4.body":
		"Setting the orientation at once snaps. Closing a fraction of the gap each frame (Slerp, basis.slerp, RInterpTo) turns smoothly, and turns a sudden flip into a quick sweep.",

	rulesTitle: "Four rules that avoid most rotation bugs",
	rule1: "Set an orientation from a direction, not from angles.",
	rule2:
		"Never add to Euler angles frame after frame. Keep your own angles and set the rotation from them.",
	rule3: "Clamp pitch before it reaches 90°.",
	rule4: "Put yaw and pitch on different objects.",

	tableTitle: "Three engines, three conventions",
	selectedEngine: "(the engine selected below)",
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

	refsTitle: "Further reading",
	refEater:
		"Ben Eater and Grant Sanderson's interactive quaternion explorer, which this tool's 4D view follows.",
	ref3b1b: "Quaternions and 3D rotation, explained interactively (video).",
	refUnity: "Quaternion and Euler rotations.",
	refGodot: "Using 3D transforms.",
	refUnreal: "Coordinate system and spaces.",
};
