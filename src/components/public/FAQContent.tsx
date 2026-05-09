"use client";

import { Accordion } from "@heroui/react";

const ChevronDown = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const faqCategories = [
  {
    title: "Sobre la Federación",
    items: [
      {
        title: "¿Qué es la FEUCSC?",
        content:
          "La FEUCSC (Federación de Estudiantes de la Universidad Católica de la Santísima Concepción) es el organismo de representación estudiantil encargado de velar por los intereses, derechos y bienestar de todas y todos los estudiantes de la universidad.",
      },
      {
        title: "¿Quiénes conforman la FEUCSC?",
        content:
          "La FEUCSC está compuesta por estudiantes electos democráticamente por el estudiantado. Incluye cargos como Presidente/a, Vicepresidente/a, Secretario/a General, Secretario/a de Finanzas, Secretario/a de Comunicaciones, Secretario/a de Bienestar y Vocalias.",
      },
    ],
  },
  {
    title: "Sobre las finanzas",
    items: [
      {
        title: "¿Cómo puedo ver en qué se gastan los fondos?",
        content:
          "En la página de gastos de este portal puedes encontrar un desglose completo de todos los gastos realizados, incluyendo la categoría, monto, fecha y comprobante de cada transacción. Toda la información se actualiza periódicamente.",
      },
      {
        title: "¿Qué es el presupuesto total y cómo se define?",
        content:
          "El presupuesto total corresponde al monto anual asignado a la Federación por la universidad para cubrir todas sus actividades y proyectos. Este monto se define al inicio del año académico.",
      },
      {
        title: "¿Puedo solicitar un comprobante de un gasto específico?",
        content:
          "Sí. Cada gasto registrado en el portal cuenta con su respectivo comprobante adjunto. Puedes visualizarlo directamente en la tabla de gastos recientes haciendo clic en el ícono de comprobante junto a cada transacción.",
      },
    ],
  },
  {
    title: "Sobre esta página web",
    items: [
      {
        title: "¿Con qué frecuencia se actualiza la información?",
        content:
          "La información se actualiza periódicamente a medida que se registran nuevos gastos. Puedes ver la última fecha de actualización en el indicador de sincronización ubicado en la página de resumen.",
      },
      {
        title: "¿Puedo descargar los datos financieros?",
        content:
          "Actualmente esta página permite la consulta en línea de todos los datos financieros. Si necesitas información adicional o un documento específico, puedes enviarnos un correo a feucsc@ucsc.cl, o visitarnos en la sala de la FEUCSC.",
      },
    ],
  },
];

export default function FAQContent() {
  return (
    <div className="flex flex-col gap-10">
      {faqCategories.map((category, catIndex) => (
        <div
          key={category.title}
          className="animate-fade-in-up opacity-0"
          style={{ animationDelay: `${0.1 + catIndex * 0.08}s` }}
        >
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3 px-1">
            {category.title}
          </p>

          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-apple overflow-hidden">
            <Accordion
              allowsMultipleExpanded
              className="w-full **:data-[slot=separator]:opacity-[0.04]"
            >
              {category.items.map((item, index) => (
                <Accordion.Item key={index}>
                  <Accordion.Heading>
                    <Accordion.Trigger className="px-5! py-4! text-left hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors duration-150">
                      <span className="text-[15px] font-medium tracking-tight text-gray-900 dark:text-white pr-4">
                        {item.title}
                      </span>
                      <Accordion.Indicator className="text-gray-400 [&>svg]:size-5 shrink-0">
                        <ChevronDown />
                      </Accordion.Indicator>
                    </Accordion.Trigger>
                  </Accordion.Heading>
                  <Accordion.Panel>
                    <Accordion.Body className="px-5! pb-5! pt-0!">
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed pr-4">
                        {item.content}
                      </p>
                    </Accordion.Body>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        </div>
      ))}
    </div>
  );
}
