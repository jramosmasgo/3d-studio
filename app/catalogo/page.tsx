import TopNavBar from "../components/TopNavBar";
import Footer from "../components/Footer";
import Image from "next/image";
import Link from "next/link";

const products = [
  {
    id: 1,
    name: "Ronin Cyber-Gen",
    price: 124.0,
    description: "Capa de 0.05mm. Resina de alta tenacidad. Pintado a mano con detalles metálicos.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAA14RodAvJEWwvzR-VrojaHKRBaSm_M2ireb-9H0JisL1Jk4fby2k-mzhVSBnW7Qhr__0FWC0J3zZEW-FTF876C4pmehXefbiE72hEQw1GaU2UtPLFvKS9ua7QuZrL2iY-3JMsLOhVSgSILvnIz1BWLKSeLdjiSxIfXuRmQ0uRhx-4RIWT-NmVWqo-kZL97SMcW5OZCibAz7WOq3m7JwAce3fym9OWkfV11wiE4VKirAjKt70q282vLLJCOJ6bOCYLhnZO4-j6QxDa",
    badge: "GRADO COLECCIONISTA",
    tags: ["Resina", "Mate"],
    featured: true,
  },
  {
    id: 2,
    name: "Mecha Unit-01 Custom",
    price: 89.0,
    description: "Diseño generativo optimizado para rigidez estructural y articulación total.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBH8oq-1SyYnZ2D-tfpR3bfnIDXHMuSNZKCjTZU1ad3gZCubjE807oCIb4hEp8gSHeE3cuf8MsACtTIevIqGSQl5_4pXDndGETYNqq25lH7Xn_NHeUG9hzfz2unzM4LlGE-KaHtocMn3ToMT-Zp-DsIlE-b_e4S8WTEEePCLxiv0uJoM3HAp0lfpOo9_aBTcuMc3xx0NaeCMQlJ9tnhZi8awj1AysjA6_AIX2K-huBMKr2XhscR0YlM1rWGbbUIE7nt76vrh-NrDfRf",
    tags: ["PLA+", "Articulada"],
  },
  {
    id: 3,
    name: "Réplica Casco Tech-V1",
    price: 45.0,
    description: "Componentes de precisión con ajuste por presión para prototipado rápido.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCtuk19pu46SEh2dv65_LNN7AC6DzgI5qgHr-iS2sAgXWTy554TNboPpJQDvhjeLctzpURICEhtnLG-pVaypGw5xuvTTTyJJyuJL0nEm1riPJ6Q0glzpgmP_SA-sQbp7pLxOqtfFxoNg9PlnImD6CdFK2nEGAuCAKeXbPc-Ce4N1BbihYUs5xfcHaM10ZkSXG7-8eeVLHUYgttcfd3phYC52Yl3A7k2FyK9MixiBNOunxzH50T8dnjzcZXM2nmjK9s3eZiUOGd5OKK",
    badge: "NUEVO LANZAMIENTO",
    tags: ["PETG", "Escala 1:4"],
  },
  {
    id: 4,
    name: "Visor Táctico Aegis",
    price: 210.0,
    description: "Impresión multi-material combinando TPU flexible y PETG reforzado con Carbono.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7Hv-w5LOxfLom748yayR4dgJKym3HTg_HDN3qmZ1gE0n_g7-7MwZzi4ycXp2VFp8TxVjYZzKDUkWSDnsikPtIma60aiNugwd_FutEVAkjm71NB8w8Kltnh9LdeMTiP66Uwz9wMp3LTPcDzkafklSvCVHXc4r1X3zGSS_jrmHi6nCD3nLLD_nZXpny-Cz87pAQFYzOGR38MnVS3H16iMbuH-lAwfnjNxBqrv6xM-rirxNU_dsog0rbWTK6gxkPgZ5K6zENkb7D8g2E",
    tags: ["Híbrido", "Personalizado"],
    offset: true,
  },
  {
    id: 5,
    name: "Diorama Montañoso Alpino",
    price: 155.0,
    description: "Escala 1:50,000. Modelo de terreno arquitectónico. Acabado mate sin líneas de capa.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAclybgg-QkxBBgnBXlMiVqq8kXlHuaBAkEgotQISgDN9rgCpk71Edya7mS6KNr_Wk3S27HTCZzZiDeO-v9nkwoVPp4yGnlLV27XBgTZnnta50cDPysvHGDl_RDZef2Izlx7McRt_w6uNB0Rf1GVOBNsqqsbDufhKFdVTff1JQKQb0oYW5rE83Gx62C2efRpWXfYOZeTt8rYieTOi1xzo2Jscs3De4MBR9khOgARXQ7UuUT6xFUy24TIj0i1yd-_M0pE3nbKdOFpoR-",
    tags: ["Resina", "Estudio"],
  },
  {
    id: 6,
    name: "Pack Miniaturas Titan Slayer",
    price: 12.0,
    description: "Listas para la mesa. Impresión SLA en resolución 8K. Detalle excepcional en escala de 32mm.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4uRIz-SXC0trtXrXgwuNPmdBqR5sBFfsLfDc8NkWd3E4XOoS611fVLvkp9m34X5iThf7Qk16kv7JvIE8c740JZubdu67eH5yvODrwOTE0GtaYhh0JZ4X4M9hGcftihAYR15qpxmnMekhLhwoaTSET0pY3vNLN_t7ECn08QoCNxk6wiJa-QTp2tb28zI2muIjNjaTIR5MStOvwzks8Fc4w7wNhroz3GmPdXhxKR0uMGZuxEfmdsBQ9nOnFiBHLYFoRHBLnR7qaTwNS",
    tags: ["Resina", "8K"],
  },
];

