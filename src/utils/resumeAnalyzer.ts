import { AnalysisData } from '@/components/AnalysisResults';

export class ResumeAnalyzer {
  private resumeText: string;
  private jobDescription: string;

  constructor(resumeText: string, jobDescription: string = '') {
    this.resumeText = resumeText;
    this.jobDescription = jobDescription;
  }

  public analyze(): AnalysisData {
    const keywordMatches = this.findKeywordMatches();
    const missingKeywords = this.findMissingKeywords();
    const structureScore = this.analyzeStructure();
    const contentScore = this.analyzeContent();
    const formattingScore = this.analyzeFormatting();
    const suggestions = this.generateSuggestions(structureScore, contentScore, formattingScore);
    
    const overallScore = Math.round(
      (structureScore + contentScore + formattingScore) / 3
    );

    return {
      overallScore,
      keywordMatches,
      missingKeywords,
      suggestions,
      structureScore,
      contentScore,
      formattingScore,
    };
  }

  private extractKeywords(text: string): string[] {
    // Build patterns and count precise occurrences (word-boundary / exact phrase)
    const patterns = this.buildKeywordPatterns();
    const counts = this.getKeywordCounts(text);
    return Object.entries(counts)
      .filter(([, c]) => c > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k);
  }

  // Create robust regex patterns per canonical keyword (handles plural, hyphens, REST/Java, CI/CD, Node.js)
  private buildKeywordPatterns(): Array<{ key: string; regex: RegExp }> {
    const techKeywords = [
      'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue',
      'node.js', 'express', 'django', 'flask', 'spring', 'sql', 'nosql',
      'mongodb', 'postgresql', 'mysql', 'redis', 'aws', 'azure', 'gcp',
      'docker', 'kubernetes', 'ci/cd', 'git', 'agile', 'scrum', 'devops',
      'microservices', 'api', 'rest', 'graphql', 'testing', 'junit',
      'jest', 'cypress', 'selenium', 'machine learning', 'ai', 'data science'
    ];

    const softKeywords = [
      'leadership', 'communication', 'problem solving', 'team player',
      'collaborative', 'mentoring', 'project management', 'analytical',
      'detail oriented', 'time management', 'adaptable', 'innovative'
    ];

    const experienceKeywords = [
      'years of experience', 'senior', 'lead', 'architect', 'full-stack',
      'frontend', 'backend', 'development', 'engineering', 'design',
      'implementation', 'optimization', 'performance', 'scalability'
    ];

    const allKeywords = [...techKeywords, ...softKeywords, ...experienceKeywords];

    const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const toRegex = (kw: string): RegExp => {
      // Special handling for tricky cases
      if (kw === 'node.js') return /\bnode\.?js\b/gi;
      if (kw === 'ci/cd') return /\bci\s*\/?\s*cd\b/gi;
      if (kw === 'full-stack') return /\bfull[-\s]?stack\b/gi;
      if (kw === 'machine learning') return /\bmachine\s+learning\b/gi;
      if (kw === 'data science') return /\bdata\s+science\b/gi;
      if (kw === 'api') return /\bapis?\b/gi;
      if (kw === 'rest') return /\brest(ful)?\b/gi;
      if (kw === 'java') return /\bjava\b(?!\s*script)/gi; // avoid matching javascript

      // Generic: match exact word or contiguous phrase with flexible whitespace/hyphen
      if (kw.includes(' ')) {
        const phrase = kw.split(' ').map(w => escape(w)).join('\\s+');
        return new RegExp(`\\b${phrase}\\b`, 'gi');
      }
      if (kw.includes('-')) {
        const parts = kw.split('-').map(p => escape(p)).join('[-\\s]?');
        return new RegExp(`\\b${parts}\\b`, 'gi');
      }
      return new RegExp(`\\b${escape(kw)}\\b`, 'gi');
    };

    // Deduplicate by canonical key
    const seen = new Set<string>();
    const patterns: Array<{ key: string; regex: RegExp }> = [];
    for (const kw of allKeywords) {
      if (seen.has(kw)) continue;
      seen.add(kw);
      patterns.push({ key: kw, regex: toRegex(kw) });
    }
    return patterns;
  }

  private getKeywordCounts(text: string): Record<string, number> {
    const patterns = this.buildKeywordPatterns();
    const counts: Record<string, number> = {};
    for (const { key, regex } of patterns) {
      let count = 0;
      const r = new RegExp(regex.source, 'gi');
      const matches = text.match(r);
      if (matches) count = matches.length;
      if (count > 0) counts[key] = count;
    }
    return counts;
  }

  private findKeywordMatches(): string[] {
    // Use frequency-ranked intersection to avoid generic, always-on matches
    if (!this.jobDescription) {
      return this.extractKeywords(this.resumeText).slice(0, 15);
    }

    const resumeCounts = this.getKeywordCounts(this.resumeText);
    const jobCounts = this.getKeywordCounts(this.jobDescription);

    const matches = Object.keys(resumeCounts).filter((k) => jobCounts[k] && jobCounts[k] > 0);
    matches.sort((a, b) => {
      const jb = (jobCounts[b] || 0) - (jobCounts[a] || 0);
      if (jb !== 0) return jb;
      return (resumeCounts[b] || 0) - (resumeCounts[a] || 0);
    });
    return matches.slice(0, 20);
  }

