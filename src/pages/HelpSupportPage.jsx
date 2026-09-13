import PageLayout from "./PageLayout";
import { Mail, Phone, MessageCircle } from "lucide-react";

export default function HelpSupportPage() {
  return (
    <PageLayout title="Help Center">
      <p>Need help? We are here for you 24/7. Choose the best way to reach us.</p>
      
      <div className="grid md:grid-cols-3 gap-4 my-8 not-prose">
        
        {/* Email Card */}
        <a 
          href="mailto:zindasupport@gmail.com" 
          className="bg-white p-6 rounded-xl border-gray-200 hover:border-[#7B2CBF] hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center text-center gap-2"
        >
          <Mail className="w-8 h-8 text-[#7B2CBF]" />
          <h4 className="font-semibold text-gray-800">Email Us</h4>
          <p className="text-sm text-gray-500">zindasupport@gmail.com</p>
        </a>

        {/* Call Card */}
        <a 
          href="tel:+917592998150" 
          className="bg-white p-6 rounded-xl border border-gray-200 hover:border-[#7B2CBF] hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center text-center gap-2"
        >
          <Phone className="w-8 h-8 text-[#7B2CBF]" />
          <h4 className="font-semibold text-gray-800">Call Us</h4>
          <p className="text-sm text-gray-500">+91 75929 98150</p>
        </a>

        {/* WhatsApp Card */}
        <a 
          href="https://wa.me/917592998150" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-white p-6 rounded-xl border-gray-200 hover:border-[#7B2CBF] hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center text-center gap-2"
        >
          <MessageCircle className="w-8 h-8 text-[#7B2CBF]" />
          <h4 className="font-semibold text-gray-800">WhatsApp</h4>
          <p className="text-sm text-gray-500">Chat with us</p>
        </a>

      </div>

      <p>Response time: Usually within 2 hours during business days.</p>
    </PageLayout>
  );
}