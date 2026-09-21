/**
 * Español (Latinoamérica). Mismas claves que en.js, una por una.
 *
 * Los términos técnicos clave conservan el inglés entre paréntesis la primera
 * vez (bloqueo de cardán, gimbal lock): los exámenes de Swinburne usan el
 * término en inglés. No se traducen: "E. Ketterer", los códigos de unidad, la
 * versión, la notación matemática, los identificadores de código ni los
 * fragmentos de código (code.js).
 */
export default {
	documentTitle: "Sistemas de rotación",
	documentDescription:
		"Gira un objeto 3D con ángulos de Euler, cuaterniones, una base o look-at, y mira la misma orientación escrita en vivo en GDScript, C# de Unity y C++ de Unreal, incluido dónde falla cada método.",

	/* Interfaz */
	title: "Sistemas de rotación",
	tagline: "Ángulos de Euler, cuaterniones, bases y look-at, en tres motores",
	skipToContent: "Saltar al contenido",
	stageLabel: "La vista 3D y el código",
	hideTheory: "Ocultar el libro de texto",
	showTheory: "Mostrar el libro de texto",
	hideControls: "Ocultar los controles",
	showControls: "Mostrar los controles",
	toolbarLabel: "Ajustes de la herramienta",
	manualButton: "Manual",
	languageLabel: "Idioma",
	themeToggle: "Tema oscuro",
	"tab.euler": "Ángulos de Euler",
	"tab.quat": "Cuaternión",
	"tab.basis": "Base / matriz",
	"tab.lookat": "Look-at",
	"tabSub.euler": "Tres giros, en orden",
	"tabSub.quat": "Un giro alrededor de un eje",
	"tabSub.basis": "Tres flechas",
	"tabSub.lookat": "Mirar a un objetivo",
	methodChosen: "{method} seleccionado.",
	footerMadeWith: "Hecho con ❤️ para Swinburne",
	footerSubject: "Rotación 3D",
	versionTitle: "Versión: la fecha y hora de esta publicación",
	resetDone: "Restablecido.",
	"kbHint.euler":
		"Arrastra el avión o un anillo · flechas y Q/E lo giran · 1–4 método · G glosario",
	"kbHint.quat":
		"Arrastra el avión, la punta del eje o el anillo θ · flechas y Q/E lo giran · 1–4 método · G glosario",
	"kbHint.basis":
		"Arrastra el avión o un anillo del gizmo · flechas y Q/E lo giran · 1–4 método · G glosario",
	"kbHint.lookat":
		"Arrastra el objetivo · flechas y Re Pág/Av Pág lo mueven · 1–4 método · G glosario",

	/* Vistas */
	"viewLabel.aircraft":
		"Vista 3D del avión: guiñada {yaw}°, cabeceo {pitch}°, alabeo {roll}°",
	"viewLabel.capybara":
		"Vista 3D de una capibara: guiñada {yaw}°, cabeceo {pitch}°, alabeo {roll}°",
	"objectTitle.aircraft": "El avión",
	"objectTitle.capybara": "La capibara",
	capybaraFound:
		"Una capibara ocupa el lugar del avión en esta visita. Su nariz apunta hacia adelante y la naranja sobre su cabeza apunta hacia arriba; todo lo demás funciona igual.",
	repository: "Repositorio",
	modelCredit: "Modelo 3D",
	hyperTitle: "q en la hiperesfera (4D)",
	hyperLabel:
		"Proyección estereográfica del cuaternión unitario q, en las direcciones de la escena: sin giro en el centro, todo giro de 180° sobre la esfera unitaria",
	hyperHint:
		"Arrastra q para girar el avión · centro = sin giro · esfera = 180° · infinito = 360°",
	hyperSphere: "w = 0 · todo giro de 180°",
	hyperIdentity: "1 · sin giro",
	hyperMinus: "−q · misma orientación",
	alignViews: "Alinear las vistas",
	alignHint:
		"Orbita cualquiera de las dos vistas y la otra la sigue, así el punto de q queda alineado con el eje del giro.",
	alignOn: "Las dos vistas están alineadas.",
	alignOff: "Las dos vistas se mueven por separado.",
	noWebgl:
		"Este navegador no puede dibujar en 3D (WebGL no está disponible). El código y la lectura siguen funcionando.",
	worldAxes: "Ejes del mundo",
	axisForward: "adelante",
	axisRight: "derecha",
	axisUp: "arriba",
	axisBack: "atrás",
	axisDiagonal: "Diagonal",
	axis: "Eje",
	angle: "Ángulo θ",
	yaw: "Guiñada (yaw)",
	pitch: "Cabeceo (pitch)",
	roll: "Alabeo (roll)",
	target: "Objetivo",
	trailLong: "✗ camino largo",
	trailShort: "✓ camino corto",
	trailSlerp: "✓ slerp",
	ghostShort: "camino corto",
	rayWorld: "constante del mundo",
	rayOwn: "adelante propio",
	lookDegenerate:
		"El objetivo está justo arriba: look-at no está definido aquí.",
	lookFlipped:
		"El avión dio un giro brusco de 180 grados cuando el objetivo pasó por encima.",

	/* Panel de código */
	codeHeading: "La misma pose en código",
	hideCode: "Ocultar código",
	showCode: "Mostrar código",
	resizeCode: "Cambiar el tamaño del panel de código",
	codeSizeValue: "{n} % de la altura de la ventana",
	enginesLabel: "Motor",
	"engine.godot": "Godot · GDScript",
	"engine.unity": "Unity · C#",
	"engine.unreal": "Unreal · C++",
	"engineShort.godot": "Godot",
	"engineShort.unity": "Unity",
	"engineShort.unreal": "Unreal",
	codeRegion: "Ejemplo de código en {engine}",
	copy: "Copiar",
	copied: "Código copiado al portapapeles.",
	copyFailed: "No se pudo copiar. Selecciona el código y cópialo a mano.",
	scrubLegend: "arrástralo hacia arriba o abajo, o enfócalo y usa las flechas;",
	liveLegend: "sigue a la pose en pantalla.",
	"scrub.e": "Número de Euler {n}",
	"scrub.ax": "Componente del eje {n}",
	"scrub.ang": "Ángulo",
	"scrub.tg": "Componente del objetivo {n}",
	"scrub.rate": "Velocidad de giro",
	"scrub.t": "Fracción t",
	"scrub.tu": "Número del giro {n}",

	/* Controles */
	glossaryFor: "Glosario: {topic}",
	methodsHeading: "Método de rotación",
	"controls.euler": "Ángulos de Euler",
	"controls.quat": "Eje y ángulo",
	"controls.basis": "Girar el objeto",
	"controls.lookat": "El objetivo",
	yawHint: "+ gira la nariz a la derecha",
	pitchHint: "+ levanta la nariz",
	rollHint: "+ baja el ala derecha",
	clampPitch: "Limitar el cabeceo a ±89°",
	clampPitchHint: "La defensa de una línea contra el bloqueo de cardán.",
	showRings: "Mostrar los anillos del cardán",
	showRingsHint:
		"Un anillo por ángulo; arrastra un anillo para girarlo. Los colores siguen los ejes X, Y y Z del motor.",
	showAxes: "Mostrar los ejes propios del objeto",
	axisPresets: "Eje",
	angleHint:
		"A 360° el avión vuelve a donde empezó, pero los números no; a 720° vuelven ambos.",
	formulaLabel: "El cuaternión construido a partir del eje y el ángulo",
	formulaHint: "Componentes en los ejes propios de {engine}.",
	slerpHeading: "Slerp",
	slerpHint: "Gira el avión y fíjalo como A; gíralo otra vez y fíjalo como B.",
	setA: "Fijar A en esta pose",
	setB: "Fijar B en esta pose",
	setAdone: "A fijado en la pose actual.",
	setBdone: "B fijado en la pose actual.",
	spaceLegend: "Girar alrededor de",
	spaceLocal: "sus propios ejes (local)",
	spaceWorld: "los ejes del mundo",
	turnsLabel: "Girar 15°",
	turnPitchUp: "Nariz arriba",
	turnPitchDown: "Nariz abajo",
	turnYawLeft: "Girar a la izquierda",
	turnYawRight: "Girar a la derecha",
	turnRollLeft: "Alabear a la izquierda",
	turnRollRight: "Alabear a la derecha",
	turnsHint:
		"Cada clic suma un giro de 15°. El código muestra el último giro como tres ángulos; arrastra cualquiera para cambiarlo.",
	showGizmo: "Mostrar el gizmo de rotación",
	showGizmoHint:
		"Arrastra un anillo para girar alrededor de ese eje, en el espacio elegido arriba.",
	targetRight: "Objetivo: derecha",
	targetUp: "Objetivo: arriba",
	targetForward: "Objetivo: adelante",
	smooth: "Girar suavemente",
	smoothHint:
		"Acercarse al objetivo un poco en cada fotograma en vez de saltar.",
	turnRate: "Velocidad de giro",
	turnRateHint:
		"Qué parte del giro restante se cierra por segundo: más alto es más brusco.",
	clampElevation: "Mantener el objetivo por debajo de 89°",
	clampElevationHint: "El equivalente en look-at de limitar el cabeceo.",
	reset: "Restablecer este método",
	breakHeading: "Rómpelo",
	breakIntro:
		"Cada tarjeta muestra una falla que encontrarás en un proyecto real, y su solución.",
	playerLabel: "Reproducción del escenario",
	play: "Reproducir",
	pause: "Pausar",
	resume: "Continuar",
	replay: "Repetir",
	stop: "Detener",
	progressLabel: "Avance del escenario",
	scenarioStopped: "Escenario detenido.",
	qLength: "Longitud |q|",
	qLengthHint:
		"Exactamente 1 es una rotación. Cualquier otro valor también escala, al cuadrado.",
	orthonormalize: "Ortonormalizar en cada fotograma",
	orthonormalizeHint:
		"Godot: orthonormalized(). Unity y Unreal: renormalizar el cuaternión.",
	driftHalted:
		"Deriva detenida: la base está muy deformada. Marca ortonormalizar para ver la solución, o pulsa Detener para enderezarla.",
	fireAlong: "Disparar a lo largo de",

	/* Rómpelo, y explora */
	"break.gimbal.title": "Bloqueo de cardán (gimbal lock)",
	"break.gimbal.body":
		"Cabecea a 90° sin límite y luego mueve la guiñada y el alabeo: ambos hacen girar el avión alrededor del mismo eje vertical.",
	"break.gimbal.action": "Mostrar el bloqueo de cardán",
	"break.gimbal.fix":
		"Limita el cabeceo a ±89°, o pon la guiñada y el cabeceo en objetos distintos.",
	"break.gimbal.started": "Levantando la nariz a 90 grados, sin límite.",
	"break.gimbal.phase0": "Levantando la nariz.",
	"break.gimbal.phase1":
		"El cabeceo está en 90 grados. Ahora se mueve la guiñada.",
	"break.gimbal.phase2":
		"Ahora se mueve el alabeo: el mismo movimiento que la guiñada.",
	"break.gimbal.done":
		"Bloqueo de cardán mostrado. Activa el límite para evitarlo.",

	"break.longway.title": "El camino largo",
	"break.longway.body":
		"Interpolar el número de 350° a 10° recorre 340°, aunque las dos poses están a solo 20° de distancia.",
	"break.longway.action": "Lerp 350° → 10°",
	"break.longway.fix":
		"Interpola orientaciones con Slerp, o usa LerpAngle para un solo ángulo.",
	"break.longway.started": "Interpolando el número de guiñada de 350 a 10.",
	"break.longway.done":
		"El número tomó el camino largo. El fantasma tomó el corto.",

	"break.fullpath.title": "Slerp sin la comprobación del camino más corto",
	"break.fullpath.body":
		"B se invierte a −B: la misma orientación, números opuestos. Un slerp que omite la comprobación de signo sigue los números por el camino largo.",
	"break.fullpath.action": "Slerp A → −B",
	"break.fullpath.fix":
		"Invierte b cuando dot(a, b) < 0. El slerp de Godot, el Slerp de Unreal y el Slerp de Unity toman el camino corto.",
	"break.fullpath.started":
		"Haciendo slerp hacia menos B sin la comprobación de signo.",
	"break.fullpath.done":
		"Ese fue el camino largo. El fantasma muestra el corto.",

	"break.negate.title": "q y −q",
	"break.negate.body":
		"Cada componente cambia de signo, y el avión no se mueve. En la vista 4D el punto salta al otro lado de la esfera.",
	"break.negate.action": "Negar q",
	"break.negate.fix":
		"Compara orientaciones con el valor absoluto del producto punto (así lo hace Angle de Unity), nunca con ==.",
	"break.negate.started":
		"Todas las componentes de q negadas. El avión no se movió.",

	"break.unnormalised.title": "Olvidar normalizar",
	"break.unnormalised.body":
		"Un cuaternión cuya longitud no es 1 no es una rotación. La matemática pura (q·v·q*) escala el objeto por |q|²; la Basis de Godot lo corrige en silencio, pero su q * v y su slerp reportan un error en las compilaciones de depuración.",
	"break.unnormalised.action": "Escalar q",
	"break.unnormalised.fix":
		"Normalízalo: q.normalized(), q.normalized o Q.Normalize().",
	"break.unnormalised.started":
		"q ya no tiene longitud 1. Arrastra el control de longitud.",

	"break.drift.title": "Deriva",
	"break.drift.body":
		"Gira una base fotograma tras fotograma y el error de redondeo se acumula. Aquí está exagerado para que se vea en segundos y no en minutos: las flechas se tuercen y se estiran.",
	"break.drift.action": "Empezar a girar",
	"break.drift.fix":
		"Ortonormaliza la base, o renormaliza el cuaternión, en cada fotograma.",
	"break.drift.started": "Girando, con el error de redondeo exagerado.",

	"break.worldconst.title": "Una constante del mundo como adelante",
	"break.worldconst.body":
		"Vector3.forward y sus equivalentes nunca cambian. Dispara a lo largo de una y el tiro ignora cómo está girado el avión.",
	"break.worldconst.action": "Comparar ambos",
	"break.worldconst.fix":
		"Pregúntale al objeto: transform.forward, −basis.z o GetActorForwardVector().",
	"break.worldconst.started":
		"Dos flechas: la constante del mundo y el adelante propio del avión.",

	"break.overhead.title": "Objetivo justo encima",
	"break.overhead.body":
		"Cuando el objetivo pasa por encima, la dirección de mirada se alinea con la pista de arriba (up hint). Look-at no tiene una buena respuesta ahí, y el avión gira de golpe 180°.",
	"break.overhead.action": "Pasar el objetivo por encima",
	"break.overhead.fix":
		"Mantén el objetivo por debajo de 89°, usa otra pista de arriba cerca del polo, o gira suavemente.",
	"break.overhead.started":
		"Moviendo el objetivo hacia arriba y por encima del avión.",
	"break.overhead.done": "El objetivo pasó por encima.",

	"break.slerp.title": "Slerp de A a B",
	"break.slerp.body":
		"Gira de A a B por el arco más corto, a ritmo constante. En la vista 4D el camino es un arco de círculo máximo.",
	"break.slerp.action": "Reproducir A → B",
	"break.slerp.started": "Haciendo slerp de A a B.",
	"break.slerp.done": "Llegó a B.",

	"break.apply.title": "Aplicar q poco a poco",
	"break.apply.body":
		"Observa q^s mientras s va de 0 a 1. El avión gira desde ninguna rotación hasta q, y en la vista 4D multiplicar por q arrastra toda la hiperesfera.",
	"break.apply.action": "Aplicar q",
	"break.apply.started": "Aplicando q poco a poco.",
	"break.apply.done": "q aplicado por completo.",

	/* Lectura */
	readoutHeading: "Lectura en vivo",
	readoutIntro:
		"La misma orientación, de cuatro maneras, tal como la reporta {engine}.",
	readEuler: "Euler, leído de vuelta",
	readQuat: "Cuaternión",
	matrixCaption:
		"La matriz de rotación en {engine}. Cada columna es a dónde va a parar ese eje.",
	healthLengths: "Longitud de las columnas (debería ser 1)",
	healthCorners: "Ángulos entre columnas (deberían ser 90°)",
	freedom: "Ángulo entre los ejes de guiñada y alabeo",
	freedomLocked: "Bloqueo de cardán: dos controles, un movimiento",
	freedomHint: "90° en vuelo nivelado; se cierra a medida que sube |cabeceo|.",
	qNorm: "Longitud |q|",
	qNotUnit: "No es una rotación: su longitud no es 1.",
	upAngle: "De la dirección de mirada a la pista de arriba",
	degenerateNow: "No definido: justo arriba",
	distance: "Distancia al objetivo",
	readoutScenario: "Los valores siguen al escenario mientras se reproduce.",

	/* Teoría */
	intro:
		"Un juego puede guardar hacia dónde mira algo como tres ángulos (Euler), como cuatro números (un cuaternión) o como tres flechas (una base); look-at la construye a partir de una dirección. Elige un método a la derecha y gira el avión: el código de abajo escribe la pose en Godot, Unity y Unreal a medida que avanzas, y las tarjetas Rómpelo muestran dónde falla cada método.",
	textbookHeading: "El libro de texto: {method}",
	"formula.euler.yaw":
		"un giro alrededor del eje vertical del mundo; + gira la nariz a la derecha",
	"formula.euler.pitch":
		"un giro alrededor del nuevo eje derecho; + levanta la nariz",
	"formula.euler.roll":
		"un giro alrededor del nuevo eje adelante; + baja el ala derecha",
	"formula.euler.order":
		"se lee de derecha a izquierda con ejes fijos, o de izquierda a derecha con los ejes propios del objeto: la guiñada va primero de cualquier forma",
	"formula.quat.axis": "el eje unitario del giro",
	"formula.quat.theta": "el ángulo del giro",
	"formula.quat.w":
		"cos(θ/2): 1 sin giro, 0 en medio giro, −1 en un giro completo",
	"formula.quat.unit": "una rotación siempre tiene longitud 1",
	"formula.quat.p":
		"dónde se dibuja q en la vista 4D: el centro es sin giro, la esfera unitaria todo giro de 180°",
	"formula.basis.columns":
		"a dónde van a parar los ejes X, Y y Z del motor: los ejes propios del objeto",
	"formula.basis.orthonormal":
		"una rotación pura cuando cada columna mide 1 y cada par forma 90°",
	"formula.lookat.forward": "la dirección hacia la que mirar",
	"formula.lookat.hint":
		"la pista de arriba: fija el alabeo, y no debe ser paralela a adelante",
	"formula.lookat.cross":
		"el producto cruz: un vector en ángulo recto con ambos",

	"theory.e1.title": "Tres números, aplicados en orden",
	"theory.e1.body":
		"Los tres motores aplican primero la guiñada (yaw), luego el cabeceo (pitch) alrededor del nuevo eje derecho y luego el alabeo (roll) alrededor del nuevo eje adelante. Pero nombran y dan signo a los ángulos de forma distinta: Unity escribe nariz arriba como x negativo, Godot escribe girar a la derecha como y negativo, y Unreal los llama Pitch, Yaw y Roll. La misma pose, tres juegos de números.",
	"theory.e2.title": "Bloqueo de cardán (gimbal lock)",
	"theory.e2.body":
		"Lleva la nariz a 90° y el anillo del alabeo queda plano sobre el de la guiñada: ahora ambos giran alrededor del mismo eje, y uno de tus tres controles desaparece. No es un error del motor y ningún motor puede corregirlo; es lo que significa guardar tres giros en secuencia.",
	"theory.e3.title": "Las dos defensas",
	"theory.e3.body":
		"Limita el cabeceo a unos ±89°: una línea, y la solución estándar para una cámara en primera persona. Mejor aún, pon la guiñada y el cabeceo en objetos distintos: la guiñada en el cuerpo y el cabeceo en una cámara que sea su hija.",
	"theory.e4.title": "Leer no es escribir",
	"theory.e4.body":
		"Muchas ternas describen la misma orientación, y el motor te devuelve la suya. Desactiva el límite, lleva el cabeceo más allá de 90° y mira la lectura: otra terna, la misma pose. Por eso sumar a rotation.y en cada fotograma produce deriva.",

	"theory.q1.title": "Cuatro números, sin secuencia",
	"theory.q1.body":
		"Un cuaternión guarda un solo giro alrededor de un solo eje. No hay orden de operaciones que equivocar, así que no hay nada que bloquear. El costo es que no se puede leer de un vistazo, y por eso todos los editores te siguen mostrando grados.",
	"theory.q2.title": "Por qué la mitad del ángulo",
	"theory.q2.body":
		"Por esas mitades, un giro de 360° no devuelve los números: w pasa de 1 a −1. Lleva el ángulo a 360° y mira cómo el avión vuelve mientras los números no. Solo a 720° coinciden los dos otra vez.",
	"theory.q3.title": "q y −q son la misma orientación",
	"theory.q3.body":
		"Cambia todos los signos y el objeto no se mueve. Compara orientaciones, no números: Quaternion.Angle de Unity usa el valor absoluto del producto punto y trata q y −q como iguales, mientras que == en Unity y en Unreal no.",
	"theory.q4.title": "Slerp: el arco más corto",
	"theory.q4.body":
		"La interpolación esférica gira de A a B a ritmo constante por el camino más corto. Omite su comprobación de signo, como hacen slerpni de Godot y SlerpFullPath de Unreal, y cuando A y B quedan en mitades opuestas el giro toma el camino largo.",
	"theory.q5.title": "La hiperesfera, proyectada",
	"theory.q5.body":
		"Cada cuaternión unitario es un punto sobre una esfera en cuatro dimensiones. La vista de la derecha la aplana a tres, como un mapa aplana el globo: sin giro es el centro, todo giro de 180° está sobre la esfera unitaria y un giro de 360° está en el infinito. Arrastra q ahí y el avión gira.",
	"theory.q6.title": "Multiplicar mueve todo",
	"theory.q6.body":
		"Aplicar q poco a poco muestra lo que multiplicar por q le hace a toda la hiperesfera: el centro viaja hasta q y los círculos de referencia de colores se mueven con él. No necesitas esta aritmética para usar cuaterniones; está aquí para cuando quieras saber por qué funcionan.",

	"theory.b1.title": "Tres flechas son la rotación",
	"theory.b1.body":
		"Una base son los vectores derecha, arriba y adelante propios del objeto, cada uno de longitud 1 y en ángulo recto con los otros. Escritos como columnas, son la matriz de rotación. Godot la guarda como Basis; Unity y Unreal la construyen a partir de un cuaternión y te entregan los vectores.",
	"theory.b2.title": "Pregúntale al objeto, no al mundo",
	"theory.b2.body":
		"Adelante es una pregunta que le haces al objeto en cada fotograma, no una constante. Vector3.forward, Vector3.FORWARD y FVector::ForwardVector nunca cambian, gire como gire el objeto. En Godot, adelante es −basis.z: olvida el signo menos y tu personaje camina hacia atrás.",
	"theory.b3.title": "Local o mundo",
	"theory.b3.body":
		"Cuando el objeto ya está girado, un giro alrededor de su propio eje y el mismo giro alrededor del eje del mundo dan resultados distintos. Arrastra los anillos del gizmo en ambos modos: un giro local sigue al objeto, uno del mundo no.",
	"theory.b4.title": "Deriva",
	"theory.b4.body":
		"El error de redondeo se acumula cuando sigues multiplicando sobre una rotación guardada, hasta que las flechas ya no miden 1 ni forman ángulos rectos y el objeto se tuerce o se encoge. Ortonormalizar la base, o renormalizar el cuaternión, lo corrige. Es barato, así que hazlo.",

	"theory.l1.title": "Constrúyela a partir de una dirección",
	"theory.l1.body":
		"Si sabes hacia dónde debe mirar algo, pídele al motor que construya la orientación a partir de esa dirección en vez de calcular tú tres ángulos. Es menos código, y acierta en todos los casos en que los ángulos fallan.",
	"theory.l2.title": "La pista de arriba (up hint)",
	"theory.l2.body":
		"Una dirección fija hacia dónde apunta la nariz, pero no cómo quedan las alas alrededor de ella. La pista de arriba lo resuelve: de todas las maneras de mirar al objetivo, toma aquella cuyo arriba esté más cerca de ella.",
	"theory.l3.title": "Justo arriba",
	"theory.l3.body":
		"Con el objetivo justo arriba, la dirección es paralela a la pista de arriba y ningún alabeo es el mejor. look_at() de Godot imprime una advertencia y elige uno arbitrario, LookRotation de Unity recurre a una rotación desde +Z, y FindLookAtRotation de Unreal cambia su eje de referencia, así que la guiñada salta. Mantén el objetivo por debajo de unos 89°.",
	"theory.l4.title": "Girar suavemente",
	"theory.l4.body":
		"Fijar la orientación de una vez produce un salto. Cerrar una fracción de la diferencia en cada fotograma (Slerp, basis.slerp, RInterpTo) gira con suavidad, y convierte un giro brusco en un barrido rápido.",

	inEngines: "En tu motor",
	"engineNote.euler.godot":
		"rotation está en radianes; rotation_degrees es lo que muestra el Inspector. El orden por defecto es YXZ, y la guía de transformaciones 3D de Godot desaconseja componer los tres ángulos en el código del juego.",
	"engineNote.euler.unity":
		"Quaternion.Euler aplica z, luego x, luego y; transform.eulerAngles se lee de vuelta de 0° a 360°. +x baja la nariz.",
	"engineNote.euler.unreal":
		"FRotator(Pitch, Yaw, Roll) nombra sus ángulos: +Pitch es nariz arriba, +Yaw gira a la derecha, +Roll es en sentido horario mirando hacia adelante. GetActorRotation se lee de vuelta de −180° a 180°.",
	"engineNote.quat.godot":
		"Quaternion(axis, angle) recibe radianes y un eje normalizado. slerp toma el camino corto; slerpni no. q * v reporta un error en las compilaciones de depuración si q no está normalizado.",
	"engineNote.quat.unity":
		"Quaternion.AngleAxis recibe grados. Slerp toma el camino corto. == compara el producto punto con 1, así que q == −q es falso, mientras que Quaternion.Angle(q, −q) es 0.",
	"engineNote.quat.unreal":
		"FQuat(Axis, AngleRad) recibe radianes. Slerp corrige primero la alineación; SlerpFullPath no. == compara las componentes de forma exacta, y | es el producto punto.",
	"engineNote.basis.godot":
		"transform.basis.x, .y y .z son los ejes del nodo; adelante es −basis.z. rotate_object_local y global_rotate lo giran alrededor de un eje; multiplicar por Basis.from_euler lo gira con los tres a la vez, a la derecha para sus propios ejes y a la izquierda para los del mundo. orthonormalized() corrige la deriva.",
	"engineNote.basis.unity":
		"transform.right, up y forward son los ejes del objeto. Rotate(x, y, z, Space.Self o Space.World) lo gira, con los tres ángulos escritos como en Quaternion.Euler, y Matrix4x4.Rotate da la matriz.",
	"engineNote.basis.unreal":
		"GetActorForwardVector, GetActorRightVector y GetActorUpVector son la X, la Y y la Z del Actor. AddActorLocalRotation y AddActorWorldRotation lo giran.",
	"engineNote.lookat.godot":
		"look_at(target, up) apunta −Z hacia el objetivo. Una dirección nula es un error; una pista de arriba paralela a la dirección imprime una advertencia y elige un alabeo arbitrario.",
	"engineNote.lookat.unity":
		"Quaternion.LookRotation(forward, up). Un forward nulo registra un error y devuelve la identidad; un forward colineal con up recurre a FromToRotation(+Z, forward).",
	"engineNote.lookat.unreal":
		"UKismetMathLibrary::FindLookAtRotation construye solo a partir de la dirección (MakeFromX), así que nunca alabea; cerca de la vertical cambia su eje de referencia y la guiñada salta. RInterpTo gira con suavidad.",

	rulesTitle: "Cuatro reglas que evitan la mayoría de los errores de rotación",
	rule1: "Fija una orientación a partir de una dirección, no de ángulos.",
	rule2:
		"Nunca sumes a los ángulos de Euler fotograma tras fotograma. Guarda tus propios ángulos y fija la rotación a partir de ellos.",
	rule3: "Limita el cabeceo antes de que llegue a 90°.",
	rule4: "Pon la guiñada y el cabeceo en objetos distintos.",

	tableTitle: "Tres motores, tres convenciones",
	selectedEngine: "(el motor elegido en el panel de código)",
	rowUp: "Arriba",
	rowForward: "Adelante",
	rowHanded: "Lateralidad",
	rowUnit: "Una unidad",
	rowEuler: "Euler, como se escribe",
	rowOrder: "Orden de Euler",
	rowStored: "Se guarda como",
	handedRight: "Derecha",
	handedLeft: "Izquierda",
	unitMetre: "1 metro",
	unitCentimetre: "1 centímetro",
	orderGodot: "YXZ",
	orderUnity: "z, luego x, luego y",
	orderUnreal: "Yaw, luego Pitch, luego Roll",

	refsTitle: "Referencias",
	refEater:
		"El explorador interactivo de cuaterniones de Ben Eater y Grant Sanderson, que sigue la vista 4D de esta herramienta.",
	ref3b1b:
		"Cuaterniones y rotación 3D, explicados de forma interactiva (video, en inglés).",
	refUnity: "Rotaciones con cuaterniones y ángulos de Euler (en inglés).",
	refGodot: "Uso de transformaciones 3D.",
	refUnreal: "Sistema de coordenadas y espacios (en inglés).",

	/* Manual y glosario */
	glossaryTitle: "Manual y glosario",
	closeGlossary: "Cerrar",
	glossaryFooter:
		"Cada comportamiento de motor descrito aquí se comprobó contra la documentación o el código fuente de ese motor el 21 de septiembre de 2026.",
	glossGroupUse: "Uso de la herramienta",
	glossGroupEuler: "Ángulos de Euler",
	glossGroupQuat: "Cuaterniones",
	glossGroupBasis: "Base",
	glossGroupLook: "Look-at",
	glossGroupEngines: "Entre motores",

	"gloss.manual.title": "Cómo usar esta herramienta",
	"gloss.manual.body":
		"Elige un método a la derecha: ángulos de Euler, cuaternión, base o look-at. Cada uno gira el mismo avión a su manera, y el código bajo la vista escribe esa pose en Godot, Unity o Unreal; elige el motor con las pestañas sobre el código.\nPuedes girar el avión casi desde cualquier lugar: arrástralo, arrastra los anillos de colores, arrastra la punta del eje del cuaternión, arrastra q en la vista 4D, o arrastra los números del código hacia arriba o abajo. Los controles de la derecha hacen lo mismo, y la lectura debajo de ellos muestra el resultado de cuatro maneras a la vez.\nEl libro de texto de la izquierda explica el método en uso, y las tarjetas Rómpelo muestran cómo falla cada método cuando nada protege sus límites, y la solución. Ambos paneles laterales se pliegan con las pestañas en los bordes de la vista.",
	"gloss.keys.title": "Teclado y ratón",
	"gloss.keys.body":
		"1–4 eligen un método, y G abre este glosario. Con la vista 3D enfocada (haz clic en ella o llega con Tab), las flechas giran el avión y Q y E lo alabean; mantén Shift para pasos más grandes. En look-at, las flechas y Re Pág / Av Pág mueven el objetivo.\nArrastra el avión para girarlo, arrastra un anillo para girar alrededor de su eje, y arrastra en el espacio vacío para orbitar la cámara; usa la rueda para acercar.\nEn el código, un número resaltado con subrayado punteado es un control deslizante: arrástralo hacia arriba o abajo, o llega con Tab y usa las flechas (Shift para diez veces el paso).",
	"gloss.code-panel.title": "El panel de código",
	"gloss.code-panel.body":
		"El código escribe la pose en pantalla en el motor que elijas. Los números resaltados vienen de la pose y cambian al girarla; los que tienen subrayado punteado también se pueden arrastrar, y arrastrar uno mueve el avión exactamente como lo haría cambiar ese número en el motor. Los números dentro de los comentarios son explicación, no código, y se muestran como comentarios.\nLa misma pose se escribe distinto en cada motor, porque los motores no coinciden en ejes, lateralidad ni signos. Mostrar esa diferencia es una de las razones de ser de esta herramienta.",
	"gloss.break-it.title": "Las tarjetas Rómpelo",
	"gloss.break-it.body":
		"Cada tarjeta prepara una falla que encontrarás en un proyecto real, la muestra y luego nombra la solución. Los escenarios que se reproducen en el tiempo se pueden pausar y recorrer con su control; si tu sistema pide menos movimiento, esperan a que los recorras en vez de reproducirse solos. Detener devuelve el avión a su lugar.",
	"gloss.methods.title": "Cuatro maneras de fijar una orientación",
	"gloss.methods.body":
		"Los ángulos de Euler guardan tres giros aplicados en orden. Un cuaternión guarda un giro alrededor de un eje, como cuatro números. Una base guarda los tres ejes propios del objeto, que son la matriz de rotación. Look-at no guarda nada nuevo: construye una orientación a partir de una dirección. Los juegos usan las cuatro, normalmente con cuaterniones por debajo y ángulos de Euler en el editor.",
	"gloss.euler.title": "Ángulos de Euler",
	"gloss.euler.body":
		"Tres ángulos, aplicados uno tras otro alrededor de tres ejes. Son fáciles de leer y escribir, por eso todos los inspectores los muestran; pero el orden importa, una orientación tiene muchas ternas, y con 90° de cabeceo dos de los giros se funden en uno (bloqueo de cardán).",
	"gloss.yaw-pitch-roll.title": "Guiñada, cabeceo y alabeo",
	"gloss.yaw-pitch-roll.body":
		"Nombres para los tres giros, tomados de la aviación. La guiñada (yaw) gira la nariz a izquierda o derecha alrededor del eje vertical, el cabeceo (pitch) la levanta o la baja alrededor del eje transversal, y el alabeo (roll) inclina las alas alrededor del eje de nariz a cola. En esta herramienta + guiñada gira a la derecha, + cabeceo levanta la nariz y + alabeo baja el ala derecha; cada motor los escribe con sus propios signos.",
	"gloss.euler-order.title": "Orden de rotación",
	"gloss.euler-order.body":
		"Dos giros en un orden dan un resultado distinto de los mismos dos giros en el otro orden, así que un motor debe elegir un orden. Los tres motores aquí aplican primero la guiñada, luego el cabeceo alrededor del nuevo eje derecho y luego el alabeo alrededor del nuevo eje adelante. Unity describe lo mismo como z, luego x, luego y con ejes fijos; Godot lo llama YXZ.",
	"gloss.gimbal-lock.title": "Bloqueo de cardán (gimbal lock)",
	"gloss.gimbal-lock.body":
		"Cuando el giro del medio (el cabeceo) llega a ±90°, los ejes del primer y del último giro se alinean, y la guiñada y el alabeo giran el objeto alrededor del mismo eje. Se pierde un grado de libertad: algunas orientaciones cercanas ya no se alcanzan con cambios pequeños. Es una propiedad de guardar tres giros en secuencia, no un error del motor.",
	"gloss.clamp.title": "Limitar el cabeceo",
	"gloss.clamp.body":
		"Mantener el cabeceo entre unos −89° y +89° impide que llegue al bloqueo. Es una línea, y la defensa estándar para una cámara en primera persona. Poner la guiñada y el cabeceo en objetos separados (la guiñada en el cuerpo, el cabeceo en una cámara hija) es la solución más completa, porque cada objeto gira entonces alrededor de un solo eje.",
	"gloss.read-back.title": "Leer los ángulos de vuelta",
	"gloss.read-back.body":
		"Un motor guarda una orientación, no los números que escribiste, y muchas ternas de Euler describen la misma. Leer los ángulos de vuelta te da la elección del motor: Unity reporta de 0° a 360°, Godot y Unreal de −180° a 180°, y más allá de 90° de cabeceo obtienes otra terna para la misma pose. La lectura muestra lo que devolvería el motor elegido.",
	"gloss.quaternion.title": "Cuaternión",
	"gloss.quaternion.body":
		"Cuatro números (x, y, z, w) que guardan un solo giro alrededor de un solo eje. No hay secuencia de giros, así que no hay nada que bloquear, y combinar o interpolar rotaciones es barato y suave. Los motores guardan las rotaciones como cuaterniones y te muestran grados, porque un cuaternión no se puede leer de un vistazo.",
	"gloss.axis-angle.title": "Eje y ángulo",
	"gloss.axis-angle.body":
		"Cualquier orientación se alcanza con un giro de algún ángulo θ alrededor de algún eje. Un cuaternión es exactamente ese par, empaquetado como (eje · sin(θ/2), cos(θ/2)). El eje debe ser un vector unitario. AngleAxis de Unity recibe el ángulo en grados; Quaternion(axis, angle) de Godot y FQuat(Axis, AngleRad) de Unreal lo reciben en radianes.",
	"gloss.half-angle.title": "Por qué la mitad del ángulo: 720°",
	"gloss.half-angle.body":
		"Como el cuaternión usa θ/2, girar 360° lleva los números de (0, 0, 0, 1) a (0, 0, 0, −1): el objeto vuelve a donde empezó, pero el cuaternión no. Solo después de 720° vuelven también los números.",
	"gloss.double-cover.title": "q y −q",
	"gloss.double-cover.body":
		"Cada orientación tiene exactamente dos cuaterniones, q y −q, con todos los signos invertidos. Rotan todo de forma idéntica. Así que compara orientaciones, no números: Quaternion.Angle de Unity usa el valor absoluto del producto punto y reporta 0 para q y −q, mientras que == en Unity y en Unreal dice que son distintos.",
	"gloss.unit.title": "Longitud unitaria y normalizar",
	"gloss.unit.body":
		"Solo un cuaternión de longitud 1 es una rotación. Los números escritos a mano, o acumulados durante muchos fotogramas, se alejan de 1. Los motores reaccionan distinto: la Basis de Godot divide la longitud en silencio, pero su q * v y su slerp reportan un error en las compilaciones de depuración; la matemática pura (q·v·q*) además escala el objeto por |q|². Normalizar, es decir, dividir por la longitud, lo corrige.",
	"gloss.slerp.title": "Slerp",
	"gloss.slerp.body":
		"Interpolación lineal esférica: un giro de A a B a velocidad angular constante por el arco más corto de la hiperesfera. Así gira con suavidad una cámara o una torreta entre dos orientaciones. Interpolar directamente los cuatro números corta a través de la esfera y acelera en el medio.",
	"gloss.shortest-path.title": "El camino más corto",
	"gloss.shortest-path.body":
		"Como q y −q son la misma orientación, hay dos arcos de A a B, uno corto y uno largo. Si el producto punto de A y B es negativo, el camino corto va hacia −B. El slerp de Godot y el Slerp de Unreal invierten B por ti, y el Slerp de Unity toma el camino corto; slerpni de Godot y SlerpFullPath de Unreal no, y pueden tomar el camino largo.",
	"gloss.hypersphere.title": "La hiperesfera y su proyección",
	"gloss.hypersphere.body":
		"Los cuaterniones unitarios son los puntos de una esfera en cuatro dimensiones. La vista 4D la aplana a tres, como un mapa aplana el globo, con una proyección estereográfica desde −1: sin giro es el centro, todo giro de 180° está sobre la esfera unitaria y un giro de 360° (−1) está en el infinito. Un giro de θ alrededor de un eje queda a tan(θ/4) a lo largo de ese eje, dibujado con la regla de la mano derecha en las direcciones de la escena.",
	"gloss.multiply.title": "Multiplicar cuaterniones",
	"gloss.multiply.body":
		"Multiplicar dos cuaterniones compone sus rotaciones, y multiplicar por q mueve a la vez cada punto de la hiperesfera. Aplicar q poco a poco lo muestra: el centro viaja hasta q y seis círculos de referencia se mueven con él. El orden importa, q₁q₂ normalmente no es q₂q₁, por la misma razón que importa el orden de Euler.",
	"gloss.alignment.title": "Vistas alineadas",
	"gloss.alignment.body":
		"Con las dos vistas alineadas, orbitar cualquiera de las cámaras orbita ambas. Como la vista 4D usa las direcciones de la escena, el punto de q queda entonces en la misma dirección de pantalla que el eje de giro del avión. Arrastrar q en la vista 4D gira el avión, y girar el avión mueve q.",
	"gloss.basis.title": "Base",
	"gloss.basis.body":
		"Los vectores derecha, arriba y adelante propios del objeto, expresados en el espacio del mundo (o del padre). Escritos como las columnas de una matriz, son la rotación. Godot guarda una Basis directamente; Unity y Unreal guardan un cuaternión y te entregan los vectores.",
	"gloss.orthonormal.title": "Ortonormal",
	"gloss.orthonormal.body":
		"Cada uno de los tres ejes mide 1, y cada par forma 90°. Solo así la base es una rotación pura; si no, además estira o tuerce. Ortonormalizar (orthonormalized en Godot) restaura ambas cosas.",
	"gloss.local-world.title": "Espacio local y espacio del mundo",
	"gloss.local-world.body":
		"Un giro alrededor del eje propio del objeto (local) y el mismo giro alrededor del eje del mundo coinciden solo mientras el objeto no está girado. Los motores te dejan elegir: Rotate de Unity recibe Space.Self o Space.World, Godot tiene rotate_object_local y global_rotate, y Unreal tiene AddActorLocalRotation y AddActorWorldRotation.",
	"gloss.drift.title": "Deriva",
	"gloss.drift.body":
		"Cada multiplicación redondea un poco. Acumula una rotación durante miles de fotogramas y el error crece hasta que el objeto se tuerce, se estira o se encoge a la vista. Renormaliza un cuaternión guardado, u ortonormaliza una base guardada, con regularidad; casi no cuesta nada.",
	"gloss.forward.title": "Adelante es una pregunta",
	"gloss.forward.body":
		"Adelante es una propiedad del objeto, no una constante. Vector3.forward (Unity), Vector3.FORWARD (Godot) y FVector::ForwardVector (Unreal) son direcciones fijas del mundo; transform.forward, −transform.basis.z y GetActorForwardVector() son las del propio objeto. Fíjate en el signo menos en Godot, donde adelante es −Z.",
	"gloss.look-at.title": "Look-at",
	"gloss.look-at.body":
		"Construye la orientación cuyo adelante apunta a un objetivo: Quaternion.LookRotation en Unity, look_at en Godot, FindLookAtRotation en Unreal. Es menos código que calcular ángulos, y acierta en los casos en que los ángulos fallan. Necesita una dirección que no sea nula, y una pista de arriba que no le sea paralela.",
	"gloss.up-hint.title": "La pista de arriba (up hint)",
	"gloss.up-hint.body":
		"Una dirección fija hacia dónde apunta la nariz, pero no cómo queda el objeto alrededor de ella. La pista de arriba fija el alabeo: de todas las maneras de mirar al objetivo, toma aquella cuyo arriba esté más cerca de la pista. Con el objetivo justo arriba, la pista es paralela a la dirección y ninguna opción es la mejor: Godot advierte y elige un alabeo arbitrario, Unity recurre a una rotación desde +Z, y la guiñada de Unreal salta cuando el objetivo pasa por encima.",
	"gloss.smooth.title": "Girar suavemente",
	"gloss.smooth.body":
		"Fijar la orientación de una vez produce un salto. Avanzar una fracción del giro restante en cada fotograma (Slerp en Unity, basis.slerp en Godot, RInterpTo en Unreal) se acerca con suavidad, y convierte un giro brusco en un barrido rápido. RotateTowards de Unity es la alternativa a velocidad fija.",
	"gloss.handedness.title": "Lateralidad",
	"gloss.handedness.body":
		"En un sistema dextrógiro (Godot) un giro positivo va en sentido antihorario cuando el eje apunta hacia ti; en uno levógiro (Unity, Unreal) va en sentido horario. Por eso el mismo giro alrededor del mismo eje es un ángulo negativo en el código de Unity y de Unreal de esta herramienta. Una diferencia de lateralidad no se corrige girando un modelo.",
	"gloss.conventions.title": "Convenciones de los motores",
	"gloss.conventions.body":
		"Unity: Y arriba, +Z adelante, levógiro, una unidad es un metro. Godot: Y arriba, −Z adelante, dextrógiro, una unidad es un metro. Unreal: Z arriba, +X adelante, levógiro, una unidad es un centímetro. Un vector o un número copiado entre motores sin convertir apunta hacia el lado equivocado, o está cien veces fuera de escala.",
	"gloss.degrees-radians.title": "Grados y radianes",
	"gloss.degrees-radians.body":
		"Los ángulos de Euler y AngleAxis de Unity usan grados. rotation y Quaternion(axis, angle) de Godot usan radianes, y rotation_degrees es la versión en grados. FRotator de Unreal usa grados y FQuat(Axis, AngleRad) radianes. Un radián son unos 57°, así que confundirlos es un error de 57 veces.",
};
