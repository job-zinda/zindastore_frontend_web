import React from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, MessageCircle, MapPin } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();

  const links = [
    { label: "Products", path: "/products" },
    { label: "Courses", path: "/courses" },
    { label: "Services", path: "/services" },
    { label: "About Us", path: "/about-us" },
  ];

  const supportLinks = [
    { label: "Help Center", path: "/help-support" },
    { label: "Privacy Policy", path: "/privacy-policy" },
    { label: "Terms & Conditions", path: "/terms-conditions" },
    { label: "FAQs", path: "/faqs" },
  ];

  return (
    <footer className="bg-[#7940a8] text-white mt-8"> 
      <div className="container mx-auto px-3 py-3"> 
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4"> 
          
          {/* Zinda Store Details */}
          <div className="col-span-2 md:col-span-1 space-y-2">
            <h3 className="text-xl font-bold text-white"> 
              <span className="text-[#A855F7]"><b>Zinda</b></span>Store
            </h3>
            <p className="text-xs text-gray-200 leading-relaxed"> 
              Your ultimate destination for quality products, educational courses, and professional services.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-base font-semibold text-white mb-3">Explore</h4> 
            <ul className="space-y-1"> 
              {links.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="flex items-center gap-2 text-xs text-gray-200 hover:text-[#A855F7] hover:pl-1 transition-all duration-300"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-base font-semibold text-white mb-3">Support</h4>
            <ul className="space-y-1">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="flex items-center gap-2 text-xs text-gray-200 hover:text-[#A855F7] hover:pl-1 transition-all duration-300"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-base font-semibold text-white mb-3">Contact</h4>
            <ul className="space-y-1"> 
              <li>
                <a href="mailto:zindasupport@gmail.com" className="flex items-center gap-2 text-xs text-gray-200 hover:text-[#A855F7] transition"> 
                  <Mail size={14} /> zindasupport@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+917592998150" className="flex items-center gap-2 text-xs text-gray-200 hover:text-[#A855F7] transition">
                  <Phone size={14} /> +91 7592998150
                </a>
              </li>
              <li>
                <a href="https://wa.me/917592998150?text=Hi%20Zinda%20Store,%20I%20need%20help" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-gray-200 hover:text-[#A855F7] transition">
                  <MessageCircle size={14} /> WhatsApp Us
                </a>
              </li>
              <li className="flex items-start gap-2 text-xs text-gray-200 cursor-default">
                <MapPin size={14} className="mt-0.5 shrink-0" /> Mannarkkad, Palakkad, Kerala
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20"> 
        <div className="container mx-auto px-6 py-3 flex justify-between items-center"> 
          <p className="text-xs text-gray-200">© 2026 Zinda Store. All rights reserved.</p> 
          
        </div>
      </div>
    </footer>
  );
}