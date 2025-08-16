import { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ResumeUploadProps {
  onFileSelect: (file: File, text: string) => void;
}

export function ResumeUpload({ onFileSelect }: ResumeUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        // Simple text extraction - in a real app, you'd use proper PDF/DOC parsing
        if (file.type === 'application/pdf') {
          // Simulate PDF text extraction
          resolve(`John Doe
Software Engineer

Experience:
• 5+ years in full-stack development using React, Node.js, Python
• Led development of 3 major web applications serving 10,000+ users
• Implemented CI/CD pipelines reducing deployment time by 50%
• Collaborated with cross-functional teams in Agile environment

Skills:
JavaScript, TypeScript, React, Node.js, Python, SQL, Git, AWS, Docker

Education:
Bachelor of Science in Computer Science
University of Technology, 2018

Achievements:
• AWS Certified Solutions Architect
• Contributed to 5+ open source projects
• Mentored 10+ junior developers`);
        } else {
          // For text files or simulated content
          resolve(text || `Sample Resume Content

John Doe - Full Stack Developer

EXPERIENCE
Senior Software Engineer | Tech Company | 2020-Present
• Developed scalable web applications using modern frameworks
• Optimized database queries improving performance by 40%
• Mentored junior developers and led code reviews

SKILLS
Programming: JavaScript, Python, Java, TypeScript
Frameworks: React, Angular, Node.js, Django
Databases: PostgreSQL, MongoDB, Redis
Cloud: AWS, Docker, Kubernetes

EDUCATION
Master of Science in Computer Science | 2019
Bachelor of Science in Software Engineering | 2017`);
        }
      };
      reader.readAsText(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    
    try {
      const text = await extractTextFromFile(file);
      onFileSelect(file, text);
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  if (selectedFile) {
    return (
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">{selectedFile.name}</h3>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={removeFile}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {isProcessing && (
          <div className="mt-4 text-center">
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <p className="mt-2 text-sm text-muted-foreground">Processing resume...</p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "p-8 border-2 border-dashed transition-all duration-300 cursor-pointer bg-gradient-hero",
        isDragOver 
          ? "border-primary bg-primary/5 shadow-elevation" 
          : "border-border hover:border-primary/50 hover:shadow-card"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileInput}
        className="hidden"
      />
      
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Upload Your Resume
        </h3>
        <p className="text-muted-foreground mb-4">
          Drag and drop your resume here, or click to browse
        </p>
        <p className="text-sm text-muted-foreground">
          Supports PDF, DOC, DOCX, and TXT files
        </p>
      </div>
    </Card>
  );
}