export default function CatalogoPage() {
  return (
    <div className="bg-background min-h-screen text-on-surface">
      <TopNavBar />

      <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="mb-16">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none mb-6 font-headline">
            CATÁLOGO
          </h1>
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <p className="max-w-xl text-on-surface/60 text-lg font-body">
              Figuras coleccionables de alta precisión, estatuas de resina y piezas articuladas de tus franquicias favoritas impresas con excelencia en manufactura aditiva.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs font-label uppercase tracking-widest text-on-surface/40">
                Ordenar por
              </span>
              <div className="relative">
                <select className="bg-surface-container-high border-none text-sm font-medium py-2 pl-4 pr-10 rounded-md focus:ring-1 focus:ring-primary/50 appearance-none cursor-pointer">
                  <option>Diseños Destacados</option>
                  <option>Precio: Menor a Mayor</option>
                  <option>Precio: Mayor a Menor</option>
                  <option>Novedades</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-on-surface/50">
                  expand_more
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Filter Sidebar */}
          <aside className="w-full lg:w-64 space-y-10 shrink-0">
            <div>
              <h3 className="text-xs font-label uppercase tracking-[0.2em] text-primary mb-6">
                Categoría
              </h3>
              <ul className="space-y-3">
                {["Anime", "Cine", "Dibujos Animados", "Réplicas"].map((cat) => (
                  <li key={cat}>
                    <label className="flex items-center group cursor-pointer text-on-surface/80 hover:text-on-surface transition-colors font-body">
                      <input
                        type="checkbox"
                        className="rounded-sm bg-surface-container-highest border-none text-primary-container focus:ring-offset-background mr-3"
                        defaultChecked={cat === "Cine"}
                      />
                      {cat}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-label uppercase tracking-[0.2em] text-primary mb-6">
                Material
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Resina 8K",
                  "PLA+ Silk",
                  "ABS",
                  "Nylon",
                  "Fibra de Carbono",
                ].map((mat, i) => (
                  <span
                    key={mat}
                    className={`px-3 py-1 text-[10px] font-label uppercase tracking-wider rounded-sm border ${i === 0
                        ? "bg-surface-bright text-on-surface/90 border-on-surface/10"
                        : "bg-surface-container-highest text-on-surface/50 border-transparent"
                      }`}
                  >
                    {mat}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-label uppercase tracking-[0.2em] text-primary mb-6">
                Rango de Precio
              </h3>
              <div className="space-y-4">
                <input
                  type="range"
                  max="500"
                  min="0"
                  className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary-container"
                />
                <div className="flex justify-between text-xs font-mono text-on-surface/40">
                  <span>S/. 0</span>
                  <span>S/. 500+</span>
                </div>
              </div>
            </div>

            <button className="w-full py-3 bg-surface-container-highest text-on-surface text-xs font-label uppercase tracking-widest hover:bg-surface-bright transition-all font-label">
              Limpiar Filtros
            </button>
          </aside>

          {/* Product Grid */}
          <section className="flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-16 gap-x-8">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/catalogo/${product.id}`}
                  className={`group relative flex flex-col ${product.offset ? "md:mt-[-40px]" : ""
                    }`}
                >
                  <div className="aspect-[4/5] bg-surface-container-low overflow-hidden relative mb-6">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                    {product.badge && (
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`text-[10px] font-bold px-2 py-1 tracking-tighter ${product.badge === "GRADO COLECCIONISTA"
                            ? "bg-primary-container text-on-primary-container"
                            : "bg-surface-bright text-on-surface"
                          }`}>
                          {product.badge}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-headline font-bold leading-tight group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <span className="text-xl font-headline text-on-surface/60">
                        S/. {product.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface/40 font-body line-clamp-2">
                      {product.description}
                    </p>
                    <div className="pt-4 flex items-center justify-between border-t border-on-surface/5">
                      <div className="flex gap-2">
                        {product.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-label text-on-surface/30 uppercase"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center text-primary text-xs font-bold uppercase tracking-widest group/btn">
                        Ver Detalles
                        <span className="material-symbols-outlined text-sm ml-1 transform group-hover/btn:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-24 flex items-center justify-center gap-4">
              <button className="w-10 h-10 flex items-center justify-center border border-on-surface/10 hover:border-primary transition-colors">
                <span className="material-symbols-outlined text-sm">
                  chevron_left
                </span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-primary text-on-primary font-bold text-xs">
                01
              </button>
              <button className="w-10 h-10 flex items-center justify-center border border-on-surface/10 hover:border-primary transition-colors text-xs">
                02
              </button>
              <button className="w-10 h-10 flex items-center justify-center border border-on-surface/10 hover:border-primary transition-colors text-xs">
                03
              </button>
              <button className="w-10 h-10 flex items-center justify-center border border-on-surface/10 hover:border-primary transition-colors">
                <span className="material-symbols-outlined text-sm">
                  chevron_right
                </span>
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
