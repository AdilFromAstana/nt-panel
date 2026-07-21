import { products } from "@/lib/data";
import SiteHeader from "@/components/SiteHeader";
import HotCarousel from "@/components/HotCarousel";

const SECTIONS = [
  { slug: "ntpanel", name: "Декоративные панели", img: "/images/ntpanel-hero.jpg", desc: "Декоративные стеновые панели с инновационным дизайном." },
  { slug: "ntbricks", name: "Стеклоблоки", img: "/images/ntbricks-hero.jpg", desc: "Современные стеклоблоки с эффектом стекла и света." },
  { slug: "ntblok", name: "Стеновые блоки", img: "/images/ntblok-hero.jpg", desc: "Инновационный строительный материал: гидро-, тепло-, шумоизоляция." },
  { slug: "ntstone", name: "Гибкий камень", img: "/images/ntstone/ntstone-hero.webp", desc: "Гибкий камень и арт-цемент с натуральной фактурой для стен и фасадов." },
];
const BRANDS = ["sensata.png", "smartremont.svg", "12mesyacev.png", "compass.svg", "bi_group.png", "bazis.jpg", "zebra_coffee.png"];

export default function Home() {
  const all = products();
  const hot = all
    .filter((p) => p.preview_image && Number(p.stock) > 0)
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 14)
    .map((p) => ({ id: p.id, name: p.name, price: p.price, stock: Number(p.stock), isNew: Number(p.id) >= 280, preview_image: p.preview_image, category_name: p.category_name }));

  return (
    <div className="bg-white text-gray-900">
      <SiteHeader />

      <section className="hero-bg text-white">
        <div className="max-w-6xl mx-auto px-4 py-24 md:py-32">
          <p className="uppercase tracking-[0.3em] text-xs mb-4 text-white/80">Астана</p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-2xl">Минимализм в интерьере</h1>
          <p className="mt-4 text-lg text-white/90 max-w-xl">
            Декоративные стеновые панели, гибкий камень, стеклоблоки и стеновые блоки. Производство в Казахстане.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/catalog/hybrid" className="bg-white text-gray-900 px-7 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition">Открыть каталог</a>
            <a href="https://wa.me/77077133569" className="bg-green-600 text-white px-7 py-3.5 rounded-xl font-bold hover:bg-green-700 transition">Написать в WhatsApp</a>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-14">
        <section className="mb-20">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-3xl md:text-4xl font-bold">Горячие предложения</h2>
            <a href="/catalog/hybrid" className="text-green-600 font-semibold hover:underline">Все товары →</a>
          </div>
          <HotCarousel items={hot} />
        </section>

        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold mb-10">Наши товары</h2>
          <div className="space-y-7">
            {SECTIONS.map((s, i) => (
              <div key={s.slug} className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm grid md:grid-cols-2 gap-6 md:gap-8 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} className={`rounded-2xl h-64 w-full object-cover ${i % 2 ? "md:order-2" : ""}`} alt={s.name} />
                <div className={i % 2 ? "md:order-1" : ""}>
                  <h3 className="text-2xl font-bold mb-2">{s.name}</h3>
                  <p className="text-gray-600 mb-5">{s.desc}</p>
                  <a href={`/catalog/hybrid?section=${s.slug}`} className="inline-block bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition">Подробнее</a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">О нас</h2>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <p className="text-lg leading-relaxed text-gray-700">
                Наша компания — команда инженеров, дизайнеров и технологов. Собственное производство, точность и
                глубокое понимание потребностей рынка.
              </p>
              <div className="flex gap-8">
                <div><div className="text-3xl font-bold text-green-600">238+</div><div className="text-sm text-gray-500">позиций в наличии</div></div>
                <div><div className="text-3xl font-bold text-green-600">ISO</div><div className="text-sm text-gray-500">сертификаты качества</div></div>
                <div><div className="text-3xl font-bold text-green-600">РК</div><div className="text-sm text-gray-500">доставка по стране</div></div>
              </div>
            </div>
            <video className="rounded-3xl w-full h-72 object-cover shadow-lg" controls poster="/uploads/videos/factory-poster.jpg">
              <source src="/uploads/videos/factory-intro.mp4" type="video/mp4" />
            </video>
          </div>
        </section>

        <section className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Шоурум и контакты</h2>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-bold mb-1">Главный шоурум — ТЦ «Корме»</h3>
              <p className="text-gray-600 mb-1">Астана, ул. Достык, 3</p>
              <p className="text-gray-600 mb-5">+7 707 713-35-69 · info@company.kz</p>
              <div className="flex flex-wrap gap-3">
                <a href="https://wa.me/77077133569" className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition">WhatsApp</a>
                <a href="https://2gis.kz/astana" target="_blank" className="bg-white border border-gray-200 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition">2GIS</a>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/main/korme.jpg" className="rounded-2xl h-64 w-full object-cover shadow-lg" alt="Шоурум" />
          </div>
        </section>

        <section className="mb-24 overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Нам доверяют лидеры отрасли</h2>
          <div className="relative">
            <div className="flex marquee gap-14 items-center">
              {[...BRANDS, ...BRANDS].map((b, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={`/images/partners/${b}`} className="h-10 md:h-12 w-auto object-contain grayscale opacity-70 hover:opacity-100 transition" alt="" />
              ))}
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Отзывы клиентов</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bubble">«Очень качественные панели, монтаж простой!» — Арман <span className="text-[11px] text-gray-400 ml-1">10:45</span></div>
            <div className="bubble">«Быстрая доставка по Астане, всё аккуратно упаковано.» — Елена <span className="text-[11px] text-gray-400 ml-1">12:30</span></div>
            <div className="bubble">«Брали гибкий камень на фасад — выглядит дорого.» — Дамир <span className="text-[11px] text-gray-400 ml-1">09:12</span></div>
            <div className="bubble">«Помогли с расчётом, проконсультировали в WhatsApp.» — Айгерим <span className="text-[11px] text-gray-400 ml-1">15:05</span></div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <p className="text-gray-500">Декоративные панели, камень, кирпич и блоки. Производство в Казахстане.</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Каталог</div>
            <a href="/catalog/hybrid?section=ntpanel" className="block text-gray-600 hover:text-green-600">Декоративные панели</a>
            <a href="/catalog/hybrid?section=ntstone" className="block text-gray-600 hover:text-green-600">Гибкий камень</a>
            <a href="/catalog/hybrid?section=ntbricks" className="block text-gray-600 hover:text-green-600">Стеклоблоки</a>
            <a href="/catalog/hybrid?section=ntblok" className="block text-gray-600 hover:text-green-600">Стеновые блоки</a>
          </div>
          <div>
            <div className="font-semibold mb-2">Контакты</div>
            <p className="text-gray-600">Астана, ул. Достык, 3</p>
            <a href="tel:+77077133569" className="block text-gray-600 hover:text-green-600">+7 707 713-35-69</a>
            <div className="flex gap-3 mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <a href="https://wa.me/77077133569"><img src="/icons/socials/whatsapp.webp" className="h-7 w-7" alt="WhatsApp" /></a>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-gray-400 pb-6">© 2026 — Все права защищены</div>
      </footer>
    </div>
  );
}
