export default function TermsPage() {
    return (
        <div className="min-h-screen bg-brand-cream/30 py-12 px-6">
            <div className="container max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                    <h1 className="text-4xl font-bold text-brand-dark mb-4">Términos y Condiciones de Uso</h1>
                    <p className="text-sm text-gray-500 mb-8">Última actualización: 16 de enero de 2026</p>

                    <div className="prose prose-lg max-w-none space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Información General</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Los presentes Términos y Condiciones regulan el acceso y uso de la plataforma web Pack2Pack (en adelante, "la Plataforma"), titularidad de:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li><strong>Titular:</strong> Jon Ibarra Borra</li>
                                <li><strong>DNI:</strong> 20171899W</li>
                                <li><strong>Domicilio:</strong> Calle Mamariga 31, 4C, 48980 Santurtzi (Vizcaya)</li>
                                <li><strong>Email de contacto:</strong> contacto@pack2pack.com</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                Al acceder y utilizar Pack2Pack, usted acepta de forma expresa y sin reservas estos Términos y Condiciones, así como la Política de Privacidad y la Política de Cookies. Si no está de acuerdo, le rogamos que no utilice nuestros servicios.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Objeto y Naturaleza del Servicio</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Pack2Pack es una plataforma digital de intermediación que <strong>facilita el contacto entre particulares</strong> (compradores y vendedores) para el intercambio de productos excedentes, como alimentos, ropa, libros, juguetes, artículos de hogar y otros bienes de segunda mano o excedentes.
                            </p>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                <strong className="text-brand-primary">IMPORTANTE:</strong> Pack2Pack <strong>NO</strong> es parte de las transacciones entre usuarios. Nuestra función se limita a:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Proporcionar una herramienta tecnológica para publicar y buscar productos.</li>
                                <li>Facilitar la comunicación y coordinación entre compradores y vendedores.</li>
                                <li>Gestionar el sistema de reservas y códigos de validación.</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                Pack2Pack <strong>NO interviene</strong> en la negociación, entrega, pago, calidad o legalidad de los productos ofrecidos. La relación contractual se establece directamente entre comprador y vendedor, siendo ambos los únicos responsables del cumplimiento de sus obligaciones.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">3. Registro y Cuenta de Usuario</h2>
                            
                            <h3 className="text-xl font-semibold text-brand-primary mb-3">3.1. Requisitos de Registro</h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Para utilizar las funcionalidades de publicación y reserva de packs, es necesario crear una cuenta de usuario. Al registrarse, usted declara y garantiza que:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Es mayor de 18 años o cuenta con autorización de sus padres o tutores legales.</li>
                                <li>Toda la información proporcionada es veraz, completa y actualizada.</li>
                                <li>Utilizará la cuenta de forma responsable y conforme a la legislación vigente.</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-brand-primary mb-3 mt-6">3.2. Seguridad de la Cuenta</h3>
                            <p className="text-gray-700 leading-relaxed">
                                Usted es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades realizadas desde su cuenta. Debe notificar inmediatamente a Pack2Pack cualquier uso no autorizado o sospecha de vulneración de seguridad.
                            </p>

                            <h3 className="text-xl font-semibold text-brand-primary mb-3 mt-6">3.3. Suspensión y Cancelación de Cuenta</h3>
                            <p className="text-gray-700 leading-relaxed">
                                Pack2Pack se reserva el derecho de suspender o cancelar cuentas de usuarios que:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
                                <li>Incumplan estos Términos y Condiciones.</li>
                                <li>Publiquen contenido ilegal, ofensivo o fraudulento.</li>
                                <li>Realicen prácticas abusivas o perjudiciales para otros usuarios o la Plataforma.</li>
                                <li>Proporcionen información falsa o suplanten identidades.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Normas de Publicación de Packs</h2>
                            
                            <h3 className="text-xl font-semibold text-brand-primary mb-3">4.1. Contenido Permitido</h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Los usuarios pueden publicar packs de productos que:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Sean de su propiedad legítima.</li>
                                <li>Estén en buen estado y sean aptos para su uso.</li>
                                <li>Cumplan con la legislación aplicable (seguridad alimentaria, normativa de productos, etc.).</li>
                                <li>No infrinjan derechos de terceros (propiedad intelectual, marcas, etc.).</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-brand-primary mb-3 mt-6">4.2. Contenido Prohibido</h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Queda <strong>estrictamente prohibido</strong> publicar:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Productos ilegales, robados o falsificados.</li>
                                <li>Alimentos en mal estado, caducados o que presenten riesgos para la salud.</li>
                                <li>Sustancias peligrosas, armas, explosivos o material tóxico.</li>
                                <li>Productos que infrinjan derechos de propiedad intelectual o marcas registradas.</li>
                                <li>Contenido pornográfico, violento, discriminatorio o que incite al odio.</li>
                                <li>Medicamentos sin receta o productos sanitarios no autorizados.</li>
                                <li>Animales vivos o productos derivados de especies protegidas.</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-brand-primary mb-3 mt-6">4.3. Veracidad de la Información</h3>
                            <p className="text-gray-700 leading-relaxed">
                                El vendedor es responsable de proporcionar información veraz, completa y actualizada sobre los productos ofrecidos, incluyendo fotografías reales, descripción detallada, precio, ubicación de recogida y ventanas horarias disponibles.
                            </p>

                            <h3 className="text-xl font-semibold text-brand-primary mb-3 mt-6">4.4. Moderación de Contenido</h3>
                            <p className="text-gray-700 leading-relaxed">
                                Pack2Pack se reserva el derecho de revisar, moderar o eliminar publicaciones que incumplan estas normas, sin previo aviso y sin que ello genere derecho a indemnización. No obstante, Pack2Pack no realiza una verificación exhaustiva de todo el contenido publicado y no puede garantizar su legalidad o exactitud.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Proceso de Compra y Reserva</h2>
                            
                            <h3 className="text-xl font-semibold text-brand-primary mb-3">5.1. Sistema de Reserva</h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Cuando un comprador reserva un pack:
                            </p>
                            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                                <li>El pack queda marcado como "reservado" y no visible para otros usuarios.</li>
                                <li>Se genera un código de validación de 4 dígitos que el comprador debe mostrar al vendedor en el momento de la recogida.</li>
                                <li>Ambas partes reciben notificaciones con los detalles de la reserva (punto de encuentro, ventana horaria, código).</li>
                            </ol>

                            <h3 className="text-xl font-semibold text-brand-primary mb-3 mt-6">5.2. Confirmación de Entrega</h3>
                            <p className="text-gray-700 leading-relaxed">
                                Una vez realizada la entrega, ambas partes deben confirmar la transacción en la Plataforma:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-2">
                                <li><strong>Vendedor:</strong> Valida el código de 4 dígitos proporcionado por el comprador.</li>
                                <li><strong>Comprador:</strong> Confirma la recepción del pack.</li>
                                <li>Solo cuando ambas validaciones se completan, el pack se marca como "vendido".</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-brand-primary mb-3 mt-6">5.3. Cancelaciones</h3>
                            <p className="text-gray-700 leading-relaxed">
                                El comprador puede cancelar una reserva antes de la ventana horaria acordada. En caso de cancelación, el pack volverá a estar disponible automáticamente. Cancelaciones repetidas o abusivas pueden resultar en la suspensión de la cuenta.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Condiciones de Pago</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                <strong className="text-brand-primary">Pack2Pack NO gestiona pagos.</strong> Las transacciones económicas se realizan directamente entre comprador y vendedor, preferiblemente en efectivo en el momento de la entrega.
                            </p>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Si las partes acuerdan otro método de pago (transferencia bancaria, Bizum, etc.), lo hacen bajo su exclusiva responsabilidad. Pack2Pack no interviene ni asume responsabilidad alguna sobre:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Disputas relacionadas con el pago o devoluciones.</li>
                                <li>Fraudes, estafas o incumplimientos de pago.</li>
                                <li>Problemas derivados del uso de métodos de pago inseguros.</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                <strong>Recomendación:</strong> Realice el pago únicamente tras verificar el producto en persona.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">7. Responsabilidades del Vendedor</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                El vendedor se compromete a:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Publicar información veraz y fotografías reales de los productos.</li>
                                <li>Garantizar que los productos cumplen con la normativa legal aplicable (especialmente en el caso de alimentos).</li>
                                <li>Respetar las ventanas horarias acordadas y el punto de recogida especificado.</li>
                                <li>Entregar los productos en las condiciones descritas.</li>
                                <li>Validar el código de recogida proporcionado por el comprador antes de entregar el pack.</li>
                                <li>No cancelar reservas confirmadas sin causa justificada.</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                El vendedor es el único responsable de la calidad, seguridad y legalidad de los productos ofrecidos. Pack2Pack no verifica ni garantiza estas características.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">8. Responsabilidades del Comprador</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                El comprador se compromete a:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Acudir al punto de encuentro en la ventana horaria reservada.</li>
                                <li>Verificar el producto antes de aceptarlo y realizar el pago.</li>
                                <li>Mostrar el código de validación de 4 dígitos al vendedor.</li>
                                <li>Confirmar la recepción del pack en la Plataforma una vez completada la entrega.</li>
                                <li>Cancelar la reserva con antelación suficiente si no puede asistir.</li>
                                <li>Actuar con respeto y buena fe hacia el vendedor.</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                El comprador es responsable de evaluar la idoneidad del producto para su consumo o uso, especialmente en el caso de alimentos o productos sensibles.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">9. Derecho de Desistimiento</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                <strong className="text-brand-primary">NO APLICA el derecho de desistimiento</strong> previsto en la normativa de consumidores y usuarios en las siguientes circunstancias:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Pack2Pack no es vendedor ni parte de la transacción; solo facilita el contacto entre particulares.</li>
                                <li>Las transacciones se realizan entre particulares (C2C - Consumer to Consumer), no entre empresario y consumidor (B2C).</li>
                                <li>En el caso de alimentos perecederos, el derecho de desistimiento no aplica por razones de seguridad e higiene.</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                Las partes deben resolver amigablemente cualquier disputa sobre el producto. Pack2Pack no interviene en devoluciones ni reembolsos.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">10. Gestión de Disputas y Reclamaciones</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                En caso de conflicto entre comprador y vendedor, se recomienda:
                            </p>
                            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                                <li>Intentar resolver la situación de forma amistosa mediante comunicación directa.</li>
                                <li>Documentar el problema con fotografías o mensajes si es necesario.</li>
                                <li>Contactar con Pack2Pack en <a href="mailto:soporte@pack2pack.com" className="text-brand-primary hover:underline">soporte@pack2pack.com</a> para mediación voluntaria.</li>
                            </ol>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                <strong>Importante:</strong> Pack2Pack ofrece mediación como servicio de buena fe, pero no tiene obligación de resolver disputas ni asumir responsabilidades derivadas de transacciones entre usuarios. En casos graves o reiterados, Pack2Pack podrá suspender cuentas de usuarios implicados.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">11. Sistema de Valoraciones</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Tras completar una transacción, ambas partes pueden valorar su experiencia (puntuación de 1 a 5 estrellas y comentario opcional). Las valoraciones son públicas y contribuyen a generar confianza en la comunidad.
                            </p>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Pack2Pack se reserva el derecho de eliminar valoraciones que:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Contengan insultos, amenazas o lenguaje ofensivo.</li>
                                <li>Incluyan datos personales sensibles de terceros.</li>
                                <li>Sean falsas o manipuladas con fines fraudulentos.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">12. Limitación de Responsabilidad de Pack2Pack</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                <strong className="text-brand-primary">Pack2Pack NO asume responsabilidad alguna por:</strong>
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>La calidad, seguridad, legalidad o exactitud de los productos publicados por los usuarios.</li>
                                <li>Incumplimientos de las obligaciones entre comprador y vendedor (entregas, pagos, cancelaciones).</li>
                                <li>Daños personales, materiales o económicos derivados de las transacciones entre usuarios.</li>
                                <li>Problemas de salud causados por el consumo de alimentos u otros productos adquiridos.</li>
                                <li>Incidentes ocurridos durante los encuentros presenciales (robos, agresiones, accidentes).</li>
                                <li>Pérdida de datos, interrupciones del servicio o errores técnicos en la Plataforma.</li>
                                <li>Uso indebido de la Plataforma por parte de terceros.</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                <strong>Recomendación de seguridad:</strong> Acuda siempre a lugares públicos y bien iluminados para realizar las entregas. No comparta información personal sensible (dirección completa, datos bancarios) fuera de la Plataforma.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">13. Propiedad Intelectual e Industrial</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Todos los contenidos de la Plataforma (diseño, logotipos, textos, código fuente, estructura, etc.) son propiedad de Pack2Pack o están debidamente licenciados. Queda prohibida su reproducción, distribución, comunicación pública o transformación sin autorización expresa.
                            </p>
                            <p className="text-gray-700 leading-relaxed mt-4">
                                Los usuarios conservan los derechos sobre las fotografías y descripciones que publican, pero otorgan a Pack2Pack una licencia no exclusiva para mostrarlas en la Plataforma y materiales promocionales.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">14. Modificación de los Términos y Condiciones</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Pack2Pack se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento para adaptarlos a cambios normativos o en los servicios ofrecidos. Los cambios significativos serán notificados mediante aviso en la Plataforma o por correo electrónico. El uso continuado de la Plataforma tras la publicación de las modificaciones implica la aceptación de las mismas.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">15. Legislación Aplicable y Jurisdicción</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Estos Términos y Condiciones se rigen por la legislación española. Para la resolución de cualquier controversia derivada del uso de Pack2Pack, las partes se someten expresamente a los Juzgados y Tribunales de Bilbao (Vizcaya), salvo que la normativa de consumidores y usuarios establezca otra jurisdicción preferente.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-brand-dark mb-4">16. Contacto</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Para cualquier duda, consulta o reclamación relacionada con estos Términos y Condiciones, puede contactarnos en:
                            </p>
                            <ul className="list-none pl-0 space-y-2 text-gray-700 mt-4">
                                <li><strong>Email:</strong> <a href="mailto:contacto@pack2pack.com" className="text-brand-primary hover:underline">contacto@pack2pack.com</a></li>
                                <li><strong>Dirección postal:</strong> Calle Mamariga 31, 4C, 48980 Santurtzi (Vizcaya)</li>
                            </ul>
                        </section>

                        <div className="mt-12 p-6 bg-brand-light/50 rounded-xl border border-brand-primary/20">
                            <p className="text-sm text-gray-700 leading-relaxed">
                                <strong>Declaración final:</strong> Al utilizar Pack2Pack, usted reconoce haber leído, comprendido y aceptado íntegramente estos Términos y Condiciones, así como la Política de Privacidad y la Política de Cookies. Si no está de acuerdo con alguna de estas condiciones, le rogamos que no utilice la Plataforma.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
