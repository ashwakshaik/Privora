"use client";

import React, { useState } from "react";
import { MessageSquare, Star, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { db } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import { telemetry } from "@/components/shared/analytics";

export function FeedbackModal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<"bug" | "suggestion" | "other">("suggestion");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to submit feedback.");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a feedback message.");
      return;
    }

    setIsSubmitting(true);
    try {
      await db.submitFeedback(user.id, category, rating, message);
      
      // Telemetry log event
      telemetry.event("Feedback Submitted", {
        category,
        rating,
        user_email: user.email
      });

      toast.success("Thank you! Your feedback has been recorded.");
      setMessage("");
      setRating(5);
      setCategory("suggestion");
      setIsOpen(false);
    } catch {
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-45 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2.5 rounded-full flex items-center space-x-2 shadow-premium hover:opacity-90 active:scale-95 transition-all duration-150 cursor-pointer"
        aria-label="Send Feedback"
      >
        <MessageSquare size={16} />
        <span className="text-xs font-bold tracking-tight">Beta Feedback</span>
      </button>

      {/* Glassmorphism Backdrop Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#09090B] border border-border/80 rounded-2xl w-full max-w-md p-6 relative shadow-premium overflow-hidden">
            {/* Ambient visual background glow */}
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/20 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-secondary/20 rounded-full blur-xl pointer-events-none" />

            {/* Header section */}
            <div className="flex items-center justify-between mb-4 relative">
              <div className="flex items-center space-x-2">
                <Sparkles size={16} className="text-primary" />
                <h3 className="text-sm font-bold text-foreground font-heading">Submit Beta Feedback</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                aria-label="Close feedback modal"
              >
                <X size={16} />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 relative text-left">
              {/* Category tabs */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["bug", "suggestion", "other"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all duration-150 cursor-pointer ${
                        category === cat
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-muted/10 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating stars */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Experience Rating</label>
                <div className="flex items-center space-x-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-muted-foreground hover:scale-110 active:scale-95 transition duration-100 cursor-pointer"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        size={20}
                        className={star <= rating ? "fill-primary text-primary" : "text-muted-foreground/40"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback description text area */}
              <div className="space-y-1.5">
                <label htmlFor="feedbackMessage" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Feedback Details</label>
                <textarea
                  id="feedbackMessage"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what worked, what failed, or what we can improve..."
                  rows={4}
                  className="w-full bg-muted/20 border border-border rounded-xl p-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold flex items-center justify-center border-0 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="mr-2 animate-spin" />
                    Submitting Feedback...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
