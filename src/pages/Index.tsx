import { useState } from 'react';
import { ResumeUpload } from '@/components/ResumeUpload';
import { JobDescriptionInput } from '@/components/JobDescriptionInput';
import { AnalysisResults, AnalysisData } from '@/components/AnalysisResults';
import { ResumeAnalyzer } from '@/utils/resumeAnalyzer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileSearch, Target, TrendingUp, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (file: File, text: string) => {
    setResumeFile(file);
    setResumeText(text);
    setAnalysis(null);
    toast({
      title: "Resume uploaded successfully",
      description: `${file.name} is ready for analysis`,
    });
  };

  const handleJobDescriptionSubmit = (description: string) => {
    setJobDescription(description);
    toast({
      title: "Job description added",
      description: "Ready to analyze keyword matches",
    });
  };

  const analyzeResume = async () => {
    if (!resumeText) {
      toast({
        title: "No resume uploaded",
        description: "Please upload a resume first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis delay for better UX
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const analyzer = new ResumeAnalyzer(resumeText, jobDescription);
      const result = analyzer.analyze();
      setAnalysis(result);
      
      toast({
        title: "Analysis complete!",
        description: `Your resume scored ${result.overallScore}/100`,
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Something went wrong during analysis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setResumeFile(null);
    setResumeText('');
    setJobDescription('');
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <FileSearch className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Resume Analyzer</h1>
                <p className="text-sm text-muted-foreground">
                  AI-powered resume optimization tool
                </p>
              </div>
            </div>
            {analysis && (
              <Button variant="outline" onClick={resetAnalysis}>
                Analyze New Resume
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!analysis ? (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Optimize Your Resume for Success
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get instant feedback on your resume with our advanced analysis tool. 
                Improve keyword matching, structure, and formatting to land your dream job.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 bg-gradient-card shadow-card text-center">
                <Target className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Keyword Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Match your resume keywords with job requirements
                </p>
              </Card>
              
              <Card className="p-6 bg-gradient-card shadow-card text-center">
                <TrendingUp className="h-8 w-8 text-success mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Score & Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Get detailed scoring and improvement suggestions
                </p>
              </Card>
              
              <Card className="p-6 bg-gradient-card shadow-card text-center">
                <Zap className="h-8 w-8 text-warning mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Instant Results</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time analysis with actionable feedback
                </p>
              </Card>
            </div>

            {/* Upload Section */}
            <div className="space-y-6">
              <ResumeUpload onFileSelect={handleFileSelect} />
              
              {resumeFile && (
                <JobDescriptionInput
                  onJobDescriptionSubmit={handleJobDescriptionSubmit}
                  jobDescription={jobDescription}
                />
              )}

              {resumeFile && (
                <div className="text-center">
                  <Button
                    onClick={analyzeResume}
                    disabled={isAnalyzing}
                    className="bg-gradient-primary text-white px-8 py-3 text-lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Analyzing Resume...
                      </>
                    ) : (
                      <>
                        <FileSearch className="h-5 w-5 mr-2" />
                        Analyze Resume
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Analysis Results
              </h2>
              <p className="text-muted-foreground">
                Here's your comprehensive resume analysis with actionable insights
              </p>
            </div>
            <AnalysisResults analysis={analysis} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
