import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export interface PageContent {
  id: string; // "inicio" | "servicios" | "nosotros"
  title: string;
  subtitle: string;
  description?: string;
  updatedAt?: any;
  sections: Record<string, any>;
}

const CONTENIDO_COL = "contenido";

// Fallback static contents
const fallbacks: Record<string, PageContent> = {
  inicio: {
    id: "inicio",
    title: "Voces del Gremio",
    subtitle: "Testimonios",
    description: "Descubre la experiencia de creadores, diseñadores y profesionales que confían en nuestro estudio para dar vida a sus ideas.",
    sections: {
      heroTitle: "Calidad Visual Industrial",
      heroSubtitle: "Nuestras Capacidades",
      newsletterTitle: "Únete al Gremio",
      newsletterSubtitle: "Suscríbete para acceso anticipado a drops de edición limitada, guías de pintura y noticias exclusivas del estudio.",
      // Hero Principal config
      heroBadge: "Coleccionables Premium",
      heroTitle1: "Impresión 3D",
      heroTitle2: "y Modelado.",
      heroDescription: "Studio 3D: Especialistas en impresión 3D, modelado digital y diseño personalizado. Creamos desde maquetas y prototipos hasta personajes y piezas mecánicas de alta calidad.",
      heroStat1Value: "0.02mm",
      heroStat1Label: "Detalle",
      heroStat2Value: "8K",
      heroStat2Label: "Resin Core",
      heroStat3Value: "MUSEO",
      heroStat3Label: "Acabado",
      heroCardTitle: "Mecha-X Prototype",
      heroCardDesc: "MATERIAL: TOUGH RESIN / DETALLE: 20 MICRAS",
      heroCardImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuApkZSm91wWoQ6FevP9m2lcTeW3LW5NzuSUhv4WAO5hkZ4zqzqcsiFYi8IO3gpyOn8ZpTf3G_tEzlQKT3vvvVjG7TnYWMGKdxU6lTo9LlZtYEdGQyty-KZ5nrQ-Z58oVU0lvn17gmuDeak-RCDJoMjiVFxxrvepj-fgkQvT4wcEeo0qrtM_XkagjIWkk7hwRYhagk1wWFd1-lXtiTF4cdTtA-8cQcIHKqXlIfZIcEPmBZ3Lca6jyXx0jBcaTbyECnlobm7jmvGUcvWM",
      heroCardLink: "/catalogo",
      // Novedades y Ofertas config
      novCard1Badge: "Edición Limitada",
      novCard1Title: "Colección \"Guerreras del Éter\"",
      novCard1Desc: "Nuestras figuras más detalladas hasta la fecha. 15% de descuento en el primer drop.",
      novCard1BtnText: "Aprovechar Oferta",
      novCard1BtnLink: "/catalogo",
      novCard1Image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGAKsu8kgkWqhRf2jrHlYwVuMJVv16kBAN6Vz8JEvMFGaGKfAANRpoBEq_JS_Xz3qvVFR9oimA8wb72idjQtqvQ9jnWOTXhPjg_h8Brszs_ByvHAFLeqhcTZOHVHXTzhQUntNze0Y_SdgzbrH0i36eDgYHh-phqevc_1x6kIxtwUVvLAuHIDFbQX6ScSBG2KUNYsaJpVLrD5lb6JPV3Efs5JXXDb6_Ipzy9OeG2OH8xoEQ87HJAhCQIQqAVM1Io1T1XDcC1i2GV0us",
      novCard2Badge: "RESTOCK",
      novCard2Title: "Héroes Legendarios",
      novCard2Desc: "Figuras de acción articuladas impresas en Nylon de alta resistencia.",
      novCard2Price: "S/. 35.00",
      novCard2OldPrice: "S/. 45.00",
      novCard2Link: "/catalogo",
      novCard2Image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyZQu8BF3-WNkKF0EAj4pGyBN-6QV5G9uu3i9VLBB1yRG5rlvfM0qIpXBN0vPli42E74yNktNlvKKep6st68FSSIRLS_qpBUQc0k8Z5SAFC2LEV7Dh6kThFZtjjfZDSTDRvnp4iIY0z0gvprAJM3ttWexvwdOJt5xDj3KxCvCFXLcd1kcXZE4nXP3A8L8n0kQjV6IH1fUv-8OJlFRN9jr6t-415WyzB-bwQheFlDg6qY8w6SkcYNsz28KfK0AVEogOTFjhvlbDfAR0",
      // Capacidades config
      capBadge: "Nuestras Capacidades",
      capTitle: "Calidad Visual Industrial",
      cap1Title: "Modelado Digital Pro",
      cap1Desc: "Asesoría y desarrollo en Fusion 360, Blender y AutoCAD. Convertimos ideas complejas en soluciones funcionales para ingeniería y arquitectura.",
      cap2Title: "Prototipado Técnico",
      cap2Desc: "Desarrollamos piezas mecánicas, maquetas y prototipos industriales con precisión milimétrica en resina y filamento.",
      cap3Title: "Personajes y Arte",
      cap3Desc: "Creación de personajes y figuras animadas con acabados de alta calidad, fusionando arte digital con fabricación aditiva de vanguardia.",
      capBadgeTitle: "Calidad Colección",
      capBadgeDesc: "Inspección de 12 puntos antes del envío para asegurar la perfección total.",
      capImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhy9-w6HrqR803Cd70xkrMWZo58Kjl9AvxBTemcDqgKGM7GcVDmprcCfcQrYg68fU6NmEpNMYtupw2QUOkzmz-itrUMrQNzheo8jrCLhSPG4k_J-i62LoU9O-kt4UAI1Ej2CR-xWCTgpKavpHFGyjT1gZlNcpTRdueu5jcCu3eVBylowEaU0cUUz3tUrXVRAPuMue_ralMBxD-ZC3Yfty4Bq27ruv-qGuKhiXXoK7U_nDtt80rKDFG3jVTkfeGtpYV3VFxnj7BD7AH",
      // Testimonios config
      testSubtitle: "Testimonios",
      testTitle: "Voces del Gremio",
      testDesc: "Descubre la experiencia de creadores, diseñadores y profesionales que confían en nuestro estudio para dar vida a sus ideas.",
      test1Name: "Carlos Mendoza",
      test1Role: "Coleccionista de Miniaturas",
      test1Quote: "La precisión en el detalle de las miniaturas es de otro mundo. He pedido varias figuras en resina y la calidad de la superficie es impecable, casi sin líneas de capa.",
      test2Name: "Ana Gómez",
      test2Role: "Diseñadora Industrial",
      test2Quote: "Excelente servicio de prototipado rápido. Nos ayudaron a validar una pieza mecánica compleja en Fusion 360 y la impresión final en filamento resistió perfectamente las pruebas.",
      test3Name: "Roberto Silva",
      test3Role: "Arquitecto",
      test3Quote: "Imprimimos la maqueta de un proyecto de condominios completo. El nivel de detalle en las estructuras y la rapidez en la entrega superaron nuestras expectativas."
    }
  },
  servicios: {
    id: "servicios",
    title: "MÁS ALLÁ DE LA IMPRESIÓN.",
    subtitle: "Servicios Especializados",
    description: "Ofrecemos una gama completa de soluciones digitales y analógicas para dar vida a tus proyectos de colección, ingeniería, arquitectura y arte.",
    sections: {
      disenoTitle: "Diseño y Escultura Digital 3D",
      disenoDescription: "Convertimos tus bosquejos, ideas o conceptos bidimensionales en modelos tridimensionales listos para impresión. Diseñamos desde personajes y criaturas detalladas hasta piezas mecánicas de precisión técnica utilizando Fusion 360, Blender y AutoCAD.",
      disenoImage: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=2070",
      pinturaTitle: "Servicio de Pintura y Acabado Artístico",
      pinturaDescription: "Damos vida y realismo a tus figuras impresas. Nuestro equipo de artistas se especializa en la preparación de superficies, aplicación de imprimante, aerografía y pintura a pincel de nivel profesional para lograr acabados impecables.",
      pinturaImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5kpLecDl-mNwoFkAyrq6nKvOykmdpsYwfaxVzorx_QfhF9btDBD4xHpcYp6Rgfx_sT3ZFFJHEaUtM84V9CIQOddHsyYzxpfZlfWXD8EIkjnwpwDbZfrfEv2okaCv75ph2oZfCUV08DFgDZGydfTV_xCGbl2hBz9NOLW0K57OrcskrNtjy3oP4RgOQnf9aQUg2IX1zNFFeroKZflLw4tg5eTvpSXsTYtq7SMzp2AHNEbdQbTEz9TGBiHvDl2wyyBIXerMsE5vl3dNl",
      archivosTitle: "Venta y Licenciamiento de Archivos 3D (STL)",
      archivosDescription: "Accede a nuestra biblioteca exclusiva de modelos 3D listos para descargar e imprimir en tu propia impresora. Cada archivo cuenta con soportes pre-diseñados y optimizados para resina y filamento garantizando una impresión perfecta al primer intento.",
      archivosImage: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=2000"
    }
  },
  nosotros: {
    id: "nosotros",
    title: "Impresión 3D Diseño y Modelado.",
    subtitle: "Artesanía Aditiva Industrial",
    description: "Studio 3D es una empresa especializada en impresión 3D, modelado digital y diseño personalizado. Desarrollamos maquetas, prototipos, personajes, figuras animadas, piezas mecánicas y proyectos técnicos para ingeniería, arquitectura, diseño y emprendimientos.",
    sections: {
      heroImage: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070",
      misionTitle: "NUESTRA MISIÓN",
      misionContent: "En Studio 3D transformamos ideas en proyectos reales mediante impresión 3D, modelado digital y diseño personalizado. Brindamos soluciones innovadoras en creación de personajes, figuras animadas, piezas técnicas mecánicas y asesoría especializada en software como Fusion 360, Blender y AutoCAD, ofreciendo calidad, creatividad y tecnología para estudiantes, empresas y profesionales.",
      visionTitle: "VISIÓN",
      visionContent: "Ser una empresa líder en fabricación digital y diseño 3D en Perú, reconocida por la innovación, creatividad y excelencia en impresión 3D, desarrollo de personajes, proyectos técnicos y asesoramiento profesional para distintas industrias y áreas académicas.",
      galeriaImg1: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5kpLecDl-mNwoFkAyrq6nKvOykmdpsYwfaxVzorx_QfhF9btDBD4xHpcYp6Rgfx_sT3ZFFJHEaUtM84V9CIQOddHsyYzxpfZlfWXD8EIkjnwpwDbZfrfEv2okaCv75ph2oZfCUV08DFgDZGydfTV_xCGbl2hBz9NOLW0K57OrcskrNtjy3oP4RgOQnf9aQUg2IX1zNFFeroKZflLw4tg5eTvpSXsTYtq7SMzp2AHNEbdQbTEz9TGBiHvDl2wyyBIXerMsE5vl3dNl",
      galeriaImg2: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqBuEyIxkt9XqmgXy_OYjvT5G8LzEEsMbp5x8WSH0v0Yyk7MVUZgt8bc3pDpslvZ3q_W5TDu6h9e8G7BwnxVw28RrqMrlNm33rObH1BXZDdV-fRfq0H6FWqIa-8144f2TCRrGsIuE0lxmf5UQnXyF0RsTON_ZcItLPWqzh8zTvoMizPG7gnXRkh5qNHEZ5ljogcWXeNP-8QAEDe8M0HcccPc6vYs5Qa1BDy-5_DeCiXGSsa5ELf_kdmMbZUcI737cs2IBh6POuI_B2",
      galeriaImg3: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFlfiUM9E09r2j2gK6ti308bGSFoyN7Nh-oy6eN5TQBm4n9bt1XhRo12zSIGIqJcgypMnnofEwnBxo9QrUYqGvHwlu66msDFWRvu6UwQFdJwxmHWcpotQuSq40EhD6-rhFTRBTXFjtoCi2Nsr-ABm_UNin-viJBm5H6YszR8I6dHCyIpFX8bQCAOWh6fsPEXq14agiHTGSmVVrgkPGCCZ89vVCTGGAz1Orbb7yP7jEmBGPKVJMq9oA8wZwTfCUtx1GATpOguBysPh4",
      galeriaImg4: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKWPi2WGnDf-EVCczXhwVhHaESNL9gFAPLd00z-7enFJztEIlolHho2UALCqcjcw-XHv2U8z8G7683gEcLd4UITG66Twq4zJISRnYHbeRdZ4-KAHQgcGhfLba4jg-cULx50i-Yi9hyut05-ieaQpW_Th1KG6KRJpNqq1xIWa1A3Ma6lI1pF-BovbzsiJE6KL_zkG9TZfyeKLKOa6qUMOi7dDkRwRiIaOC2G5DT94b2LM_kqyCQ5cbMLkW4TVdB9_D2hSg5cvCbzOs8",
      ingenieriaTitle: "INGENIERÍA ADITIVA DE PRECISIÓN.",
      item1Title: "DISEÑO PERSONALIZADO",
      item1Desc: "Brindamos asesoría y desarrollo de proyectos en Fusion 360, Blender y AutoCAD, ayudando a estudiantes y profesionales a convertir sus ideas en soluciones funcionales y visualmente impactantes.",
      item2Title: "RESINA Y FILAMENTO",
      item2Desc: "Trabajamos con impresión 3D en resina y filamento, ofreciendo acabados de alta calidad y precisión técnica para maquetas, prototipos y piezas mecánicas.",
      item3Title: "ENVÍOS NACIONALES",
      item3Desc: "Ofrecemos envíos a nivel nacional en todo el Perú, asegurando que tus proyectos lleguen de manera segura y puntual a cualquier destino."
    }
  }
};

