import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KYCRecord } from "@/types/kyc";
import { Bot, AlertTriangle, CheckCircle, Shield, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface AINoteSectionProps {
  record: KYCRecord;
}

const RiskMeter = ({ score }: { score: number }) => {
  const getRiskConfig = (score: number) => {
    if (score <= 30) return { color: "text-emerald-500", bg: "bg-emerald-500", label: "Low", icon: CheckCircle };
    if (score <= 70) return { color: "text-amber-500", bg: "bg-amber-500", label: "Medium", icon: AlertTriangle };
    return { color: "text-red-500", bg: "bg-red-500", label: "High", icon: Shield };
  };

  const config = getRiskConfig(score);
  const IconComponent = config.icon;

  return (
    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border">
      <div className="flex-shrink-0">
        <div className="relative">
          <svg className="w-12 h-12" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={config.bg}
              strokeWidth="3"
              strokeDasharray={`${score}, 100`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <IconComponent className={cn("w-4 h-4", config.color)} />
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          <Cpu className="w-3 h-3 text-slate-600" />
          <span className="text-xs font-semibold text-slate-700">Risk Score</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={cn("text-lg font-bold", config.color)}>{score}</span>
          <span className="text-xs text-slate-500">/ 100</span>
        </div>
        <div className={cn("text-xs font-medium", config.color)}>{config.label} Risk</div>
      </div>
    </div>
  );
};

const NoteCard = ({ 
  title, 
  content, 
  icon: Icon,
  variant = "default"
}: { 
  title: string; 
  content: string; 
  icon: React.ElementType;
  variant?: "default" | "warning" | "success";
}) => {
  const variants = {
    default: "border-l-blue-500 bg-blue-50",
    warning: "border-l-amber-500 bg-amber-50",
    success: "border-l-emerald-500 bg-emerald-50"
  };

  const iconColors = {
    default: "text-blue-600",
    warning: "text-amber-600",
    success: "text-emerald-600"
  };

  return (
    <div className={cn("flex gap-3 p-4 rounded-r-lg border-l-4", variants[variant])}>
      <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", iconColors[variant])} />
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-slate-800 mb-1.5">{title}</h4>
        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
};

export const AINoteSection = ({ record }: AINoteSectionProps) => {
  const { ai_notes } = record;
  // ai_notes.riskScore = 10;
  // ai_notes.livenessReview = ai_notes?.kycMatchReview;
  const hasNotes = ai_notes?.kycMatchReview || 
                  (ai_notes?.livenessReview && ai_notes.livenessReview.trim() !== "") || 
                  ai_notes?.tamperReview;

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-slate-800">
                AI Analysis
              </CardTitle>
              <p className="text-sm text-slate-500 mt-0.5">
                Automated verification insights
              </p>
            </div>
          </div>

          {ai_notes?.riskScore !== undefined && (
            <div className="flex-shrink-0 w-48">
              <RiskMeter score={ai_notes.riskScore} />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          {ai_notes?.tamperReview && (
            <NoteCard
              title="Tamper Detection Analysis"
              content={ai_notes.tamperReview}
              icon={Shield}
              variant="warning"
            />
          )}

          {ai_notes?.livenessReview && ai_notes.livenessReview.trim() !== "" && (
            <NoteCard
              title="Liveness Verification"
              content={ai_notes.livenessReview}
              icon={CheckCircle}
              variant="success"
            />
          )}

          {ai_notes?.kycMatchReview && (
            <NoteCard
              title="KYC Document Match"
              content={ai_notes.kycMatchReview}
              icon={Bot}
              variant="default"
            />
          )}

          {!hasNotes && (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">
                No AI analysis available for this record
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Automated verification results will appear here
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};