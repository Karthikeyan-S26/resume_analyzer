import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Briefcase } from 'lucide-react';

interface JobDescriptionInputProps {
  onJobDescriptionSubmit: (description: string) => void;
  jobDescription: string;
}

export function JobDescriptionInput({ 
  onJobDescriptionSubmit, 
  jobDescription 
}: JobDescriptionInputProps) {
  const [description, setDescription] = useState(jobDescription);

  const handleSubmit = () => {
    if (description.trim()) {
      onJobDescriptionSubmit(description);
    }
  };

  const sampleJobDescription = `Senior Software Engineer

We are seeking a highly skilled Senior Software Engineer to join our dynamic team. The ideal candidate will have 5+ years of experience in full-stack development.

Key Responsibilities:
• Design and develop scalable web applications using React, Node.js, and Python
• Collaborate with cross-functional teams in an Agile environment
• Implement CI/CD pipelines and DevOps best practices
• Mentor junior developers and conduct code reviews
• Optimize application performance and ensure high availability

Required Skills:
• Proficiency in JavaScript, TypeScript, Python
• Experience with React, Angular, or Vue.js
• Strong knowledge of databases (SQL and NoSQL)
• Familiarity with cloud platforms (AWS, GCP, or Azure)
• Experience with Git, Docker, and Kubernetes
• Understanding of software design patterns and clean architecture

Preferred Qualifications:
• Bachelor's degree in Computer Science or related field
• AWS/GCP certifications
• Experience with microservices architecture
• Strong problem-solving and communication skills`;

  const useSampleDescription = () => {
    setDescription(sampleJobDescription);
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="h-5 w-5 text-primary" />
        <Label className="text-base font-semibold">Job Description</Label>
      </div>
      
      <div className="space-y-4">
        <Textarea
          placeholder="Paste the job description here to analyze keyword matches..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[200px] resize-none"
        />
        
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleSubmit} disabled={!description.trim()}>
            Analyze Keywords
          </Button>
          <Button variant="outline" onClick={useSampleDescription}>
            Use Sample Job Description
          </Button>
        </div>
      </div>
    </Card>
  );
}