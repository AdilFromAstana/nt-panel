"use client";

export default function WhatsAppPodborka() {
  function open() {
    const txt = "Здравствуйте! Интересует подборка с сайта NT Panel: " + window.location.href;
    window.open("https://wa.me/77081237069?text=" + encodeURIComponent(txt), "_blank");
  }
  return (
    <button
      onClick={open}
      className="inline-flex items-center gap-2 bg-[#25d366] text-white rounded-full px-5 py-3 font-bold text-sm mt-6"
    >
      Написать в WhatsApp по подборке
    </button>
  );
}
