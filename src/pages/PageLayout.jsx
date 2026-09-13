export default function PageLayout({ title, children }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{title}</h1>
      <div className="w-20 h-1 bg-[#7B2CBF] rounded-full mb-8"></div>
      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
        {children}
      </div>
    </div>
  );
}