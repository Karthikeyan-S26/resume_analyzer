import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Target,
  FileText,
  Award,
  Lightbulb
} from 'lucide-react';

export interface AnalysisData {
  overallScore: number;
  keywordMatches: string[];
  missingKeywords: string[];
  suggestions: string[];
  structureScore: number;
  contentScore: number;
  formattingScore: number;
}

interface AnalysisResultsProps {
  analysis: AnalysisData;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Overall Score</h2>
          </div>
          <Badge variant={getScoreBadge(analysis.overallScore) as any} className="text-lg px-3 py-1">
            {analysis.overallScore}/100
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Structure</span>
              <span className={getScoreColor(analysis.structureScore)}>
                {analysis.structureScore}%
              </span>
            </div>
            <Progress value={analysis.structureScore} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Content</span>
              <span className={getScoreColor(analysis.contentScore)}>
                {analysis.contentScore}%
              </span>
            </div>
            <Progress value={analysis.contentScore} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Formatting</span>
              <span className={getScoreColor(analysis.formattingScore)}>
                {analysis.formattingScore}%
              </span>
            </div>
            <Progress value={analysis.formattingScore} className="h-2" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keyword Matches */}
        <Card className="p-6 bg-gradient-card shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-success" />
            <h3 className="text-lg font-semibold text-foreground">Matched Keywords</h3>
            <Badge variant="secondary">{analysis.keywordMatches.length}</Badge>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {analysis.keywordMatches.map((keyword, index) => (
              <Badge key={index} variant="outline" className="border-success text-success">
                {keyword}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Missing Keywords */}
        <Card className="p-6 bg-gradient-card shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="h-5 w-5 text-destructive" />
            <h3 className="text-lg font-semibold text-foreground">Missing Keywords</h3>
            <Badge variant="destructive">{analysis.missingKeywords.length}</Badge>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {analysis.missingKeywords.map((keyword, index) => (
              <Badge key={index} variant="outline" className="border-destructive text-destructive">
                {keyword}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      {/* Suggestions */}
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-warning" />
          <h3 className="text-lg font-semibold text-foreground">Improvement Suggestions</h3>
        </div>
        
        <div className="space-y-3">
          {analysis.suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground">{suggestion}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}