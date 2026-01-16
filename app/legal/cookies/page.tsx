export default function CookiesPolicyPage() {
    return (
        <div className="min-h-screen bg-brand-cream/30 py-12 px-6">
            <div className="container max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                    <h1 className="text-4xl font-bold text-brand-dark mb-4">Política de Cookies</h1>
                    <p className="text-sm text-gray-500 mb-8">Última actualización: 16 de enero de 2026</p>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">1. ¿Qué son las Cookies?</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Las cookies son pequeños archivos de texto que se almacenan en su dispositivo (ordenador, tablet o móvil) cuando visita un sitio web. Permiten al sitio recordar sus acciones y preferencias (como idioma, tamaño de fuente o sesión de usuario) durante un período de tiempo, de modo que no tenga que volver a configurarlas cada vez que visite el sitio o navegue entre páginas.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">2. ¿Qué Cookies Utiliza Pack2Pack?</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Pack2Pack utiliza diferentes tipos de cookies según su finalidad:
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-brand-primary mb-2">2.1. Cookies Técnicas (Estrictamente Necesarias)</h3>
                                    <p className="text-gray-700 leading-relaxed mb-3">
                                        Son esenciales para el funcionamiento correcto de la plataforma y no pueden ser desactivadas. Estas cookies no recopilan información personal identificable y son necesarias para:
                                    </p>
                                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                                        <li>Mantener la sesión del usuario iniciada (autenticación).</li>
                                        <li>Recordar las preferencias de privacidad y consentimiento de cookies.</li>
                                        <li>Garantizar la seguridad y prevenir fraudes.</li>
                                        <li>Permitir la navegación y uso de funcionalidades básicas.</li>
                                    </ul>
                                    <p className="text-gray-700 leading-relaxed mt-3 italic">
                                        <strong>Base legal:</strong> Interés legítimo (artículo 6.1.f RGPD). No requieren consentimiento previo.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-brand-primary mb-2">2.2. Cookies Analíticas</h3>
                                    <p className="text-gray-700 leading-relaxed mb-3">
                                        Permiten analizar el comportamiento de los usuarios en la plataforma de forma agregada y anónima para:
                                    </p>
                                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                                        <li>Entender cómo los visitantes utilizan el sitio.</li>
                                        <li>Identificar errores técnicos o problemas de usabilidad.</li>
                                        <li>Mejorar el rendimiento y la experiencia del usuario.</li>
                                        <li>Obtener estadísticas de tráfico y páginas más visitadas.</li>
                                    </ul>
                                    <p className="text-gray-700 leading-relaxed mt-3 italic">
                                        <strong>Base legal:</strong> Consentimiento del usuario (artículo 6.1.a RGPD). Puede revocar su consentimiento en cualquier momento.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-brand-primary mb-2">2.3. Cookies de Terceros</h3>
                                    <p className="text-gray-700 leading-relaxed mb-3">
                                        Pack2Pack utiliza servicios de terceros que pueden instalar cookies propias:
                                    </p>
                                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                                        <li><strong>Google OAuth:</strong> Para facilitar el inicio de sesión con cuenta de Google.</li>
                                        <li><strong>Supabase Auth:</strong> Para gestionar la autenticación y sesiones de usuario.</li>
                                    </ul>
                                    <p className="text-gray-700 leading-relaxed mt-3">
                                        Estos terceros tienen sus propias políticas de privacidad y cookies, sobre las cuales Pack2Pack no tiene control directo. Le recomendamos revisarlas:
                                    </p>
                                    <ul className="list-none pl-6 space-y-1 text-gray-700 mt-2">
                                        <li>• <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Política de Privacidad de Google</a></li>
                                        <li>• <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Política de Privacidad de Supabase</a></li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">3. Tabla Detallada de Cookies</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                    <thead>
                                        <tr className="bg-brand-light">
                                            <th className="border border-gray-300 px-4 py-2 text-left font-bold text-brand-dark">Nombre</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left font-bold text-brand-dark">Proveedor</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left font-bold text-brand-dark">Tipo</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left font-bold text-brand-dark">Finalidad</th>
                                            <th className="border border-gray-300 px-4 py-2 text-left font-bold text-brand-dark">Duración</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-700">
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-2"><code>sb-access-token</code></td>
                                            <td className="border border-gray-300 px-4 py-2">Supabase</td>
                                            <td className="border border-gray-300 px-4 py-2">Técnica</td>
                                            <td className="border border-gray-300 px-4 py-2">Token de autenticación de sesión</td>
                                            <td className="border border-gray-300 px-4 py-2">1 hora</td>
                                        </tr>
                                        <tr className="bg-gray-50">
                                            <td className="border border-gray-300 px-4 py-2"><code>sb-refresh-token</code></td>
                                            <td className="border border-gray-300 px-4 py-2">Supabase</td>
                                            <td className="border border-gray-300 px-4 py-2">Técnica</td>
                                            <td className="border border-gray-300 px-4 py-2">Renovación automática de sesión</td>
                                            <td className="border border-gray-300 px-4 py-2">7 días</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-2"><code>cookie_consent</code></td>
                                            <td className="border border-gray-300 px-4 py-2">Pack2Pack</td>
                                            <td className="border border-gray-300 px-4 py-2">Técnica</td>
                                            <td className="border border-gray-300 px-4 py-2">Recordar preferencias de cookies</td>
                                            <td className="border border-gray-300 px-4 py-2">1 año</td>
                                        </tr>
                                        <tr className="bg-gray-50">
                                            <td className="border border-gray-300 px-4 py-2"><code>_ga</code></td>
                                            <td className="border border-gray-300 px-4 py-2">Google Analytics</td>
                                            <td className="border border-gray-300 px-4 py-2">Analítica</td>
                                            <td className="border border-gray-300 px-4 py-2">Distinguir usuarios únicos</td>
                                            <td className="border border-gray-300 px-4 py-2">2 años</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-300 px-4 py-2"><code>_gid</code></td>
                                            <td className="border border-gray-300 px-4 py-2">Google Analytics</td>
                                            <td className="border border-gray-300 px-4 py-2">Analítica</td>
                                            <td className="border border-gray-300 px-4 py-2">Distinguir usuarios únicos</td>
                                            <td className="border border-gray-300 px-4 py-2">24 horas</td>
                                        </tr>
                                        <tr className="bg-gray-50">
                                            <td className="border border-gray-300 px-4 py-2"><code>SIDCC</code></td>
                                            <td className="border border-gray-300 px-4 py-2">Google</td>
                                            <td className="border border-gray-300 px-4 py-2">Terceros</td>
                                            <td className="border border-gray-300 px-4 py-2">Seguridad y prevención de fraude (OAuth)</td>
                                            <td className="border border-gray-300 px-4 py-2">1 año</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-gray-500 mt-3 italic">
                                Nota: Esta tabla puede actualizarse cuando se incorporen nuevos servicios o funcionalidades.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">4. ¿Cómo Gestionar o Rechazar las Cookies?</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Usted puede gestionar y controlar las cookies de las siguientes formas:
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-brand-primary mb-2">4.1. Panel de Preferencias de Pack2Pack</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        Al acceder a nuestra plataforma por primera vez, se le mostrará un banner de consentimiento donde puede aceptar o rechazar cookies analíticas. Puede modificar sus preferencias en cualquier momento desde el pie de página ("Configurar Cookies").
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-brand-primary mb-2">4.2. Configuración del Navegador</h3>
                                    <p className="text-gray-700 leading-relaxed mb-2">
                                        La mayoría de los navegadores permiten gestionar cookies desde sus opciones de privacidad. A continuación, enlaces directos a las guías de los navegadores más comunes:
                                    </p>
                                    <ul className="list-none pl-6 space-y-1 text-gray-700">
                                        <li>• <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Google Chrome</a></li>
                                        <li>• <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Mozilla Firefox</a></li>
                                        <li>• <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Safari</a></li>
                                        <li>• <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Microsoft Edge</a></li>
                                    </ul>
                                    <p className="text-gray-700 leading-relaxed mt-3 text-sm italic">
                                        <strong>Importante:</strong> Si bloquea todas las cookies, incluidas las técnicas, es posible que algunas funcionalidades de Pack2Pack no funcionen correctamente (por ejemplo, no podrá mantener la sesión iniciada).
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-brand-primary mb-2">4.3. Desactivar Cookies Analíticas de Google</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        Puede instalar el complemento de inhabilitación para navegadores de Google Analytics: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">https://tools.google.com/dlpage/gaoptout</a>
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Consecuencias de Rechazar las Cookies</h2>
                            <p className="text-gray-700 leading-relaxed">
                                El rechazo de cookies analíticas no afectará al funcionamiento básico de la plataforma, pero impedirá que podamos mejorar la experiencia del usuario basándonos en datos de navegación. El bloqueo de cookies técnicas puede provocar problemas de autenticación, pérdida de sesión y dificultades para utilizar funcionalidades clave del sitio.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Actualización de la Política de Cookies</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Pack2Pack se reserva el derecho de modificar esta Política de Cookies en cualquier momento para adaptarla a cambios normativos, tecnológicos o en los servicios ofrecidos. Cualquier modificación será notificada mediante aviso en la plataforma. Le recomendamos revisar esta política periódicamente.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">7. Más Información</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Si tiene dudas sobre el uso de cookies en Pack2Pack, puede contactarnos en:
                            </p>
                            <ul className="list-none pl-0 space-y-2 text-gray-700 mt-4">
                                <li><strong>Email:</strong> <a href="mailto:privacidad@pack2pack.com" className="text-brand-primary hover:underline">privacidad@pack2pack.com</a></li>
                                <li><strong>Dirección postal:</strong> Calle Mamariga 31, 4C, 48980 Santurtzi (Vizcaya)</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
