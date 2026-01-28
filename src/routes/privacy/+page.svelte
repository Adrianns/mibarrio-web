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
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">Política de Privacidad</h1>

			<div class="prose prose-gray dark:prose-invert max-w-none">
				<p class="text-gray-600 dark:text-gray-400 mb-6">
					Última actualización: Enero 2025
				</p>

				<section class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">1. Información que Recopilamos</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-4">
						Recopilamos información que nos proporcionás directamente al usar {APP_NAME}:
					</p>
					<ul class="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
						<li><strong>Datos de cuenta:</strong> nombre, email, contraseña</li>
						<li><strong>Datos del negocio:</strong> nombre comercial, descripción, categorías, ubicación, información de contacto</li>
						<li><strong>Contenido:</strong> fotos, descripciones y otra información que publiques</li>
						<li><strong>Datos de uso:</strong> páginas visitadas, búsquedas realizadas, interacciones con la plataforma</li>
					</ul>
				</section>

				<section class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">2. Cómo Usamos tu Información</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-4">
						Utilizamos la información recopilada para:
					</p>
					<ul class="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
						<li>Proporcionar y mantener el servicio</li>
						<li>Mostrar tu perfil de negocio a usuarios que buscan servicios</li>
						<li>Enviarte comunicaciones relacionadas con el servicio</li>
						<li>Mejorar y personalizar la experiencia de usuario</li>
						<li>Analizar el uso de la plataforma para mejoras</li>
						<li>Prevenir fraudes y abusos</li>
					</ul>
				</section>

				<section class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">3. Información Pública</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-4">
						Al registrar un negocio o servicio, la siguiente información será visible públicamente:
					</p>
					<ul class="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
						<li>Nombre del negocio o servicio</li>
						<li>Descripción y categorías</li>
						<li>Ubicación (departamento y barrio)</li>
						<li>Información de contacto que decidas mostrar</li>
						<li>Fotos que subas</li>
					</ul>
					<p class="text-gray-600 dark:text-gray-400 mt-4">
						Podés elegir qué información de contacto mostrar en tu perfil público.
					</p>
				</section>

				<section class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">4. Compartir Información</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-4">
						No vendemos tu información personal. Podemos compartir información en los siguientes casos:
					</p>
					<ul class="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
						<li>Con tu consentimiento explícito</li>
						<li>Para cumplir con obligaciones legales</li>
						<li>Para proteger nuestros derechos y seguridad</li>
						<li>Con proveedores de servicios que nos ayudan a operar la plataforma (hosting, analytics)</li>
					</ul>
				</section>

				<section class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">5. Seguridad de los Datos</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-4">
						Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:
					</p>
					<ul class="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
						<li>Encriptación de datos en tránsito (HTTPS)</li>
						<li>Almacenamiento seguro de contraseñas (hash)</li>
						<li>Acceso restringido a datos personales</li>
						<li>Monitoreo de seguridad continuo</li>
					</ul>
				</section>

				<section class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">6. Tus Derechos</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-4">
						Tenés derecho a:
					</p>
					<ul class="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
						<li><strong>Acceder</strong> a tu información personal</li>
						<li><strong>Corregir</strong> datos inexactos o incompletos</li>
						<li><strong>Eliminar</strong> tu cuenta y datos asociados</li>
						<li><strong>Exportar</strong> tus datos en un formato portable</li>
						<li><strong>Oponerte</strong> al procesamiento de tus datos para marketing</li>
					</ul>
					<p class="text-gray-600 dark:text-gray-400 mt-4">
						Para ejercer estos derechos, contactanos a través de la plataforma.
					</p>
				</section>

				<section class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">7. Cookies y Tecnologías Similares</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-4">
						Utilizamos cookies y tecnologías similares para:
					</p>
					<ul class="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
						<li>Mantener tu sesión iniciada</li>
						<li>Recordar tus preferencias (tema oscuro/claro)</li>
						<li>Analizar el uso de la plataforma</li>
					</ul>
				</section>

				<section class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">8. Retención de Datos</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-4">
						Conservamos tu información mientras tu cuenta esté activa o según sea necesario para proporcionarte el servicio. Si eliminás tu cuenta, eliminaremos tus datos personales dentro de los 30 días, excepto cuando la ley requiera su conservación.
					</p>
				</section>

				<section class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">9. Cambios a esta Política</h2>
					<p class="text-gray-600 dark:text-gray-400 mb-4">
						Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre cambios significativos publicando la nueva política en esta página y, si los cambios son sustanciales, te enviaremos una notificación.
					</p>
				</section>

				<section>
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">10. Contacto</h2>
					<p class="text-gray-600 dark:text-gray-400">
						Si tenés preguntas sobre esta política de privacidad o sobre cómo manejamos tus datos, contactanos a través de la plataforma.
					</p>
				</section>
			</div>
		</article>
	</main>
</div>
