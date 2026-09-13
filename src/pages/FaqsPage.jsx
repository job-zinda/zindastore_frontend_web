import PageLayout from "./PageLayout";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "How do I track my order?", a: "Once your order ships, you will receive an email with a tracking number." },
  { q: "What payment methods do you accept?", a: "We accept UPI, Credit/Debit Cards, Net Banking and Cash on Delivery." },
  { q: "Can I get a refund on courses?", a: "Digital courses are non-refundable. Please check course details before purchase." },
  { q: "How long does shipping take?", a: "Standard shipping within Kerala takes 3-5 business days. All India 5-7 days." },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 py-4">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center text-left font-semibold text-gray-800">
        {q}
        <ChevronDown className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="mt-3 text-gray-600">{a}</p>}
    </div>
  );
}

export default function FaqsPage() {
  return (
    <PageLayout title="Frequently Asked Questions">
      <p>Find answers to common questions about Zinda Store.</p>
      <div className="mt-6 not-prose">
        {faqs.map((faq, i) => <FaqItem key={i} {...faq} />)}
      </div>
    </PageLayout>
  );
}