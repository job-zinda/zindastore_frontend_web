import { useState, useEffect, useCallback } from "react";
import { Star, Edit3, X } from "lucide-react";
import api from "../api/axios";

export default function ReviewsSection({ type = "courses", slug, id }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Form State
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newNameOrEmail, setNewNameOrEmail] = useState("");

  const targetSlug = slug || id;

  const fetchReviews = useCallback(async () => {
    if (!targetSlug) return;
    setLoading(true);
    try {
      const res = await api.get(`/${type}/${targetSlug}/reviews/`);
      const reviewList = Array.isArray(res.data) ? res.data : res.data.results || [];
      setReviews(reviewList);
    } catch (err) {
      // Fallback to numeric ID if slug failed
      if (id && id !== targetSlug) {
        try {
          const res = await api.get(`/${type}/${id}/reviews/`);
          const reviewList = Array.isArray(res.data) ? res.data : res.data.results || [];
          setReviews(reviewList);
          return;
        } catch (idErr) {
          console.warn("Could not fetch reviews by slug or ID:", idErr);
        }
      }
      console.warn("Could not fetch reviews:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [type, targetSlug, id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newNameOrEmail.trim() || !newBody.trim()) {
      return alert("Please enter your name/email and review message.");
    }
    setReviewSubmitting(true);

    const payload = {
      rating: newRating,
      title: newTitle.trim(),
      body: newBody.trim(),
      name_or_email: newNameOrEmail.trim(),
    };

    const targetUrlSlug = `/${type}/${targetSlug}/reviews/`;
    const targetUrlId = id ? `/${type}/${id}/reviews/` : null;

    try {
      await api.post(targetUrlSlug, payload);
      alert("Review submitted successfully!");
      setShowModal(false);
      setNewTitle("");
      setNewBody("");
      setNewNameOrEmail("");
      setNewRating(5);
      fetchReviews();
    } catch (firstErr) {
      if (targetUrlId && targetUrlSlug !== targetUrlId) {
        try {
          await api.post(targetUrlId, payload);
          alert("Review submitted successfully!");
          setShowModal(false);
          setNewTitle("");
          setNewBody("");
          setNewNameOrEmail("");
          setNewRating(5);
          fetchReviews();
          return;
        } catch (secondErr) {
          console.error("Review submit failed on ID URL as well:", secondErr);
        }
      }
      console.error("Review submit error:", firstErr?.response?.data || firstErr);
      const errDetail = firstErr?.response?.data?.detail || "Failed to submit review. Please try again.";
      alert(`Submission Error: ${errDetail}`);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <>
      {/* Reviews & Ratings Section */}
      <div className="pt-6 border-t border-gray-200 space-y-3">
        <h3 className="font-semibold text-gray-900 text-base">Reviews & Ratings</h3>
        {loading ? (
          <p className="text-xs text-gray-400 py-2">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-xs text-gray-500 py-2">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev, index) => (
              <div
                key={rev.id || index}
                className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-1 text-amber-500 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < rev.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                {rev.title && (
                  <p className="text-sm font-bold text-gray-800 mb-0.5">{rev.title}</p>
                )}
                <p className="text-sm text-gray-600 leading-relaxed">{rev.body}</p>
                <p className="text-xs text-gray-400 mt-2">- {rev.name_or_email}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Write a Review Button */}
      <div className="fixed bottom-4 right-4 z-20">
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#FAF8FC] border border-purple-300 text-[#8E24AA] px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 shadow-lg hover:bg-purple-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <Edit3 size={16} /> Write a review
        </button>
      </div>

      {/* Write a Review Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-30">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="font-bold text-gray-800 text-lg">Write a Review</h3>
            <form onSubmit={handleAddReview} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 font-semibold mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="text-amber-500 cursor-pointer p-0.5 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={24}
                        fill={star <= newRating ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 font-semibold mb-1">
                  Name / Email
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your Name or Email"
                  value={newNameOrEmail}
                  onChange={(e) => setNewNameOrEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#8E24AA] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Short summary (e.g. Excellent course!)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#8E24AA] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 font-semibold mb-1">Review</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Share your experience..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#8E24AA] outline-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-500 cursor-pointer hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-5 py-2 rounded-xl text-xs bg-[#8E24AA] text-white cursor-pointer disabled:opacity-50 font-semibold hover:bg-[#7b1fa2]"
                >
                  {reviewSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
