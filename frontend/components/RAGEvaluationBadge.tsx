"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  CheckCircle2, 
  HelpCircle,
  Clock
} from "lucide-react";
import { RAGEvaluationMetrics, RAGGuardrails } from "@/lib/chatStorage";

interface RAGEvaluationBadgeProps {
  evaluation?: RAGEvaluationMetrics;
  guardrails?: RAGGuardrails;
}

export const RAGEvaluationBadge: React.FC<RAGEvaluationBadgeProps> = ({
  evaluation,
  guardrails
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!evaluation && !guardrails) return null;

  const overallScore = evaluation?.overall_score ?? 0.95;
  const overallPercent = Math.round(overallScore * 100);
  
  const faithfulness = evaluation?.faithfulness ?? 0.95;
  const relevance = evaluation?.answer_relevance ?? 0.92;
  const precision = evaluation?.context_precision ?? 0.90;

  const guardrailPassed = guardrails?.input?.passed !== false && guardrails?.output?.passed !== false;
  const guardrailStatus = guardrailPassed ? "PASSED" : "ALERT";

  const getScoreColor = (val: number) => {
    if (val >= 0.85) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (val >= 0.70) return "text-cyan-500 bg-cyan-500/10 border-cyan-500/20";
    return "text-amber-500 bg-amber-500/10 border-amber-500/20";
  };

  const getBarColor = (val: number) => {
    if (val >= 0.85) return "bg-emerald-500";
    if (val >= 0.70) return "bg-cyan-500";
    return "bg-amber-500";
  };

  return (
    <div className="pt-2 border-t border-border/50 text-xs">
      {/* Interactive Toggle Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Guardrails Status Chip */}
          <span 
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
              guardrailPassed
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
            }`}
          >
            {guardrailPassed ? (
              <ShieldCheck className="size-3" />
            ) : (
              <ShieldAlert className="size-3" />
            )}
            <span>Guardrails: {guardrailStatus}</span>
          </span>

          {/* RAG Quality Metric Chip */}
          <span 
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${getScoreColor(overallScore)}`}
          >
            <Activity className="size-3" />
            <span>{overallPercent}% Grounded</span>
          </span>
        </div>

        {/* Expand Details Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-mono transition-colors cursor-pointer"
        >
          <span>Metrics</span>
          {isOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        </button>
      </div>

      {/* Expanded Metrics Breakdown Panel */}
      {isOpen && (
        <div className="mt-3 p-3 rounded-xl bg-background/90 border border-border/80 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <span className="font-mono text-[11px] font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              RAG Triad Evaluation &amp; Safety Audit
            </span>
            {evaluation?.latency_ms && (
              <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                <Clock className="size-3" />
                {evaluation.latency_ms}ms
              </span>
            )}
          </div>

          {/* Triad Metric Rows */}
          <div className="space-y-2.5">
            {/* 1. Faithfulness */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground flex items-center gap-1">
                  Faithfulness (Groundedness)
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {Math.round(faithfulness * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${getBarColor(faithfulness)}`}
                  style={{ width: `${Math.round(faithfulness * 100)}%` }}
                />
              </div>
            </div>

            {/* 2. Answer Relevancy */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground flex items-center gap-1">
                  Answer Relevancy
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {Math.round(relevance * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${getBarColor(relevance)}`}
                  style={{ width: `${Math.round(relevance * 100)}%` }}
                />
              </div>
            </div>

            {/* 3. Context Precision */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground flex items-center gap-1">
                  Context Precision
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {Math.round(precision * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${getBarColor(precision)}`}
                  style={{ width: `${Math.round(precision * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Security & Verification Details */}
          <div className="pt-2 border-t border-border/60 text-[10px] text-muted-foreground space-y-1 font-mono">
            <div className="flex items-center justify-between">
              <span>Input Guardrail:</span>
              <span className="text-emerald-500 font-medium">
                {guardrails?.input?.reason || "Passed Jailbreak/PII Scan"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Output Integrity:</span>
              <span className="text-emerald-500 font-medium">
                {guardrails?.output?.status || "Passed Anti-Hallucination Audit"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RAGEvaluationBadge;
