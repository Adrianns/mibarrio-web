<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { APP_NAME, EMAIL_INFO } from '$lib/config';
</script>

<SEO
	title="Términos y Condiciones"
	description="Términos y condiciones de uso de Mi Barrio. Lee nuestros términos de servicio antes de usar la plataforma."
	url="/terms"
/>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
	<Header />

	<main class="flex-1 max-w-3xl mx-auto px-4 py-12">
		<article class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Términos y Condiciones</h1>
			<p class="text-sm text-gray-500 dark:text-gray-400 mb-8">Última actualización: Enero 2025</p>

			<div class="space-y-8 text-sm leading-relaxed">
				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">1. Aceptación de los Términos</h2>
					<p class="text-gray-600 dark:text-gray-400">
						Al acceder, registrarse o utilizar {APP_NAME} de cualquier manera, el Usuario declara
						haber leído, comprendido y aceptado íntegramente estos Términos y Condiciones, incluyendo
						todas las limitaciones de responsabilidad, renuncias e indemnizaciones aquí establecidas.
						Si no está de acuerdo con alguna disposición, debe abstenerse de usar la plataforma.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">2. Definiciones</h2>
					<ul class="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-1">
						<li><strong>"Plataforma"</strong>: El sitio web y aplicación {APP_NAME}.</li>
						<li><strong>"Usuario"</strong>: Toda persona que acceda o use la Plataforma.</li>
						<li><strong>"Proveedor"</strong>: Usuario que registra un negocio o servicio en el directorio.</li>
						<li><strong>"Servicios de Terceros"</strong>: Servicios prestados por los Proveedores.</li>
					</ul>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">3. Naturaleza del Servicio - Directorio de Información</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-3">
						<strong>{APP_NAME} ES EXCLUSIVAMENTE UN DIRECTORIO DE INFORMACIÓN QUE LISTA NEGOCIOS
						Y SERVICIOS LOCALES.</strong> {APP_NAME} NO es un proveedor de servicios de ningún tipo
						ofrecido en la Plataforma.
					</p>
					<p class="text-gray-600 dark:text-gray-400 mb-3">
						La Plataforma únicamente facilita que los usuarios encuentren información de contacto de negocios y servicios. {APP_NAME}:
					</p>
					<ul class="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-1">
						<li>NO es parte de ningún contrato de servicios entre usuarios y proveedores.</li>
						<li>NO emplea, supervisa, dirige ni controla a los Proveedores.</li>
						<li>NO presta, garantiza ni avala ningún Servicio de Terceros.</li>
						<li>NO verifica la capacidad, idoneidad, habilitación ni antecedentes de los Proveedores.</li>
						<li>NO interviene en la ejecución, calidad ni resultado de los servicios.</li>
						<li>NO procesa pagos ni cobra comisiones por transacciones.</li>
					</ul>
					<p class="text-gray-600 dark:text-gray-400 mt-3">
						Los Proveedores son terceros independientes. Cualquier acuerdo de prestación se establece
						exclusivamente entre el Usuario y el Proveedor, siendo {APP_NAME} totalmente ajeno a dicha relación.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">4. Ausencia de Relación Laboral, Sociedad o Agencia</h2>
					<p class="text-gray-600 dark:text-gray-400">
						Nada de lo establecido en estos Términos se interpretará como la creación de una
						relación laboral, sociedad, joint venture, mandato, agencia, franquicia ni representación
						de ningún tipo entre {APP_NAME} y los Usuarios, ni entre {APP_NAME} y los Proveedores.
						Cada parte actúa de forma independiente y es responsable exclusivo de sus propias
						obligaciones legales, fiscales y laborales.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">5. Responsabilidades de los Usuarios</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-3">
						<strong>Los Usuarios que buscan servicios:</strong> Son exclusivamente responsables de evaluar la idoneidad
						del Proveedor, verificar referencias y antecedentes por sus propios medios, y tomar todas las
						precauciones de seguridad necesarias. La decisión de contratar es de su exclusiva responsabilidad.
					</p>
					<p class="text-gray-600 dark:text-gray-400 mb-3">
						<strong>Los Proveedores:</strong> Son exclusivamente responsables de:
					</p>
					<ul class="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-1">
						<li>La existencia, calidad, cantidad, regularidad, garantía, integridad y legitimidad
						de los servicios que ofrecen.</li>
						<li>Cumplir con todas las leyes laborales, tributarias, de seguridad social, y
						regulatorias aplicables.</li>
						<li>Obtener todos los permisos, licencias o habilitaciones requeridos.</li>
						<li>El pago de todos los impuestos, aportes y contribuciones correspondientes.</li>
						<li>La veracidad de la información publicada en su perfil.</li>
						<li>Mantener indemne a {APP_NAME} por cualquier reclamo derivado de su actividad.</li>
					</ul>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">6. Servicio Provisto "Tal Cual" (As Is)</h2>
					<p class="text-gray-600 dark:text-gray-400">
						La Plataforma se provee <strong>"EN EL ESTADO EN QUE SE ENCUENTRA"</strong>,
						<strong>"CON TODOS LOS DEFECTOS"</strong>, y <strong>"SEGÚN DISPONIBILIDAD"</strong>,
						sin garantías de ningún tipo, expresas o implícitas. Los Usuarios asumen el riesgo de utilizarla.
						{APP_NAME} no garantiza que la Plataforma funcionará sin interrupciones, errores, virus ni defectos.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">7. Exclusión Total de Responsabilidad</h2>
					<p class="text-gray-600 dark:text-gray-400 font-medium mb-3">
						EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY APLICABLE, {APP_NAME} NO SERÁ RESPONSABLE DE:
					</p>
					<ul class="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2">
						<li>Ningún daño directo, indirecto, incidental, especial, ejemplar, punitivo, derivado
						ni consecuencial de ningún tipo.</li>
						<li>Lucro cesante, pérdida de ganancias, pérdida de datos, pérdida de chances, o
						cualquier otro perjuicio económico.</li>
						<li>Lesiones personales, muerte, daños a la propiedad, robos, fraudes, estafas,
						incumplimientos contractuales, o cualquier delito cometido por Usuarios.</li>
						<li>La conducta, actos, omisiones, negligencias o dolo de los Proveedores o cualquier tercero.</li>
						<li>La veracidad, exactitud, o completitud de la información proporcionada por los Proveedores.</li>
						<li>La identidad, antecedentes penales, capacidad, habilitación, o idoneidad de los Proveedores.</li>
						<li>Cualquier transacción realizada o no realizada entre Usuarios y Proveedores.</li>
						<li>Interrupciones del servicio, fallas técnicas, pérdida de datos, o cualquier otro
						problema de la Plataforma.</li>
					</ul>
					<p class="text-gray-600 dark:text-gray-400 font-medium mt-3">
						EL USO DE LA PLATAFORMA ES BAJO EL PROPIO RIESGO DEL USUARIO.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">8. Indemnización</h2>
					<p class="text-gray-600 dark:text-gray-400">
						El Usuario acepta indemnizar, defender y mantener indemne a {APP_NAME}, sus directores,
						socios, accionistas, empleados, agentes, contratistas, licenciantes, y representantes,
						de y contra cualquier reclamo, demanda, acción judicial o administrativa, investigación,
						responsabilidad, daño, pérdida, costo, multa, sanción, o gasto de cualquier naturaleza
						(incluyendo honorarios razonables de abogados y costas) que surjan de o estén relacionados
						con: (a) el uso de la Plataforma; (b) la violación de estos Términos; (c) la prestación
						o recepción de servicios; (d) cualquier disputa entre Usuarios; (e) cualquier violación
						de leyes o derechos de terceros.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">9. Cooperación con Autoridades</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-3">
						{APP_NAME} cooperará plena e incondicionalmente con cualquier autoridad judicial,
						policial, administrativa, tributaria, o gubernamental de cualquier jurisdicción.
					</p>
					<p class="text-gray-600 dark:text-gray-400 font-medium mb-3">
						COMPARTIREMOS TODA LA INFORMACIÓN DE USUARIOS que sea requerida, incluyendo pero
						no limitado a: datos personales, fotografías, datos de contacto, direcciones IP,
						dispositivos utilizados, y cualquier otro dato disponible.
					</p>
					<p class="text-gray-600 dark:text-gray-400">
						Esta información será proporcionada ante cualquier orden judicial, citación, oficio,
						requerimiento de fiscalía, o solicitud de autoridad competente, SIN necesidad de
						notificación previa al Usuario afectado. {APP_NAME} podrá conservar copias de toda
						la información incluso después de eliminada la cuenta del Usuario.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">10. Resolución de Disputas</h2>
					<p class="text-gray-600 dark:text-gray-400">
						Cualquier disputa entre Usuarios debe resolverse directamente entre ellos, sin
						intervención de {APP_NAME}. {APP_NAME} puede, a su exclusiva y absoluta discreción,
						facilitar la comunicación pero no está obligado a mediar, arbitrar, ni resolver
						ningún conflicto. {APP_NAME} no será responsable por el resultado de ninguna disputa.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">11. Terminación</h2>
					<p class="text-gray-600 dark:text-gray-400">
						{APP_NAME} puede suspender, restringir, o terminar el acceso de cualquier Usuario
						en cualquier momento, con o sin causa, con o sin previo aviso, a su exclusiva
						discreción, sin responsabilidad alguna y sin necesidad de expresar motivos.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">12. Modificaciones</h2>
					<p class="text-gray-600 dark:text-gray-400">
						{APP_NAME} podrá modificar estos Términos en cualquier momento sin necesidad de
						notificación individual. El uso continuado de la Plataforma después de cualquier
						modificación constituye aceptación irrevocable de los nuevos Términos.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">13. Ley Aplicable y Jurisdicción Exclusiva</h2>
					<p class="text-gray-600 dark:text-gray-400">
						Estos Términos se rigen exclusivamente por las leyes de la República Oriental del
						Uruguay. Para cualquier controversia derivada de estos Términos o del uso de la
						Plataforma, las partes se someten a la jurisdicción exclusiva de los Juzgados
						Letrados de Primera Instancia en lo Civil de la ciudad de Montevideo, Uruguay,
						renunciando expresamente a cualquier otro fuero o jurisdicción que pudiera
						corresponderles.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">14. Renuncia a Acciones Colectivas</h2>
					<p class="text-gray-600 dark:text-gray-400">
						El Usuario renuncia expresamente a participar en acciones colectivas o de clase
						contra {APP_NAME} y acepta que cualquier reclamo será presentado únicamente a
						título individual.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">15. Divisibilidad</h2>
					<p class="text-gray-600 dark:text-gray-400">
						Si alguna disposición de estos Términos es declarada nula, inválida, o inaplicable,
						las demás disposiciones permanecerán en pleno vigor y efecto. La disposición inválida
						será sustituida por una válida que refleje la intención original de las partes.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">16. Acuerdo Completo</h2>
					<p class="text-gray-600 dark:text-gray-400">
						Estos Términos, junto con la Política de Privacidad, constituyen el acuerdo completo
						entre el Usuario y {APP_NAME} y reemplazan cualquier acuerdo o comunicación anterior.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">17. Contacto</h2>
					<p class="text-gray-600 dark:text-gray-400">
						Para consultas: <a href={`mailto:${EMAIL_INFO}`} class="text-primary-600 hover:underline">{EMAIL_INFO}</a>
					</p>
				</section>
			</div>
		</article>
	</main>
</div>
