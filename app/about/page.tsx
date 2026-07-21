import SiteHeader from "@/components/SiteHeader";

export const metadata = {
  title: "О компании",
  description:
    "Производство декоративных стеновых панелей, луверов и стеновых блоков в Астане: высокоточная обработка ЧПУ, стандарт ISO 9001, реализованные объекты и сотрудничество.",
};

const GALLERY = [
  "/images/about/space1.jpg",
  "/images/about/space2.jpg",
  "/images/about/space3.jpg",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <SiteHeader />

      <main className="mx-auto max-w-6xl space-y-20 px-4 py-10 sm:py-14">
        <section>
          <div className="mb-12 border-b border-gray-200 pb-10 sm:mb-16 sm:pb-14">
            <h1 className="mb-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              ТЕХНОЛОГИЧЕСКОЕ<br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-400 bg-clip-text text-transparent">СОВЕРШЕНСТВО</span>
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
              Мы объединили инженерную точность и архитектурную эстетику. Каждое изделие проходит строгий контроль качества, соответствующий промышленным стандартам надёжности Астаны.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-7">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/about/manufacture1.jpg"
                alt="Производство"
                className="h-64 w-full rounded-2xl object-cover grayscale transition duration-700 hover:grayscale-0 sm:h-[500px]"
              />
            </div>
            <div className="flex flex-col justify-center space-y-5 md:col-span-5">
              <h2 className="text-2xl font-bold sm:text-3xl">Высокоточная обработка</h2>
              <p className="leading-relaxed text-gray-600">
                Наше оборудование с ЧПУ обеспечивает погрешность не более 0.1 мм. Для нашей линейки это означает создание элементов с идеальной геометрией, гарантирующих безупречную стыковку при монтаже.
              </p>
              <div className="border-l-2 border-green-600 pl-5">
                <p className="font-bold">Стандарт качества:</p>
                <p className="text-gray-500">ISO 9001:2015 подтверждает наше стремление к совершенству в каждом узле.</p>
              </div>
            </div>
          </div>

          <video
            src="/videos/showroom.mp4"
            controls
            playsInline
            muted
            loop
            poster="/images/about/manufacture2.jpg"
            className="mt-10 h-56 w-full rounded-2xl bg-gray-900 object-cover sm:h-[400px]"
          />
        </section>

        <section className="border-t border-gray-100 pt-14 sm:pt-16">
          <h2 className="mb-8 text-2xl font-bold sm:mb-10 sm:text-3xl">Реализованные объекты</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {GALLERY.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="Объект" className="h-56 w-full cursor-pointer rounded-xl object-cover grayscale transition hover:grayscale-0 sm:h-64" />
            ))}
          </div>
        </section>

        <section className="border-t border-gray-100 pt-14 sm:pt-16">
          <h2 className="mb-6 text-2xl font-bold sm:mb-8 sm:text-3xl">Сотрудничество</h2>
          <div className="grid gap-10 rounded-2xl bg-gray-50 p-6 sm:p-12 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-xl font-bold">Для архитектурных бюро</h3>
              <p className="text-gray-600">Предоставляем техническую документацию, образцы материалов и поддержку на всех этапах проектирования.</p>
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="mb-3 text-xl font-bold">Для застройщиков</h3>
              <p className="mb-6 text-gray-600">Гарантированные сроки поставки и серийное производство под индивидуальные спецификации вашего объекта.</p>
              <a
                href="https://2gis.kz/astana/firm/70000001019343351"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit items-center gap-3 rounded-xl bg-green-700 px-8 py-4 font-bold uppercase tracking-widest text-white transition hover:brightness-95"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-4.42 0-8-3.58-8-8 0-4.42 3.58-8 8-8 4.42 0 8 3.58 8 8 0 4.42-3.58 8-8 8zm0-12.93c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" /></svg>
                Найти в 2GIS
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl border-t border-gray-100 px-4 py-10 text-center text-sm text-gray-500">
        © 2026 — Технологическое совершенство.
      </footer>
    </div>
  );
}
