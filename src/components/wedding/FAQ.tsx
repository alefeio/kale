import { weddingConfig } from "@/config/wedding"

export function FAQ() {
  return (
    <section className="px-5 pb-8" aria-labelledby="duvidas-titulo">
      <div className="mx-auto max-w-2xl">
        <h2 id="duvidas-titulo" className="sr-only">
          Perguntas frequentes
        </h2>
        <div className="border-t border-olive/15">
          {weddingConfig.faq.map((item) => (
            <details key={item.question} className="group border-b border-olive/15">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left [&::-webkit-details-marker]:hidden">
                <h3 className="font-serif text-xl font-medium text-olive-dark sm:text-2xl">{item.question}</h3>
                <span aria-hidden className="text-xl text-gold transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 leading-7 text-brown">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
