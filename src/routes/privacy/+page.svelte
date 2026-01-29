<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { APP_NAME } from '$lib/config';
</script>

<svelte:head>
	<title>Política de Privacidad - {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
	<Header />

	<main class="flex-1 max-w-3xl mx-auto px-4 py-12">
		<article class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Política de Privacidad</h1>
			<p class="text-sm text-gray-500 dark:text-gray-400 mb-8">Última actualización: Enero 2025</p>

			<div class="space-y-8 text-sm leading-relaxed">
				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">1. Aceptación</h2>
					<p class="text-gray-600 dark:text-gray-400">
						Al utilizar {APP_NAME}, el Usuario acepta expresamente esta Política de Privacidad
						y el tratamiento de sus datos personales conforme a lo aquí establecido. Si no está
						de acuerdo, debe abstenerse de usar la Plataforma.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">2. Información que Recopilamos</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-3">
						Recopilamos y almacenamos la siguiente información:
					</p>
					<ul class="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-1">
						<li><strong>Datos de registro:</strong> nombre completo, email, contraseña.</li>
						<li><strong>Información del negocio:</strong> nombre comercial, descripción, categorías,
						ubicación, información de contacto, fotos.</li>
						<li><strong>Datos técnicos:</strong> dirección IP, tipo de dispositivo, navegador, sistema
						operativo, cookies, identificadores únicos.</li>
						<li><strong>Datos de ubicación:</strong> departamento y barrio seleccionados.</li>
						<li><strong>Datos de uso:</strong> páginas visitadas, búsquedas realizadas, funciones utilizadas.</li>
					</ul>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">3. Uso de la Información</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-3">
						Utilizamos la información recopilada para:
					</p>
					<ul class="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-1">
						<li>Proporcionar, mantener y mejorar los servicios de la Plataforma.</li>
						<li>Mostrar perfiles de negocios en el directorio.</li>
						<li>Facilitar que los usuarios encuentren y contacten proveedores.</li>
						<li>Enviar notificaciones y comunicaciones sobre la cuenta.</li>
						<li>Prevenir, detectar e investigar fraudes, abusos y actividades ilegales.</li>
						<li>Cumplir con obligaciones legales y requerimientos de autoridades.</li>
						<li>Realizar análisis estadísticos y mejorar nuestros servicios.</li>
						<li>Cualquier otro uso relacionado con la operación de la Plataforma.</li>
					</ul>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">4. Información Pública</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-3">
						Al registrar un negocio, la siguiente información será visible públicamente en el directorio:
					</p>
					<ul class="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-1">
						<li>Nombre del negocio o servicio</li>
						<li>Descripción y categorías</li>
						<li>Ubicación (departamento y barrio)</li>
						<li>Información de contacto que el Proveedor decida mostrar</li>
						<li>Fotos subidas</li>
					</ul>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">5. Divulgación de Información</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-3">
						Compartimos información del Usuario en los siguientes casos:
					</p>
					<ul class="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2">
						<li>
							<strong>Información pública:</strong> La información del perfil de negocio es
							visible para todos los usuarios del directorio.
						</li>
						<li>
							<strong>Con proveedores de servicios:</strong> Compartimos datos con terceros que
							nos ayudan a operar (servicios de hosting, análisis, etc.).
						</li>
						<li>
							<strong>Con autoridades:</strong> Proporcionaremos TODA la información del Usuario
							que sea requerida por cualquier autoridad judicial, policial, fiscal, administrativa,
							tributaria, o gubernamental, en respuesta a órdenes judiciales, citaciones, oficios,
							investigaciones, o cualquier requerimiento legal, CON O SIN NOTIFICACIÓN PREVIA al
							Usuario afectado.
						</li>
						<li>
							<strong>Para proteger derechos:</strong> Cuando sea necesario para proteger los
							derechos, propiedad o seguridad de {APP_NAME}, nuestros Usuarios, o terceros.
						</li>
						<li>
							<strong>En caso de transacciones corporativas:</strong> En caso de fusión, adquisición,
							venta de activos, o reestructuración, la información del Usuario podrá ser transferida.
						</li>
					</ul>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">6. Cooperación con Autoridades</h2>
					<p class="text-gray-600 dark:text-gray-400 font-medium mb-3">
						{APP_NAME} COOPERARÁ PLENA E INCONDICIONALMENTE CON CUALQUIER AUTORIDAD.
					</p>
					<p class="text-gray-600 dark:text-gray-400 mb-3">
						Ante cualquier requerimiento legal, proporcionaremos sin limitación:
					</p>
					<ul class="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-1">
						<li>Datos personales completos del Usuario</li>
						<li>Historial de actividad en la plataforma</li>
						<li>Direcciones IP y datos de dispositivos</li>
						<li>Cualquier otro dato disponible en nuestros sistemas</li>
					</ul>
					<p class="text-gray-600 dark:text-gray-400 mt-3">
						Esta cooperación se realizará sin necesidad de notificación previa al Usuario y
						{APP_NAME} no será responsable de ningún perjuicio que esto pudiera ocasionar.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">7. Retención de Datos</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-3">
						Conservamos la información del Usuario mientras su cuenta esté activa y por un
						período adicional después de su cierre según sea necesario para:
					</p>
					<ul class="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-1">
						<li>Cumplir con obligaciones legales y regulatorias.</li>
						<li>Resolver disputas y hacer cumplir acuerdos.</li>
						<li>Prevenir fraudes y abusos.</li>
						<li>Responder a requerimientos de autoridades.</li>
						<li>Fines estadísticos y de archivo.</li>
					</ul>
					<p class="text-gray-600 dark:text-gray-400 mt-3">
						{APP_NAME} puede conservar copias de seguridad de la información incluso después
						de eliminada la cuenta, por el tiempo que considere necesario.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">8. Seguridad</h2>
					<p class="text-gray-600 dark:text-gray-400">
						Implementamos medidas de seguridad técnicas y organizativas razonables para proteger
						la información. Sin embargo, ningún sistema de transmisión o almacenamiento de datos
						es 100% seguro. {APP_NAME} no garantiza la seguridad absoluta de la información y
						no será responsable de accesos no autorizados, hackeos, pérdidas o filtraciones de datos.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">9. Derechos del Usuario</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-3">
						Sujeto a la legislación aplicable y a las necesidades operativas y legales de
						{APP_NAME}, el Usuario puede solicitar:
					</p>
					<ul class="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-1">
						<li>Acceso a su información personal.</li>
						<li>Corrección de datos incorrectos.</li>
						<li>Eliminación de su cuenta (sujeta a retención por obligaciones legales).</li>
					</ul>
					<p class="text-gray-600 dark:text-gray-400 mt-3">
						Para ejercer estos derechos, contacte a info@mibarrio.com.uy. {APP_NAME} podrá
						rechazar solicitudes en ciertos casos permitidos por la ley.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">10. Cookies y Tecnologías de Rastreo</h2>
					<p class="text-gray-600 dark:text-gray-400">
						Utilizamos cookies, pixels, y tecnologías similares para mantener sesiones,
						recordar preferencias, analizar el uso, y mejorar la experiencia. Al usar la
						Plataforma, el Usuario acepta el uso de estas tecnologías.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">11. Menores de Edad</h2>
					<p class="text-gray-600 dark:text-gray-400">
						{APP_NAME} no está dirigido a menores de 18 años. No recopilamos intencionalmente
						información de menores. Si un padre o tutor descubre que un menor proporcionó
						información, debe contactarnos para su eliminación.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">12. Transferencias Internacionales</h2>
					<p class="text-gray-600 dark:text-gray-400">
						La información del Usuario puede ser almacenada y procesada en servidores ubicados
						en cualquier país donde {APP_NAME} o sus proveedores operen. Al usar la Plataforma,
						el Usuario consiente expresamente a estas transferencias internacionales de datos.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">13. Modificaciones</h2>
					<p class="text-gray-600 dark:text-gray-400">
						{APP_NAME} puede modificar esta Política en cualquier momento. El uso continuado
						de la Plataforma después de cualquier modificación constituye aceptación de la
						nueva Política.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">14. Ley Aplicable</h2>
					<p class="text-gray-600 dark:text-gray-400">
						Esta Política se rige por las leyes de la República Oriental del Uruguay.
					</p>
				</section>

				<section>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">15. Contacto</h2>
					<p class="text-gray-600 dark:text-gray-400">
						Para consultas sobre privacidad: info@mibarrio.com.uy
					</p>
				</section>
			</div>
		</article>
	</main>
</div>