export async function getPageContent(id: string): Promise<PageContent> {
  try {
    const docRef = doc(db, CONTENIDO_COL, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as PageContent;
    }
  } catch (error) {
    console.error(`Error loading content for ${id}, using fallback:`, error);
  }
  return fallbacks[id] || { id, title: "", subtitle: "", sections: {} };
}

export async function savePageContent(id: string, data: Omit<PageContent, "id">): Promise<void> {
  const docRef = doc(db, CONTENIDO_COL, id);
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Seeds all page content fallbacks into Firestore.
 * Safe to call multiple times — uses merge:true so existing edits are not overwritten
 * unless the key doesn't exist yet.
 */
export async function seedAllContent(): Promise<{ seeded: string[] }> {
  const pages = Object.keys(fallbacks) as string[];
  const seeded: string[] = [];

  for (const pageId of pages) {
    const fallback = fallbacks[pageId];
    const { id, ...data } = fallback;
    const docRef = doc(db, CONTENIDO_COL, id);
    // merge: false so we do a full write of the fallback — but only for keys not already set
    // We use merge:true to preserve any admin edits on top of the defaults
    await setDoc(docRef, {
      ...data,
      seededAt: serverTimestamp(),
    }, { merge: true });
    seeded.push(pageId);
  }

  return { seeded };
}

