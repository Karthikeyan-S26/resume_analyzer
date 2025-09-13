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
    const ext = file.name.split('.').pop()?.toLowerCase();

    // PDF (robust text extraction using pdfjs-dist)
    if (file.type === 'application/pdf' || ext === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib: any = await import('pdfjs-dist');
      const workerSrc = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let text = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const strings = (content.items || []).map((item: any) => item.str);
        text += strings.join(' ') + '\n';
      }
      return text.trim();
    }

    // DOCX (client-side using mammoth)
    if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      ext === 'docx'
    ) {
      const arrayBuffer = await file.arrayBuffer();
      const mammoth: any = await import('mammoth/mammoth.browser');
      const result = await mammoth.extractRawText({ arrayBuffer });
      return (result?.value || '').trim();
    }

    // TXT (simple)
    if (file.type === 'text/plain' || ext === 'txt') {
      return await file.text();
    }

    // Legacy .doc or unknown types – best-effort fallback
    try {
      return await file.text();
    } catch (e) {
      throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT.');
    }
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
          accept=".pdf,.docx,.txt"
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
          Supports PDF, DOCX, and TXT files
        </p>
      </div>
    </Card>
  );
}