  private findMissingKeywords(): string[] {
    if (!this.jobDescription) {
      return []; // Can't find missing keywords without job description
    }

    const resumeCounts = this.getKeywordCounts(this.resumeText);
    const jobCounts = this.getKeywordCounts(this.jobDescription);

    const missing = Object.keys(jobCounts).filter((k) => !resumeCounts[k]);
    missing.sort((a, b) => (jobCounts[b] || 0) - (jobCounts[a] || 0));
    return missing.slice(0, 10);
  }

  private analyzeStructure(): number {
    let score = 0;

    // Check for common resume sections
    const sections = [
      'experience', 'education', 'skills', 'projects', 'achievements',
      'certifications', 'summary', 'objective'
    ];

    const textLower = this.resumeText.toLowerCase();
    const foundSections = sections.filter(section => 
      textLower.includes(section)
    ).length;

    score += (foundSections / sections.length) * 40;

    // Check for contact information
    const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(this.resumeText);
    const hasPhone = /(\+\d{1,3}[- ]?)?\d{10}/.test(this.resumeText);
    
    if (hasEmail) score += 15;
    if (hasPhone) score += 15;

    // Check for bullet points and structure
    const hasBullets = /[•\-\*]/.test(this.resumeText);
    if (hasBullets) score += 15;

    // Check for dates (employment history)
    const hasDates = /\b(20\d{2}|19\d{2})\b/.test(this.resumeText);
    if (hasDates) score += 15;

    return Math.min(100, score);
  }

  private analyzeContent(): number {
    let score = 0;

    const textLower = this.resumeText.toLowerCase();

    // Check word count (not too short, not too long)
    const wordCount = this.resumeText.split(/\s+/).length;
    if (wordCount >= 200 && wordCount <= 800) {
      score += 25;
    } else if (wordCount >= 100) {
      score += 15;
    }

    // Check for action verbs
    const actionVerbs = [
      'developed', 'implemented', 'designed', 'created', 'managed', 'led',
      'improved', 'optimized', 'achieved', 'collaborated', 'delivered',
      'built', 'established', 'executed', 'maintained', 'analyzed'
    ];

    const foundActionVerbs = actionVerbs.filter(verb => 
      textLower.includes(verb)
    ).length;

    score += Math.min(25, (foundActionVerbs / actionVerbs.length) * 50);

    // Check for quantifiable achievements
    const hasNumbers = /\b\d+[%+]?\b/.test(this.resumeText);
    if (hasNumbers) score += 20;

    // Check for professional language
    const professionalTerms = [
      'professional', 'experience', 'responsible', 'collaborate',
      'contribute', 'achieve', 'deliver', 'support'
    ];

    const foundProfessionalTerms = professionalTerms.filter(term => 
      textLower.includes(term)
    ).length;

    score += Math.min(30, (foundProfessionalTerms / professionalTerms.length) * 30);

    return Math.min(100, score);
  }

  private analyzeFormatting(): number {
    let score = 60; // Base score for basic text

    // Check for consistent formatting indicators
    const hasConsistentSections = /\n\n/.test(this.resumeText);
    if (hasConsistentSections) score += 10;

    // Check for proper capitalization
    const hasProperCapitalization = /[A-Z]/.test(this.resumeText);
    if (hasProperCapitalization) score += 10;

    // Check for organized structure (headers, bullet points)
    const hasOrganization = /[•\-\*].*\n/.test(this.resumeText);
    if (hasOrganization) score += 10;

    // Penalize for obvious formatting issues
    const hasTooManyCapitals = (this.resumeText.match(/[A-Z]/g) || []).length > 
                               this.resumeText.length * 0.15;
    if (hasTooManyCapitals) score -= 15;

    // Check for reasonable line breaks
    const lines = this.resumeText.split('\n');
    const averageLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
    if (averageLineLength > 20 && averageLineLength < 100) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  private generateSuggestions(
    structureScore: number,
    contentScore: number,
    formattingScore: number
  ): string[] {
    const suggestions: string[] = [];

    if (structureScore < 70) {
      suggestions.push(
        "Consider adding clear sections for Experience, Education, and Skills to improve resume structure."
      );
      suggestions.push(
        "Include contact information (email and phone number) for easy communication."
      );
    }

    if (contentScore < 70) {
      suggestions.push(
        "Use more action verbs (developed, implemented, managed) to make your achievements more impactful."
      );
      suggestions.push(
        "Include quantifiable achievements with specific numbers and percentages."
      );
      suggestions.push(
        "Ensure your resume has sufficient content (200-800 words) to adequately showcase your experience."
      );
    }

    if (formattingScore < 70) {
      suggestions.push(
        "Improve formatting consistency with proper bullet points and section headers."
      );
      suggestions.push(
        "Use consistent capitalization and avoid excessive use of capital letters."
      );
    }

    if (this.jobDescription && this.findMissingKeywords().length > 5) {
      suggestions.push(
        "Consider incorporating more relevant keywords from the job description to improve ATS compatibility."
      );
    }

    // General suggestions
    if (suggestions.length === 0) {
      suggestions.push(
        "Your resume looks good! Consider tailoring it further for specific job applications."
      );
      suggestions.push(
        "Regularly update your resume with new achievements and skills."
      );
    }

    return suggestions;
  }
}