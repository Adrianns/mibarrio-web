<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { APP_NAME } from '$lib/config';
</script>

<svelte:head>
	<title>Términos y Condiciones - {APP_NAME}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
	<Header />

	<main class="flex-1 max-w-3xl mx-auto px-4 py-12">
		<article class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Términos y Condiciones de Uso</h1>

			<div class="prose prose-gray dark:prose-invert max-w-none">
				<p class="text-gray-600 dark:text-gray-400 mb-6">
					Última actualización: Enero 2025
				</p>

				<section class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">1. Aceptación de los Términos</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-4">
						Al acceder y utilizar {APP_NAME}, aceptás estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no deberías usar nuestro servicio.
					</p>
				</section>

				<section class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">2. Descripción del Servicio</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-4">
						{APP_NAME} es un directorio gratuito de servicios y negocios locales en Uruguay. Conectamos a usuarios que buscan servicios con proveedores que los ofrecen.
					</p>
					<ul class="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
						<li>Los proveedores pueden registrar su negocio o servicio de forma gratuita</li>
						<li>Los usuarios pueden buscar y contactar proveedores</li>
						<li>No cobramos comisiones por transacciones realizadas fuera de la plataforma</li>
					</ul>
				</section>

				<section class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">3. Registro y Cuenta</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-4">
						Para registrar un negocio o servicio, debés crear una cuenta proporcionando información veraz y actualizada. Sos responsable de:
					</p>
					<ul class="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
						<li>Mantener la confidencialidad de tu contraseña</li>
						<li>Todas las actividades que ocurran bajo tu cuenta</li>
						<li>Notificarnos inmediatamente sobre cualquier uso no autorizado</li>
					</ul>
				</section>

				<section class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">4. Contenido de los Proveedores</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-4">
						Los proveedores son responsables del contenido que publican. Al publicar contenido en {APP_NAME}, garantizás que:
					</p>
					<ul class="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
						<li>Tenés derecho a publicar dicho contenido</li>
						<li>El contenido es veraz y no engañoso</li>
						<li>No infringe derechos de terceros</li>
						<li>Cumple con todas las leyes aplicables</li>
					</ul>
				</section>

				<section class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">5. Conducta Prohibida</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-4">
						Está prohibido:
					</p>
					<ul class="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
						<li>Publicar información falsa o engañosa</li>
						<li>Suplantar la identidad de otra persona o negocio</li>
						<li>Publicar contenido ofensivo, ilegal o inapropiado</li>
						<li>Usar la plataforma para spam o publicidad no autorizada</li>
						<li>Intentar acceder a cuentas de otros usuarios</li>
						<li>Interferir con el funcionamiento de la plataforma</li>
					</ul>
				</section>

				<section class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">6. Limitación de Responsabilidad</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-4">
						{APP_NAME} actúa únicamente como intermediario entre usuarios y proveedores. No somos responsables de:
					</p>
					<ul class="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
						<li>La calidad de los servicios prestados por los proveedores</li>
						<li>Disputas entre usuarios y proveedores</li>
						<li>Pérdidas o daños derivados del uso de la plataforma</li>
						<li>La veracidad de la información publicada por los proveedores</li>
					</ul>
				</section>

				<section class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">7. Modificaciones</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-4">
						Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en esta página. El uso continuado de la plataforma después de los cambios constituye tu aceptación de los nuevos términos.
					</p>
				</section>

				<section class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">8. Terminación</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-4">
						Podemos suspender o terminar tu acceso a {APP_NAME} en cualquier momento, sin previo aviso, si consideramos que has violado estos términos o por cualquier otra razón a nuestra discreción.
					</p>
				</section>

				<section class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">9. Ley Aplicable</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-4">
						Estos términos se rigen por las leyes de la República Oriental del Uruguay. Cualquier disputa será sometida a la jurisdicción de los tribunales competentes de Montevideo, Uruguay.
					</p>
				</section>

				<section>
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">10. Contacto</h2>
					<p class="text-gray-600 dark:text-gray-400">
						Si tenés preguntas sobre estos términos, podés contactarnos a través de la plataforma.
					</p>
				</section>
			</div>
		</article>
	</main>
</div>
