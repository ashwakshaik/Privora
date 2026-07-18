"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Globe,
  Users,
  Building,
  Send,
  User,
  Bot,
  Loader2,
  ChevronRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/shared/dashboard-shell";

interface Message {
  sender: "user" | "myrah";
  text: string;
  timestamp: Date;
}

export default function RoadmapPlanningPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "myrah",
      text: "Hello! I am MYRAH, your personal AI Privacy Assistant. I am here to help you understand your data broker exposure, draft opt-out legal requests, or outline your rights under CCPA/GDPR. Ask me anything!",
      timestamp: new Date(),
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const roadmapMilestones = [
    {
      title: "AI Privacy Assistant (MYRAH)",
      badge: "In Sandbox",
      desc: "Intelligent agent trained on privacy laws (CCPA, GDPR, CPRA) to compile custom risk mitigations and draft opt-out forms.",
      icon: Sparkles,
      color: "bg-primary/10 text-primary border-primary/20",
    },
    {
      title: "Browser Privacy Extension",
      badge: "Q3 2026",
      desc: "Real-time cookie banner auto-rejection, tracking scripts blocker, and anti-fingerprinting controls.",
      icon: Globe,
      color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    },
    {
      title: "Family Dashboard Hub",
      badge: "Q4 2026",
      desc: "Protect kids, spouses, or elderly parents from search exposure under a unified management portal.",
      icon: Users,
      color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    },
    {
      title: "Enterprise Breach Protection",
      badge: "Q1 2027",
      desc: "Employee list dark web scanners and API integrations to secure executive credentials from corporate phishing vectors.",
      icon: Building,
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
  ];

  const quickQuestions = [
    "How is my Privacy Score calculated?",
    "Draft a CCPA opt-out template",
    "What features are coming in v1.1?",
  ];

  const getMyrahResponse = (query: string): string => {
    const q = query.toLowerCase();
    
    if (q.includes("hi") || q.includes("hello") || q.includes("hey")) {
      return "Hello! I am MYRAH, your personal AI Privacy Assistant. I can help you understand your data broker exposure, draft opt-out notices, or explain legal rights under CCPA/GDPR. What would you like to discuss today?";
    }
    
    if (q.includes("score") || q.includes("privacy score") || q.includes("calculate") || q.includes("deduct")) {
      return "Your Privacy Score starts at a baseline of 100. Points are deducted based on active broker exposures: High Severity (home address/phone) subtracts 8 points, Medium (emails) subtracts 3 points, and Low (estimated age/relatives) subtracts 1 point. Enabling Autopilot grants you a +10 point bonus. Once opt-out requests are completed, deductions are recovered!";
    }
    
    if (q.includes("ccpa") || q.includes("gdpr") || q.includes("template") || q.includes("draft") || q.includes("letter")) {
      return `Here is a formal CCPA/GDPR Opt-out Request template you can use:

Subject: Request to Opt-Out of Sale/Sharing and Delete My Personal Information

Dear Data Compliance Officer,

Under the California Consumer Privacy Act (CCPA) / General Data Protection Regulation (GDPR), I hereby request that you:
1. Cease selling, sharing, or processing my personal information.
2. Delete all records and profiles associated with my identity from your systems and databases.

My search details:
- Full Name: [Your Name]
- Associated Location: [Your State/City]
- Associated Email: [Your Email]

Please confirm receipt and compliance within the statutory timeline.

Sincerely,
[Your Name]`;
    }
    
    if (q.includes("extension") || q.includes("chrome") || q.includes("browser")) {
      return "The Privora Browser Extension is scheduled for Q3 2026! It will block tracking scripts in real-time, automatically reject cookie opt-out popups, and prevent websites from building fingerprint data maps of your browser and OS.";
    }
    
    if (q.includes("family") || q.includes("parent") || q.includes("child")) {
      return "The Family Dashboard Hub is launching in Q4 2026. It will support up to 5 family members under a single Pro subscription plan, making it simple to request automated removals for your kids, partner, or parents.";
    }

    if (q.includes("broker") || q.includes("spokeo") || q.includes("whitepages") || q.includes("leakcheck")) {
      return "Data brokers crawl public government files and commercial listings to resell your profile details. Legally, you can request deletions. Privora handles this automatically, but if you're on the free tier, you can follow our manual step sheets under the 'Removal Center' module.";
    }

    if (q.includes("roadmap") || q.includes("version 1.1") || q.includes("features") || q.includes("v1.1")) {
      return "Version 1.1 focuses on expansion: our MYRAH assistant sandbox, the Browser Extension tracker shield, the Family Protection Hub, and Enterprise APIs. Check out the roadmap cards above for full scheduling details!";
    }

    return "Thank you for the message! As a v1.1 preview sandbox assistant, I can guide you on data broker opt-outs, CCPA/GDPR guidelines, score mechanics, or version 1.1 products (Family dashboard, browser extensions). How can I assist you further?";
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // 1. Add User Message
    const userMsg: Message = {
      sender: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    // 2. Trigger Mock Bot Typing Delay
    setTimeout(() => {
      const responseText = getMyrahResponse(text);
      const botMsg: Message = {
        sender: "myrah",
        text: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 900);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <DashboardShell>
      <div className="space-y-8 text-left">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold text-foreground font-heading">Roadmap & AI Sandbox</h1>
          <p className="text-xs text-muted-foreground mt-1.5">
            Explore Privora's Version 1.1 development milestones and interact with MYRAH.
          </p>
        </div>

        {/* Milestone Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {roadmapMilestones.map((ms, idx) => {
            const Icon = ms.icon;
            return (
              <Card key={idx} className="border-border/60 bg-card rounded-[22px] shadow-premium flex flex-col justify-between hover:border-primary/20 transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl ${ms.color}`}>
                      <Icon size={18} />
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full text-[9px] font-semibold">
                      {ms.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xs font-bold text-foreground mt-3">{ms.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {ms.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* MYRAH AI Chatbot Sandbox Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Chat Window (60%) */}
          <Card className="lg:col-span-3 border-border/60 bg-card rounded-[22px] shadow-premium flex flex-col h-[520px] overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
            
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                  <Bot size={16} />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">MYRAH Sandbox v1.1</CardTitle>
                  <CardDescription className="text-[9px] text-muted-foreground">
                    Conversational agent sandbox.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            {/* Chat Log Message Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-2.5 max-w-[85%] ${
                    msg.sender === "user" ? "ml-auto flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg mt-0.5 ${
                      msg.sender === "user" ? "bg-primary text-white" : "bg-muted/30 text-foreground border border-border/30"
                    }`}
                  >
                    {msg.sender === "user" ? <User size={13} /> : <Bot size={13} className="text-primary" />}
                  </div>
                  
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-primary/10 text-foreground border border-primary/20 text-right"
                        : "bg-muted/15 text-foreground border border-border/20"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-center space-x-2 text-muted-foreground text-xs pl-2">
                  <Loader2 size={12} className="animate-spin text-primary" />
                  <span>MYRAH is compiling response...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Questions & Input Box */}
            <div className="p-4 border-t border-border/40 bg-muted/5 space-y-3">
              {/* Quick Questions Toggles */}
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="text-[9px] font-medium bg-muted/40 border border-border/55 rounded-full px-2.5 py-1 text-muted-foreground hover:text-foreground hover:bg-muted/75 transition cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input Field */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputVal);
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ask MYRAH about data brokers, scores, or legal rights..."
                  className="bg-muted/20 border-border text-xs rounded-xl h-9 flex-1"
                />
                <Button type="submit" size="icon" className="h-9 w-9 rounded-xl bg-primary text-white hover:opacity-90">
                  <Send size={14} />
                </Button>
              </form>
            </div>
          </Card>

          {/* Assistant Info Sheet (40%) */}
          <Card className="lg:col-span-2 border-border/60 bg-card rounded-[22px] shadow-premium flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground">AI Integration Blueprint</CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                How MYRAH works under the hood.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-muted-foreground leading-relaxed">
              <div className="space-y-2 border-b border-border/40 pb-4">
                <h4 className="font-semibold text-foreground flex items-center gap-1.5"><Sparkles size={12} className="text-primary" /> RAG Legal Engine</h4>
                <p className="text-[10px]">
                  MYRAH queries vector datasets containing state and national privacy legislations (CCPA, CPRA, GDPR) to supply accurate compliance templates.
                </p>
              </div>

              <div className="space-y-2 border-b border-border/40 pb-4">
                <h4 className="font-semibold text-foreground flex items-center gap-1.5"><Bot size={12} className="text-primary" /> Context-Aware Diagnostics</h4>
                <p className="text-[10px]">
                  Analyzes your current exposed registry profiles to list customized action plans and guide manual deletions.
                </p>
              </div>

              <div className="flex items-start gap-2 bg-primary/5 border border-primary/10 rounded-xl p-3 text-[10px] text-primary">
                <Info size={12} className="mt-0.5 shrink-0" />
                <span>
                  The sandbox uses local heuristic dialog trees. Production will route to LLM serverless endpoints synchronized to pgvector database tables.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
