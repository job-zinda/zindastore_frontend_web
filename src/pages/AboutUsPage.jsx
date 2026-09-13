import PageLayout from "./PageLayout";
import { Target, Users, Award } from "lucide-react";

export default function AboutUsPage() {
  return (
    <PageLayout title="About Zinda Store">
      <p>Welcome to <b>Zinda Store</b> - Your ultimate destination for quality products, educational courses, and professional services.</p>
      
      <div className="grid md:grid-cols-3 gap-6 my-8 not-prose">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-gray-100 text-center">
          <Target className="w-10 h-10 text-[#7B2CBF] mx-auto mb-3" />
          <h3 className="font-bold text-lg">Our Mission</h3>
          <p className="text-sm text-gray-600">To empower individuals with tools, knowledge and services to grow.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-gray-100 text-center">
          <Users className="w-10 h-10 text-[#7B2CBF] mx-auto mb-3" />
          <h3 className="font-bold text-lg">Our Community</h3>
          <p className="text-sm text-gray-600">Join thousands of learners and customers across Kerala and India.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <Award className="w-10 h-10 text-[#7B2CBF] mx-auto mb-3" />
          <h3 className="font-bold text-lg">Our Quality</h3>
          <p className="text-sm text-gray-600">We guarantee top-notch products and expert-led courses.</p>
        </div>
      </div>

      <p>Based in Mannarkkad, Kerala, we are committed to delivering excellence and building long-term relationships with our customers.</p>
    </PageLayout>
  );
}