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
	tagline:
		"Ángulos de Euler, cuaterniones, bases y look-at: girados en vivo, escritos en tres motores.",
	skipToContent: "Saltar al contenido",
	theoryToggle: "Explicación",
	languageLabel: "Idioma",
	themeToggle: "Tema oscuro",
	methodsLabel: "Método de rotación",
	"tab.euler": "Ángulos de Euler",
	"tab.quat": "Cuaternión",
	"tab.basis": "Base / matriz",
	"tab.lookat": "Look-at",
	footerMadeWith: "Hecho con ❤️ para Swinburne",
	footerSubject: "Rotación 3D",
	versionTitle: "Versión: la fecha y hora de esta publicación",
	resetDone: "Restablecido.",

	/* Vistas */
	viewLabel:
		"Vista 3D del avión: guiñada {yaw}°, cabeceo {pitch}°, alabeo {roll}°",
	viewHint:
		"Arrastra el avión para girarlo · arrastra en otro lugar para orbitar · con la vista enfocada, las flechas y Q/E lo giran (Shift para pasos más grandes)",
	viewHintLookat:
		"Arrastra el objetivo para moverlo · arrastra en otro lugar para orbitar · con la vista enfocada, las flechas y Re Pág/Av Pág mueven el objetivo",
	objectTitle: "El avión",
	hyperTitle: "q en la hiperesfera (4D, proyectada)",
	hyperLabel:
		"Proyección estereográfica del cuaternión unitario q: sin giro en el centro, todo giro de 180° sobre la esfera unitaria",
	hyperHint:
		"Arrastra para orbitar · centro = sin giro · esfera = 180° · infinito = 360°",
	hyperSphere: "w = 0 · todo giro de 180°",
	hyperIdentity: "1 · sin giro",
	hyperMinus: "−q · misma orientación",
	noWebgl:
		"Este navegador no puede dibujar en 3D (WebGL no está disponible). El código y la lectura siguen funcionando.",
	worldAxes: "Ejes del mundo",
	axisForward: "adelante",
	axisRight: "derecha",
	axisUp: "arriba",
	axisBack: "atrás",
	axisDiagonal: "Diagonal",
	axis: "Eje",
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
	liveLegend:
		"Los valores resaltados vienen de la pose en pantalla y cambian al girarla.",

	/* Controles */
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
		"Un anillo y un eje por ángulo. Los colores siguen los ejes X, Y y Z del motor.",
	showAxes: "Mostrar los ejes propios del objeto",
	axisPresets: "Eje",
	angle: "Ángulo θ",
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
	turnsHint: "Cada clic suma un giro de 15°. El código muestra el último.",
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
	reset: "Restablecer esta pestaña",
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
		"Invierte b cuando dot(a, b) < 0. El Slerp de cada motor ya lo hace por ti.",
	"break.fullpath.started":
		"Haciendo slerp hacia menos B sin la comprobación de signo.",
	"break.fullpath.done":
		"Ese fue el camino largo. El fantasma muestra el corto.",

	"break.negate.title": "q y −q",
	"break.negate.body":
		"Cada componente cambia de signo, y el avión no se mueve. En la vista 4D el punto salta al otro lado de la esfera.",
	"break.negate.action": "Negar q",
	"break.negate.fix":
		"Compara orientaciones con Angle o AngularDistance, nunca con ==.",
	"break.negate.started":
		"Todas las componentes de q negadas. El avión no se movió.",

	"break.unnormalised.title": "Olvidar normalizar",
	"break.unnormalised.body":
		"Un cuaternión cuya longitud no es 1 no es una rotación. Aplicado como q·v·q*, además escala el objeto por |q|².",
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
		"Cuando el objetivo pasa por encima, la dirección de mirada se alinea con la pista de arriba (up hint). Look-at no está definido ahí, y el avión gira de golpe 180°.",
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
	readoutHeading: "La misma orientación, de cuatro maneras",
	readoutIntro: "Tal como la reporta {engine}.",
	readEuler: "Euler, leído de vuelta",
	readQuat: "Cuaternión",
	readAxisAngle: "Eje y ángulo",
	readAxes: "Los ejes propios del objeto",
	matrixCaption:
		"La matriz de rotación en {engine}. Cada columna es a dónde va a parar ese eje.",
	healthLengths: "Longitud de las columnas (debería ser 1)",
	healthCorners: "Ángulos entre columnas (deberían ser 90°)",
	freedom: "Ángulo entre los ejes de guiñada y alabeo",
	freedomLocked: "bloqueo de cardán: dos controles, un movimiento",
	freedomHint: "90° en vuelo nivelado. Se cierra a medida que sube |cabeceo|.",
	qNorm: "Longitud |q|",
	qNotUnit: "no es una rotación",
	upAngle: "De la dirección de mirada a la pista de arriba",
	degenerateNow: "no definido: justo arriba",
	distance: "Distancia al objetivo",
	readoutScenario: "Los valores siguen al escenario mientras se reproduce.",

	/* Teoría */
	theoryHeading: "Cómo funciona",
	intro:
		"Un juego puede guardar hacia dónde mira algo de tres maneras: como tres ángulos (Euler), como cuatro números (un cuaternión) o como tres flechas (una base). Una cuarta, look-at, la construye a partir de una dirección. Cada pestaña gira el mismo avión de una manera. El código de abajo escribe esa pose en Godot, Unity y Unreal, y cambia a medida que la giras. Las tarjetas Rómpelo muestran dónde falla cada método cuando nada protege sus límites.",

	"theory.e1.title": "Tres números, aplicados en orden",
	"theory.e1.body":
		"La guiñada (yaw) gira la nariz a izquierda o derecha, el cabeceo (pitch) la levanta y el alabeo (roll) inclina las alas. Los tres motores los aplican en el mismo orden: guiñada, luego cabeceo alrededor del nuevo eje derecho, luego alabeo alrededor del nuevo eje adelante. Pero los nombran y les dan signo de forma distinta. Unity escribe nariz arriba como x negativo, Godot escribe girar a la derecha como y negativo, y Unreal los llama Pitch, Yaw y Roll. La misma pose, tres juegos de números: cambia de pestaña en el código y observa.",
	"theory.e2.title": "Bloqueo de cardán (gimbal lock)",
	"theory.e2.body":
		"Los anillos muestran los tres giros. Lleva la nariz a 90° de cabeceo y el anillo de alabeo queda plano sobre el de guiñada: la guiñada y el alabeo ahora giran alrededor del mismo eje, y uno de tus tres controles desaparece. No es un error del motor y ningún motor puede corregirlo. Es lo que significa guardar una orientación como tres giros en secuencia. La lectura muestra cómo se cierra el ángulo entre los ejes de guiñada y alabeo a medida que sube el cabeceo.",
	"theory.e3.title": "Las dos defensas",
	"theory.e3.body":
		"Limita el cabeceo a unos ±89°: una línea, y la solución estándar para una cámara en primera persona. Mejor aún, pon la guiñada y el cabeceo en objetos distintos. Aplica la guiñada al cuerpo y el cabeceo a una cámara que sea su hija. Así cada objeto gira alrededor de un solo eje, y el problema desaparece en vez de tener que administrarlo.",
	"theory.e4.title": "Leer no es escribir",
	"theory.e4.body":
		"Muchas ternas describen la misma orientación, y el motor te devuelve una de ellas, no necesariamente la tuya. Desactiva el límite, lleva el cabeceo más allá de 90° y mira la lectura: otra terna, la misma pose. Por eso sumar a rotation.y en cada fotograma produce deriva: estás sumando a un número que el motor pudo haber reescrito.",

	"theory.q1.title": "Cuatro números, sin secuencia",
	"theory.q1.body":
		"Un cuaternión guarda un solo giro alrededor de un solo eje: w = cos(θ/2) y (x, y, z) = eje · sin(θ/2). No hay orden de operaciones que equivocar, así que no hay nada que bloquear. El costo es que no se puede leer de un vistazo, y por eso todos los editores te siguen mostrando grados.",
	"theory.q2.title": "Por qué la mitad del ángulo",
	"theory.q2.body":
		"Por esas mitades, un giro de 360° no devuelve los números: w pasa de 1 a −1. Lleva el ángulo a 360° y mira cómo el avión vuelve mientras los números no. Solo a 720° coinciden los dos otra vez.",
	"theory.q3.title": "q y −q son la misma orientación",
	"theory.q3.body":
		"Cambia todos los signos y el objeto no se mueve. Así que compara orientaciones, no números: Quaternion.Angle de Unity y AngularDistance de Unreal tratan q y −q como iguales, y un == común no.",
	"theory.q4.title": "Slerp: el arco más corto",
	"theory.q4.body":
		"La interpolación esférica gira de A a B a ritmo constante por el camino más corto. El Slerp de cada motor revisa el signo primero. Omite esa revisión y, cuando los dos cuaterniones queden en mitades opuestas, el giro toma el camino largo.",
	"theory.q5.title": "La hiperesfera, proyectada (4D)",
	"theory.q5.body":
		"Cada cuaternión unitario es un punto sobre una esfera en cuatro dimensiones. La vista de la derecha la aplana a tres, como un mapa aplana el globo (una proyección estereográfica). Sin giro es el centro, todo giro de 180° está sobre la esfera unitaria y un giro de 360° está en el infinito. Un giro de θ queda a tan(θ/4) a lo largo de su eje.",
	"theory.q6.title": "Multiplicar mueve todo",
	"theory.q6.body":
		"Aplicar q poco a poco muestra lo que multiplicar por q le hace a toda la hiperesfera: el centro viaja hasta q y los círculos de referencia de colores se mueven con él. No necesitas esta aritmética para usar cuaterniones en un juego. Está aquí para cuando quieras saber por qué funcionan.",

	"theory.b1.title": "Tres flechas son la rotación",
	"theory.b1.body":
		"Una base son los vectores derecha, arriba y adelante propios del objeto, cada uno de longitud 1 y en ángulo recto con los otros. Escritos como columnas, son la matriz de rotación. Godot la guarda como Basis; Unity y Unreal la construyen a partir de un cuaternión y te entregan los vectores.",
	"theory.b2.title": "Pregúntale al objeto, no al mundo",
	"theory.b2.body":
		"Adelante es una pregunta que le haces al objeto en cada fotograma, no una constante. Vector3.forward, Vector3.FORWARD y FVector::ForwardVector nunca cambian, gire como gire el objeto. En Godot, adelante es −basis.z: olvida el signo menos y tu personaje camina hacia atrás.",
	"theory.b3.title": "Local o mundo",
	"theory.b3.body":
		"Cuando el objeto ya está girado, un giro alrededor de su propio eje (local) y el mismo giro alrededor del eje del mundo dan resultados distintos. Prueba el mismo botón en ambos modos: un giro local se aplica después de la orientación actual, y uno del mundo, antes.",
	"theory.b4.title": "Deriva",
	"theory.b4.body":
		"El error de redondeo se acumula cuando sigues multiplicando sobre una rotación guardada. Tras suficientes fotogramas las flechas ya no miden 1 ni forman ángulos rectos, y el objeto se tuerce o se encoge poco a poco. Ortonormalizar la base, o renormalizar el cuaternión, lo corrige. Es barato, así que hazlo.",

	"theory.l1.title": "Constrúyela a partir de una dirección",
	"theory.l1.body":
		"Si sabes hacia dónde debe mirar algo, pídele al motor que construya la orientación a partir de esa dirección en vez de calcular tú tres ángulos. Es menos código, y acierta en todos los casos en que los ángulos fallan.",
	"theory.l2.title": "La pista de arriba (up hint)",
	"theory.l2.body":
		"Una dirección fija hacia dónde apunta la nariz, pero no cómo quedan las alas alrededor de ella. La pista de arriba lo resuelve: de todas las maneras de mirar al objetivo, toma aquella cuyo arriba esté más cerca de este vector.",
	"theory.l3.title": "Justo arriba",
	"theory.l3.body":
		"Cuando el objetivo está directamente arriba, la dirección es paralela a la pista de arriba y no hay una manera más cercana de acomodarse. look_at() de Godot reporta un error, y los otros giran el objeto de golpe 180° cuando el objetivo pasa por encima. Mantén el objetivo por debajo de unos 89°, o usa otra pista de arriba cerca del polo.",
	"theory.l4.title": "Girar suavemente",
	"theory.l4.body":
		"Fijar la orientación de una vez produce un salto. Cerrar una fracción de la diferencia en cada fotograma (Slerp, basis.slerp, RInterpTo) gira con suavidad, y convierte un giro brusco en un barrido rápido.",

	rulesTitle: "Cuatro reglas que evitan la mayoría de los errores de rotación",
	rule1: "Fija una orientación a partir de una dirección, no de ángulos.",
	rule2:
		"Nunca sumes a los ángulos de Euler fotograma tras fotograma. Guarda tus propios ángulos y fija la rotación a partir de ellos.",
	rule3: "Limita el cabeceo antes de que llegue a 90°.",
	rule4: "Pon la guiñada y el cabeceo en objetos distintos.",

	tableTitle: "Tres motores, tres convenciones",
	selectedEngine: "(el motor elegido abajo)",
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

	refsTitle: "Para leer más",
	refEater:
		"El explorador interactivo de cuaterniones de Ben Eater y Grant Sanderson, que sigue la vista 4D de esta herramienta.",
	ref3b1b:
		"Cuaterniones y rotación 3D, explicados de forma interactiva (video, en inglés).",
	refUnity: "Rotaciones con cuaterniones y ángulos de Euler (en inglés).",
	refGodot: "Uso de transformaciones 3D.",
	refUnreal: "Sistema de coordenadas y espacios (en inglés).",
};
