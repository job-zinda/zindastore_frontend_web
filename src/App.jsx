import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import CategoriesPage from "./pages/CategoriesPage";
import ProductsPage from "./pages/ProductsPage";
import ServicesPage from "./pages/ServicesPage";
import CoursesPage from "./pages/CoursesPage";
import ProductDetail from "./pages/ProductDetail";
import CourseDetail from "./pages/CourseDetail";
import ServiceDetail from "./pages/ServiceDetail";
import CartPage from "./pages/Cart";
import CheckoutPage from "./pages/CheckoutPage";
import BrandsPage from "./pages/BrandsPage";
import BrandProductsPage from "./pages/BrandProductsPage";
import ProfilePage from "./pages/ProfilePage";

// New Pages
import AboutUsPage from "./pages/AboutUsPage";
import HelpSupportPage from "./pages/HelpSupportPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsConditionsPage from "./pages/TermsConditionsPage";
import FaqsPage from "./pages/FaqsPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-[#FAF8FC] min-h-screen flex flex-col">
        <Navbar />

        <main className="grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/brands/:brandSlug" element={<BrandProductsPage />} />

            <Route path="/categories" element={<CategoriesPage />} />

            <Route path="/products" element={<ProductsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/courses" element={<CoursesPage />} />

            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/products/:slug" element={<ProductDetail />} />

            <Route path="/service/:id" element={<ServiceDetail />} />
            <Route path="/service/:slug" element={<ServiceDetail />} />

            <Route path="/course/:slug" element={<CourseDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* Footer Pages */}
            <Route path="/about-us" element={<AboutUsPage />} />
            <Route path="/help-support" element={<HelpSupportPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-conditions" element={<TermsConditionsPage />} />
            <Route path="/faqs" element={<FaqsPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}