export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-brand-cream/30 py-12 px-6">
            <div className="container max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                    <h1 className="text-4xl font-bold text-brand-dark mb-4">Política de Privacidad</h1>
                    <p className="text-sm text-gray-500 mb-8">Última actualización: 16 de enero de 2026</p>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Responsable del Tratamiento</h2>
                            <p className="text-gray-700 leading-relaxed">
                                El responsable del tratamiento de sus datos personales es:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li><strong>Responsable:</strong> Jon Ibarra Borra</li>
                                <li><strong>DNI:</strong> 20171899W</li>
                                <li><strong>Domicilio:</strong> Calle Mamariga 31, 4C, 48980 Santurtzi (Vizcaya)</li>
                                <li><strong>Correo electrónico de contacto:</strong> privacidad@pack2pack.com</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Datos que Recopilamos</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Pack2Pack recopila y trata los siguientes datos personales:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li><strong>Datos de registro:</strong> Nombre completo, dirección de correo electrónico, fotografía de perfil (opcional).</li>
                                <li><strong>Datos de autenticación:</strong> Credenciales de acceso mediante Google OAuth o enlaces mágicos por email.</li>
                                <li><strong>Datos de publicación:</strong> Fotografías de productos, descripciones, precios, ubicación aproximada de recogida.</li>
                                <li><strong>Datos de comunicación:</strong> Mensajes intercambiados entre usuarios a través de la plataforma, valoraciones y comentarios.</li>
                                <li><strong>Datos de navegación:</strong> Dirección IP, tipo de dispositivo, navegador, páginas visitadas, tiempo de permanencia (datos recogidos mediante cookies).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">3. Finalidad y Base Legal del Tratamiento</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-brand-primary mb-2">Gestión del servicio de marketplace</h3>
                                    <ul className="list-disc pl-6 text-gray-700">
                                        <li><strong>Finalidad:</strong> Permitir el registro, publicación de packs y facilitación del contacto entre compradores y vendedores.</li>
                                        <li><strong>Base legal:</strong> Ejecución del contrato (artículo 6.1.b RGPD).</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-brand-primary mb-2">Comunicaciones entre usuarios</h3>
                                    <ul className="list-disc pl-6 text-gray-700">
                                        <li><strong>Finalidad:</strong> Facilitar el sistema de reservas, códigos de validación y mensajería interna.</li>
                                        <li><strong>Base legal:</strong> Ejecución del contrato (artículo 6.1.b RGPD).</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-brand-primary mb-2">Mejora de la plataforma y análisis</h3>
                                    <ul className="list-disc pl-6 text-gray-700">
                                        <li><strong>Finalidad:</strong> Análisis de uso, estadísticas y mejora de la experiencia del usuario.</li>
                                        <li><strong>Base legal:</strong> Interés legítimo (artículo 6.1.f RGPD) y consentimiento para cookies analíticas.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-brand-primary mb-2">Cumplimiento de obligaciones legales</h3>
                                    <ul className="list-disc pl-6 text-gray-700">
                                        <li><strong>Finalidad:</strong> Atender requerimientos legales, prevención de fraude y cumplimiento de la Ley de Servicios Digitales (DSA).</li>
                                        <li><strong>Base legal:</strong> Obligación legal (artículo 6.1.c RGPD).</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Tiempo de Conservación de los Datos</h2>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li><strong>Datos de cuenta activa:</strong> Mientras la cuenta permanezca activa y no se solicite la supresión.</li>
                                <li><strong>Datos de transacciones completadas:</strong> Se conservan durante 5 años desde la última interacción por obligaciones fiscales y legales.</li>
                                <li><strong>Datos de comunicaciones:</strong> Se conservan durante 1 año tras la finalización de la transacción para gestión de incidencias.</li>
                                <li><strong>Datos de navegación (cookies analíticas):</strong> Máximo 24 meses desde su recogida.</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                Transcurridos estos plazos, los datos serán eliminados o anonimizados de forma que no permitan identificar al usuario.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Destinatarios de los Datos</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Pack2Pack no vende ni cede sus datos personales a terceros. Sin embargo, puede compartir información con los siguientes destinatarios:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li><strong>Otros usuarios:</strong> Cuando publiques un pack o realices una reserva, tu nombre, foto de perfil y ubicación aproximada serán visibles para la otra parte.</li>
                                <li><strong>Proveedores de servicios tecnológicos:</strong> Supabase (base de datos y autenticación), Google (OAuth), Vercel (hosting). Estos proveedores actúan como encargados del tratamiento bajo estrictos acuerdos de confidencialidad y cumplimiento del RGPD.</li>
                                <li><strong>Autoridades competentes:</strong> Cuando sea legalmente obligatorio o necesario para la prevención de fraudes y cumplimiento de la legislación vigente.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Transferencias Internacionales de Datos</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Algunos de nuestros proveedores de servicios pueden estar ubicados fuera del Espacio Económico Europeo (EEE). En estos casos, garantizamos que dichas transferencias se realizan con las garantías adecuadas mediante cláusulas contractuales tipo aprobadas por la Comisión Europea o certificaciones de adecuación (como el Marco de Privacidad de Datos UE-EE.UU.).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">7. Derechos de los Usuarios</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                De conformidad con el RGPD, usted tiene derecho a:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li><strong>Acceso:</strong> Conocer qué datos personales tratamos sobre usted.</li>
                                <li><strong>Rectificación:</strong> Solicitar la corrección de datos inexactos o incompletos.</li>
                                <li><strong>Supresión ("derecho al olvido"):</strong> Solicitar la eliminación de sus datos cuando ya no sean necesarios o se haya retirado el consentimiento.</li>
                                <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos por motivos relacionados con su situación particular.</li>
                                <li><strong>Limitación del tratamiento:</strong> Solicitar la suspensión temporal del tratamiento en determinadas circunstancias.</li>
                                <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado y transmitirlos a otro responsable.</li>
                                <li><strong>Retirada del consentimiento:</strong> En cualquier momento, sin que ello afecte a la licitud del tratamiento basado en el consentimiento previo.</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                Para ejercer sus derechos, puede contactarnos en <a href="mailto:privacidad@pack2pack.com" className="text-brand-primary hover:underline">privacidad@pack2pack.com</a> adjuntando copia de su DNI o documento identificativo equivalente. Responderemos a su solicitud en un plazo máximo de un mes.
                            </p>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                Asimismo, tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) si considera que el tratamiento de sus datos vulnera la normativa vigente: <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">www.aepd.es</a>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">8. Seguridad de los Datos</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Pack2Pack implementa medidas técnicas y organizativas apropiadas para proteger sus datos personales frente a accesos no autorizados, pérdida, destrucción o alteración. Entre estas medidas se incluyen: cifrado de datos en tránsito (HTTPS), autenticación segura, copias de seguridad periódicas y control de acceso restringido.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">9. Limitación de Responsabilidad sobre Transacciones entre Usuarios</h2>
                            <p className="text-gray-700 leading-relaxed">
                                <strong>Pack2Pack actúa exclusivamente como plataforma intermediaria que facilita el contacto entre particulares.</strong> No somos parte de las transacciones realizadas entre compradores y vendedores, por lo que no asumimos responsabilidad sobre:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                                <li>La calidad, legalidad, seguridad o exactitud de los productos ofrecidos.</li>
                                <li>El cumplimiento de los acuerdos entre las partes.</li>
                                <li>Incidentes, disputas o daños derivados de los encuentros presenciales o el intercambio de productos.</li>
                                <li>El uso indebido de datos personales compartidos voluntariamente entre usuarios fuera de nuestra plataforma.</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                Los usuarios son responsables de actuar con diligencia, verificar la identidad de la otra parte y adoptar las precauciones necesarias en cada transacción.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">10. Modificaciones de la Política de Privacidad</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier momento para adaptarla a cambios normativos o en nuestros servicios. Notificaremos cualquier cambio significativo mediante aviso en la plataforma o por correo electrónico. Le recomendamos revisar esta política periódicamente.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">11. Contacto</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Para cualquier consulta relacionada con esta Política de Privacidad o el tratamiento de sus datos personales, puede contactarnos en:
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
