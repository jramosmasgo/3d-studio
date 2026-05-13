import TopNavBar from "../../components/TopNavBar";
import Footer from "../../components/Footer";
import Image from "next/image";
import Link from "next/link";

export default function ProductDetailPage() {
  return (
    <>
      <TopNavBar />
      <main className="max-w-[1440px] mx-auto px-8 md:px-16 py-12 lg:py-24 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Gallery Section */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="relative group overflow-hidden bg-surface-container-low aspect-[4/5] md:aspect-square flex items-center justify-center rounded-sm">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrB5nBeijCzZc4xE3zLNPKIJEyV8T8F--zUs46HMq7sSm7PP23ydFUoIWY3vHF4fw9FJGupOTf8_evww9w-gyJta5gKphvNH0Yw5h4X5eNN-Wp-ao1xiu71HR75whYQ1q0NyKvug078XUyqHh-HXjDcJa9VRT7X4v_iyP6-umz_CMM9GIThR0gJaVDmB72LF8XifNUNEyYuB7qRfwkqmpUYO2HFzYewHQPaDfxGIFbnMUjERLYmRlXkoNVsQrMTUlwCgDHmxTW93Uw"
                alt="Ronin Cyber-Gen Vista Principal"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-surface-container-low aspect-square overflow-hidden group relative rounded-sm">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3_LHVs7lW5YtkB8KODtB_N56nIOUmTdkvmbRucmvwayNX1NNElvQi20gqxNGyeFDk0DdzkC4tjCtXYZk0DD1CGOT6GRabCkcqzakcQ0L-xIhbTQ7euSoqTRj5IVxctOwIZ_kAIYjRF4p5AQdQwdxaPZK-yL2VoWrL93JyoykL25D2WJGURnwKaQ2uV9X2Y5YojJCbM3avrYHQ_eDDnmUd77RDNh6t_EZFbj9AAapzvgZqrH88Lzt0S7giNDHBrewZTpwXEPLmdevq"
                  alt="Ronin Cyber-Gen Detalle Macro"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  unoptimized
                />
              </div>
              <div className="bg-surface-container-low aspect-square overflow-hidden group relative rounded-sm">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4c6hZlKLZGW0SoE3bIZ9N7UWQNThgKYwAcQdcpzmBl4VDioMF3ZnZHUledpYmEWmnZC-Be-HXjgoU_hIRPH2l1jDRplEisTQgY0VSTmE9Cp-Bb7Czf0rRve1ASoZm6jHO_BV-fcOQB3opzUfXp78xZFy9OLJ9B_sUHVjb5oX75SDxomOzYyE3xhnbwX6Whj5RNZs5HH1o5yqINRpPlqhk9SVzok32P0_hy3TL3iDUSnr2dapqwrlQVtp1yecPGObJSIhgUZYfU-9E"
                  alt="Ronin Cyber-Gen Perfil"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="lg:col-span-5 flex flex-col gap-10 lg:sticky lg:top-32">
            <div>
              <span className="text-primary font-headline tracking-widest text-[0.65rem] uppercase mb-2 block font-bold">
                Serie: Cyber-Gen Legacy
              </span>
              <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter text-on-surface leading-[0.9] mb-4">
                Ronin Cyber-Gen
              </h1>
              <div className="flex items-baseline gap-4 mt-6">
                <span className="text-3xl font-headline font-medium text-on-surface">
                  S/. 124.00
                </span>
                <span className="text-sm text-on-surface-variant line-through uppercase tracking-wider opacity-50">
                  S/. 158.00
                </span>
              </div>
            </div>

            <p className="text-on-secondary-container leading-relaxed max-w-md font-body">
              Una obra maestra de la ingeniería aditiva. Ronin Cyber-Gen redefine
              el coleccionismo digital con una precisión de capa de{" "}
              <span className="text-on-surface font-semibold">0.05mm</span>. Cada
              unidad es post-procesada meticulosamente y terminada a mano para
              lograr un acabado industrial auténtico que desafía los límites de
              la manufactura tradicional.
            </p>

            {/* Technical Specs Table */}
            <div className="bg-surface-container-low p-8 flex flex-col gap-6 rounded-sm border border-outline-variant/5">
              <h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Especificaciones Técnicas
              </h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.6rem] uppercase tracking-wider text-on-surface-variant/60 font-bold">
                    Material
                  </span>
                  <span className="text-sm font-semibold text-on-surface">
                    Resin 8K (Precision Grade)
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[0.6rem] uppercase tracking-wider text-on-surface-variant/60 font-bold">
                    Dimensiones
                  </span>
                  <span className="text-sm font-semibold text-on-surface">
                    25cm (Altura)
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[0.6rem] uppercase tracking-wider text-on-surface-variant/60 font-bold">
                    Tiempo de Impresión
                  </span>
                  <span className="text-sm font-semibold text-on-surface">
                    48 Horas de Ciclo Único
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[0.6rem] uppercase tracking-wider text-on-surface-variant/60 font-bold">
                    Escala
                  </span>
                  <span className="text-sm font-semibold text-on-surface">
                    1:6 Professional Scale
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <button className="w-full py-5 bg-primary-container text-white font-headline font-bold uppercase tracking-widest text-sm hover:brightness-110 active:scale-[0.98] transition-all rounded-sm shadow-lg shadow-primary-container/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-3 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                COMPRAR
              </button>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-surface-bright text-[0.65rem] font-bold uppercase tracking-wider text-on-surface rounded-sm">
                Limited Edition
              </span>
              <span className="px-3 py-1 bg-surface-bright text-[0.65rem] font-bold uppercase tracking-wider text-on-surface rounded-sm">
                UV Stable
              </span>
              <span className="px-3 py-1 bg-surface-bright text-[0.65rem] font-bold uppercase tracking-wider text-on-surface rounded-sm">
                Ready to Display
              </span>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <section className="mt-32 pt-16 border-t border-outline-variant/10">
          <div className="flex justify-between items-end mb-12">
            <h2 className="font-headline text-3xl font-bold tracking-tight">
              Piezas Relacionadas
            </h2>
            <Link
              href="/catalogo"
              className="text-primary text-sm font-bold uppercase tracking-widest border-b border-primary/20 pb-1 hover:border-primary transition-all"
            >
              Ver Catálogo Completo
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Related 1 */}
            <div className="group cursor-pointer">
              <div className="bg-surface-container-low aspect-[3/4] overflow-hidden mb-6 relative rounded-sm">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMX8Q8k7qBazs_nIk3WU28lQHu3tjW1CO1o5yzE5_uIl8dWtJO7Bl5uBBVg1hxuJZ9cQzf4v2tDMEg2HcL6bGuKYrPGaRAIsq3wxIMiz8SCeazOAJ9jx-XltpauBlPM53IniN_qDxllklvyqowBhdcoaFQ9K3ZBsc0FdShosdjo1e9HsbDQHu2hskux2IBroJWffMmqZ-3ki-HO30aXyqy_HpWjWov7lWT73gBjpJIGG_nciZRlbrlNH1QZGXiLmGZ4rekSrB6bRyc"
                  alt="Relic Hunter"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              </div>
              <h4 className="font-headline text-lg font-bold group-hover:text-primary transition-colors">
                Relic Hunter VII
              </h4>
              <p className="text-on-secondary-container text-sm mt-1">S/. 89.00</p>
            </div>
            {/* Related 2 */}
            <div className="group cursor-pointer">
              <div className="bg-surface-container-low aspect-[3/4] overflow-hidden mb-6 relative rounded-sm">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuHn3ppCGEt2qo2cMIK1_CDIQQhy502dmjxJmkBALSOw6SzNL_s36-3JTi-CNFmhtPdCEkxccF0GEdOPUyz8QPFb6cQu0r-a1S77ueAJUayX_fY5VdNIXEhg2ARMv-kh2yfHvjxyPNg_BBpL24wTujMpJ5Z_GTaSddzwmP06gFbvknFH2qbk-zkY3AtmpGZm26wqmpaR6BIahDXvdTkoz1Vj7Oe297RhDzmxqeXfQ8OtxIu2zumSIkTG4ghyvKx90j2R2_gOselXRC"
                  alt="Exo-Frame"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              </div>
              <h4 className="font-headline text-lg font-bold group-hover:text-primary transition-colors">
                Exo-Frame Modular
              </h4>
              <p className="text-on-secondary-container text-sm mt-1">S/. 145.00</p>
            </div>
            {/* Related 3 */}
            <div className="group cursor-pointer">
              <div className="bg-surface-container-low aspect-[3/4] overflow-hidden mb-6 relative rounded-sm">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDb9u6CCrc0rxSvWHDl8TiYaZ2ZBNT4TU2Zh6HsyXI9zy6xagEmL2fDJsBZ0gnb3ePiBW5-3KAk1TfbI18yWw6kEWedoN7YfyPgewNRo2uMlnqkRgalWRNXMVK6ZkIg5PTd2kw4arpEd_wSSFf-UZil5DaqAah-m3plBY11-LbHKWS2rzr37-uenuy0_z3DYRVG-ou7tXavPk1TExZy9YRvV7jDbR1ak2K1VAV6RowvhRnSniEmxhRxMoQmHtoSHfEpAjIko4Q45qu6"
                  alt="Neural Core"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              </div>
              <h4 className="font-headline text-lg font-bold group-hover:text-primary transition-colors">
                Neural Core Apex
              </h4>
              <p className="text-on-secondary-container text-sm mt-1">S/. 210.00</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
