"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Bug,
  Lightbulb,
  HelpCircle,
  Star,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Filter,
  ArrowUpDown,
  User,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { toast } from "sonner";
import { db, DBFeedback } from "@/lib/supabase";

export default function AdminFeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<DBFeedback[]>([]);
  const [filteredList, setFilteredList] = useState<DBFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "rating-desc" | "rating-asc">("newest");

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const list = await db.getAllFeedback();
      setFeedbackList(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load feedback records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  // Filter & Sort logic
  useEffect(() => {
    let result = [...feedbackList];

    if (categoryFilter !== "all") {
      result = result.filter((f) => f.category === categoryFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((f) => (f.status || "open") === statusFilter);
    }

    if (priorityFilter !== "all") {
      result = result.filter((f) => {
        if (priorityFilter === "unassigned") return !f.priority;
        return f.priority === priorityFilter;
      });
    }

    // Sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
    } else if (sortBy === "rating-desc") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "rating-asc") {
      result.sort((a, b) => a.rating - b.rating);
    }

    setFilteredList(result);
  }, [feedbackList, categoryFilter, statusFilter, priorityFilter, sortBy]);

  const handleUpdate = async (
    feedbackId: string,
    newStatus: "open" | "investigating" | "resolved",
    newPriority: "high" | "medium" | "low" | null
  ) => {
    try {
      const updated = await db.updateFeedbackStatusAndPriority(feedbackId, newStatus, newPriority);
      setFeedbackList((prev) =>
        prev.map((f) => (f.id === feedbackId ? { ...f, status: updated.status, priority: updated.priority } : f))
      );
      toast.success("Feedback status updated successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update feedback record.");
    }
  };

  // Metrics
  const totalCount = feedbackList.length;
  const bugCount = feedbackList.filter((f) => f.category === "bug").length;
  const suggestionCount = feedbackList.filter((f) => f.category === "suggestion").length;
  const avgRating = totalCount > 0 ? (feedbackList.reduce((acc, f) => acc + f.rating, 0) / totalCount).toFixed(1) : "0.0";

  return (
    <DashboardShell>
      <div className="space-y-8 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground font-heading">Feedback & Bug Center</h1>
            <p className="text-xs text-muted-foreground mt-1.5">
              Review, prioritize, and manage user suggestions and bug reports.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadFeedback} className="h-9 rounded-xl border-border">
            Refresh List
          </Button>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <Card className="border-border/60 bg-card rounded-[22px] shadow-premium">
            <CardContent className="p-6">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Submissions</span>
              <span className="text-3xl font-black tracking-tight text-foreground block mt-2">{totalCount}</span>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card rounded-[22px] shadow-premium">
            <CardContent className="p-6">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Bugs Reported</span>
              <span className="text-3xl font-black tracking-tight text-destructive block mt-2">{bugCount}</span>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card rounded-[22px] shadow-premium">
            <CardContent className="p-6">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Suggestions</span>
              <span className="text-3xl font-black tracking-tight text-cyan-500 block mt-2">{suggestionCount}</span>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card rounded-[22px] shadow-premium">
            <CardContent className="p-6">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Average Satisfaction</span>
              <div className="flex items-center mt-2.5 space-x-2">
                <span className="text-3xl font-black tracking-tight text-foreground">{avgRating}</span>
                <span className="text-amber-500 flex"><Star className="fill-current" size={16} /></span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtering Controls */}
        <Card className="border-border/60 bg-card rounded-[22px] shadow-premium">
          <CardContent className="p-5 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <Filter size={14} className="text-muted-foreground" />
              <span className="font-semibold text-muted-foreground">Filters:</span>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">Category:</span>
              <select
                id="categoryFilterSelect"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-muted/30 border border-border rounded-lg py-1 px-2 text-foreground focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="bug">Bugs</option>
                <option value="suggestion">Suggestions</option>
                <option value="other">Others</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">Status:</span>
              <select
                id="statusFilterSelect"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-muted/30 border border-border rounded-lg py-1 px-2 text-foreground focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">Priority:</span>
              <select
                id="priorityFilterSelect"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-muted/30 border border-border rounded-lg py-1 px-2 text-foreground focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-1 ml-auto">
              <ArrowUpDown size={14} className="text-muted-foreground" />
              <span className="text-muted-foreground">Sort:</span>
              <select
                id="sortFilterSelect"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-muted/30 border border-border rounded-lg py-1 px-2 text-foreground focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="rating-desc">Rating: High to Low</option>
                <option value="rating-asc">Rating: Low to High</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Feedback List */}
        {loading ? (
          <div className="text-center py-12 text-sm text-muted-foreground">Loading submissions...</div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground border border-dashed border-border rounded-2xl">
            No feedback entries match your filter settings.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredList.map((item) => {
              const currentStatus = item.status || "open";
              const currentPriority = item.priority || null;

              return (
                <Card
                  key={item.id}
                  className="border-border/60 bg-card rounded-[22px] shadow-premium hover:border-primary/20 transition-all duration-200"
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Header line */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {item.category === "bug" ? (
                          <div className="p-2 bg-destructive/10 text-destructive rounded-xl">
                            <Bug size={18} />
                          </div>
                        ) : item.category === "suggestion" ? (
                          <div className="p-2 bg-cyan-500/10 text-cyan-500 rounded-xl">
                            <Lightbulb size={18} />
                          </div>
                        ) : (
                          <div className="p-2 bg-zinc-500/10 text-zinc-400 rounded-xl">
                            <HelpCircle size={18} />
                          </div>
                        )}

                        <div>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-muted/40 text-muted-foreground border-0 rounded-full font-semibold text-[9px] uppercase px-2 py-0.5">
                              {item.category}
                            </Badge>
                            <div className="flex text-amber-500">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={11}
                                  className={s <= item.rating ? "fill-current" : "opacity-25"}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center text-[10px] text-muted-foreground mt-1.5 space-x-3.5">
                            <span className="flex items-center"><User size={10} className="mr-1" /> {item.user_id}</span>
                            <span className="flex items-center">
                              <Calendar size={10} className="mr-1" />
                              {new Date(item.submitted_at).toLocaleDateString()} at{" "}
                              {new Date(item.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Hand Actions: Priority and Status Toggles */}
                      <div className="flex items-center space-x-3">
                        {/* Priority Selector */}
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase">Priority</label>
                          <select
                            value={currentPriority || ""}
                            onChange={(e) =>
                              handleUpdate(item.id, currentStatus, (e.target.value || null) as any)
                            }
                            className={`text-[10px] font-bold rounded-lg border px-1.5 py-1 focus:outline-none cursor-pointer uppercase ${
                              currentPriority === "high"
                                ? "bg-destructive/10 border-destructive text-destructive"
                                : currentPriority === "medium"
                                ? "bg-amber-500/10 border-amber-500 text-amber-500"
                                : currentPriority === "low"
                                ? "bg-cyan-500/10 border-cyan-500 text-cyan-500"
                                : "bg-muted/30 border-border text-muted-foreground"
                            }`}
                          >
                            <option value="">Unassigned</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>

                        {/* Status Selector */}
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase">Status</label>
                          <select
                            value={currentStatus}
                            onChange={(e) => handleUpdate(item.id, e.target.value as any, currentPriority)}
                            className={`text-[10px] font-bold rounded-lg border px-1.5 py-1 focus:outline-none cursor-pointer uppercase ${
                              currentStatus === "resolved"
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                                : currentStatus === "investigating"
                                ? "bg-purple-500/10 border-purple-500 text-purple-500"
                                : "bg-blue-500/10 border-blue-500 text-blue-500"
                            }`}
                          >
                            <option value="open">Open</option>
                            <option value="investigating">Investigating</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Message */}
                    <div className="bg-muted/20 border border-border/40 rounded-xl p-4 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                      {item.message}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
