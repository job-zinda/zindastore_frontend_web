import React, { useState } from "react";
import { Tag } from "lucide-react";

export default function EnrollmentModal({ isOpen, onClose, course, onProceedToPayment }) {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    referralCode: "", 
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    

    onProceedToPayment({
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      referralCode: formData.referralCode?.trim(),
      courseId: course?.id,
      amount: course?.price || 46999.0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFDF6] w-full max-w-md rounded-2xl p-6 shadow-2xl relative border border-amber-100">
        
        <h3 className="text-xl font-bold text-gray-800 mb-1">Enrollment Details</h3>
        <p className="text-xs text-gray-500 mb-5">
          Enter your details to proceed to payment.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <input
              type="text"
              name="fullName"
              required
              placeholder="Full Name *"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full bg-white/80 border border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9C4196] transition"
            />
          </div>

          {/* Phone Number */}
          <div>
            <input
              type="tel"
              name="phoneNumber"
              required
              placeholder="Phone Number *"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full bg-white/80 border border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9C4196] transition"
            />
          </div>

          {/* Email Address */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white/80 border border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9C4196] transition"
            />
          </div>

          {/* Referral ID Field */}
          <div className="relative">
            <input
              type="text"
              name="referralCode"
              placeholder="Referral ID (Optional)"
              value={formData.referralCode}
              onChange={handleChange}
              className="w-full bg-white/80 border border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#9C4196] transition uppercase tracking-wider font-medium text-gray-700"
            />
            <span className="absolute right-3 top-3 text-[11px] text-[#9C4196] font-semibold flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
              <Tag size={12} /> Promoter Code
            </span>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#9C4196] hover:bg-[#85327f] transition shadow-md"
            >
              Pay ₹{course?.price || "46999.00"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}