import { weddingConfig } from "@/config/wedding"

export function FAQ() {
  const { copy, faq } = weddingConfig

  return (
    <section className="px-5 pt-8 pb-8" aria-labelledby="duvidas-titulo">
      <div className="mx-auto max-w-2xl">
        <h2 id="duvidas-titulo" className="text-center font-serif text-4xl font-medium text-olive-dark sm:text-5xl">
          {copy.faqTitle}
        </h2>
        <p className="mt-4 text-center text-brown">{copy.faqIntro}</p>
        <div className="mt-12 border-t border-olive/15">
          {faq.map((item) => (
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
