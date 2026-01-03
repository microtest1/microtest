import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ComparisonView } from '@/components/ComparisonView';
import { PDFCustomizationDialog } from '@/components/PDFCustomizationDialog';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Activity, 
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Microscope,
  FileText,
  Clock,
  Stethoscope,
  Pill,
  Baby,
  BadgeCheck,
  Database,
  Droplets,
  Layers
} from 'lucide-react';
import type { Test, SeverityLevel } from '@/types/database';

interface PDFCustomizationData {
  hospitalName: string;
  location: string;
  reportDate: string;
}

const Results: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [showPDFDialog, setShowPDFDialog] = useState(false);

  const { data: test, isLoading, error } = useQuery({
    queryKey: ['test-result', testId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .maybeSingle();
      if (error) throw error;
      return data as Test | null;
    },
    enabled: !!testId,
  });

  const getSeverityConfig = (severity: SeverityLevel | null) => {
    switch (severity) {
      case 'severe':
        return {
          color: 'bg-destructive',
          textColor: 'text-destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/30',
          icon: XCircle,
          label: 'Severe',
          percentage: 100,
        };
      case 'moderate':
        return {
          color: 'bg-warning',
          textColor: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/30',
          icon: AlertTriangle,
          label: 'Moderate',
          percentage: 66,
        };
      case 'mild':
        return {
          color: 'bg-accent',
          textColor: 'text-accent',
          bgColor: 'bg-accent/10',
          borderColor: 'border-accent/30',
          icon: Activity,
          label: 'Mild',
          percentage: 33,
        };
      case 'negative':
        return {
          color: 'bg-success',
          textColor: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/30',
          icon: CheckCircle2,
          label: 'Negative',
          percentage: 0,
        };
      default:
        return {
          color: 'bg-muted',
          textColor: 'text-muted-foreground',
          bgColor: 'bg-muted/10',
          borderColor: 'border-muted/30',
          icon: Clock,
          label: 'Pending',
          percentage: 0,
        };
    }
  };

  const generatePDF = (customization: PDFCustomizationData) => {
    if (!test) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header with optional hospital branding
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, customization.hospitalName ? 50 : 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    
    if (customization.hospitalName) {
      // Hospital/Partner branded header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(customization.hospitalName, 20, 18);
      
      if (customization.location) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(customization.location, 20, 26);
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Powered by MicroTest AI', 20, customization.location ? 35 : 28);
      
      // Report date on the right
      doc.setFontSize(9);
      const formattedDate = format(new Date(customization.reportDate), 'MMMM d, yyyy');
      doc.text(`Report Date: ${formattedDate}`, pageWidth - 70, 18);
    } else {
      // Default MicroTest header
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('MicroTest', 20, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('AI-Powered Diagnostic Report', 20, 33);
    }
    
    // Verification Badge
    if (test.verification_code) {
      doc.setFontSize(8);
      const verificationY = customization.hospitalName ? 45 : 25;
      doc.text(`Verification: ${test.verification_code}`, pageWidth - 60, verificationY);
    }
    
    // Report Info
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    let yPos = customization.hospitalName ? 65 : 55;
    
    doc.setFont('helvetica', 'bold');
    doc.text('DIAGNOSTIC REPORT', 20, yPos);
    yPos += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Test Type: ${test.test_type.charAt(0).toUpperCase() + test.test_type.slice(1)} Test`, 20, yPos);
    yPos += 7;
    doc.text(`Test Date: ${format(new Date(test.created_at), 'MMMM d, yyyy • h:mm a')}`, 20, yPos);
    yPos += 7;
    doc.text(`Status: ${test.status}`, 20, yPos);
    yPos += 15;
    
    // Results Section
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos - 5, pageWidth - 30, 35, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('RESULT SUMMARY', 20, yPos + 5);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    yPos += 12;
    
    const severityConfig = getSeverityConfig(test.severity);
    doc.text(`Severity Level: ${severityConfig.label}`, 20, yPos + 5);
    
    if (test.confidence_score) {
      doc.text(`Confidence Score: ${test.confidence_score}%`, 20, yPos + 12);
    }
    
    if (test.test_type === 'pregnancy' && test.pregnancy_weeks) {
      doc.text(`Estimated Duration: ${test.pregnancy_weeks} weeks`, 20, yPos + 19);
    }
    
    yPos += 40;
    
    // AI Findings
    if (test.ai_findings) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('AI ANALYSIS FINDINGS', 20, yPos);
      yPos += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const findingsLines = doc.splitTextToSize(test.ai_findings, pageWidth - 40);
      doc.text(findingsLines, 20, yPos);
      yPos += findingsLines.length * 5 + 10;
    }
    
    // WHO Recommendations
    if (test.who_recommendations) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('WHO RECOMMENDATIONS', 20, yPos);
      yPos += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const recLines = doc.splitTextToSize(test.who_recommendations, pageWidth - 40);
      doc.text(recLines, 20, yPos);
      yPos += recLines.length * 5 + 15;
    }
    
    // Disclaimer
    doc.setFillColor(255, 243, 205);
    doc.rect(15, yPos, pageWidth - 30, 25, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(120, 80, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('MEDICAL DISCLAIMER', 20, yPos + 8);
    doc.setFont('helvetica', 'normal');
    const disclaimer = 'This AI-generated report is intended for screening purposes only and does not replace professional medical diagnosis. Please consult a qualified healthcare provider for proper diagnosis and treatment.';
    const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 45);
    doc.text(disclaimerLines, 20, yPos + 14);
    
    // Footer with hospital info if provided
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    const footerText = customization.hospitalName 
      ? `${customization.hospitalName} • Powered by MicroTest AI • ${format(new Date(), 'yyyy-MM-dd HH:mm')}`
      : `Generated by MicroTest AI • ${format(new Date(), 'yyyy-MM-dd HH:mm')}`;
    doc.text(footerText, 20, 285);
    
    const fileName = customization.hospitalName
      ? `${customization.hospitalName.replace(/[^a-zA-Z0-9]/g, '-')}-Report-${test.verification_code || test.id.slice(0, 8)}.pdf`
      : `MicroTest-Report-${test.verification_code || test.id.slice(0, 8)}.pdf`;
    
    doc.save(fileName);
  };

  const handleDownloadClick = () => {
    setShowPDFDialog(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !test) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Result Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The test result you're looking for could not be found.
              </p>
              <Button onClick={() => navigate('/history')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to History
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const severityConfig = getSeverityConfig(test.severity);
  const SeverityIcon = severityConfig.icon;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/history')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Test Results</h1>
              <p className="text-muted-foreground">
                {format(new Date(test.created_at), 'MMMM d, yyyy • h:mm a')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button size="sm" onClick={handleDownloadClick}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* PDF Customization Dialog */}
        <PDFCustomizationDialog
          open={showPDFDialog}
          onOpenChange={setShowPDFDialog}
          onConfirm={generatePDF}
        />

        {/* Verification & Certification Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {test.verification_code && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Verification Code</p>
                <p className="text-lg font-mono font-bold text-primary">{test.verification_code}</p>
              </div>
            </div>
          )}
          
          {/* Certification Status */}
          {(() => {
            const resultData = test.result_data as Record<string, unknown> | null;
            const certificationStatus = resultData?.certification_status as string;
            const matchedDataset = resultData?.matched_dataset as { name: string; classification: string; description: string } | null;
            const certifiedBy = resultData?.certified_by as string | null;
            
            if (certificationStatus === 'certified' && matchedDataset) {
              return (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/30">
                  <BadgeCheck className="h-6 w-6 text-success" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">Certified Result</p>
                      <Badge variant="outline" className="bg-success/20 text-success border-success/30 text-xs">
                        Verified
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Matched: {matchedDataset.name}
                    </p>
                    {certifiedBy && (
                      <p className="text-xs text-success font-medium mt-0.5">
                        {certifiedBy}
                      </p>
                    )}
                  </div>
                </div>
              );
            } else if (certificationStatus === 'provisional' && matchedDataset) {
              return (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30">
                  <Database className="h-5 w-5 text-warning" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">Provisional Match</p>
                      <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30 text-xs">
                        Low Confidence
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Reference: {matchedDataset.name}
                    </p>
                    <p className="text-xs text-warning font-medium mt-0.5">
                      Recommend professional verification
                    </p>
                  </div>
                </div>
              );
            } else {
              return (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Reference Pending</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No matching dataset found
                    </p>
                  </div>
                </div>
              );
            }
          })()}
        </div>

        {/* Sample Detection Info */}
        {(() => {
          const resultData = test.result_data as Record<string, unknown> | null;
          const liquidDetected = resultData?.liquid_detected as boolean | undefined;
          const surfaceType = resultData?.surface_type as string | undefined;
          
          if (liquidDetected !== undefined || surfaceType) {
            return (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <Droplets className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">Sample Detection</p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${liquidDetected ? 'bg-success/20 text-success border-success/30' : 'bg-destructive/20 text-destructive border-destructive/30'}`}
                    >
                      {liquidDetected ? 'Liquid Detected' : 'Not Detected'}
                    </Badge>
                  </div>
                  {surfaceType && surfaceType !== 'unknown' && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        Surface: <span className="font-medium capitalize">{surfaceType}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Main Result Card */}
        <Card className={`relative overflow-hidden ${severityConfig.bgColor} ${severityConfig.borderColor} border-2`}>
          <div className={`absolute top-0 left-0 w-full h-1.5 ${severityConfig.color}`} />
          
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              {/* Test Type Icon */}
              <div className={`w-20 h-20 rounded-2xl ${severityConfig.bgColor} flex items-center justify-center shrink-0`}>
                {test.test_type === 'malaria' ? (
                  <Microscope className={`h-10 w-10 ${severityConfig.textColor}`} />
                ) : (
                  <Baby className={`h-10 w-10 ${severityConfig.textColor}`} />
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold capitalize">
                      {test.test_type} Test
                    </h2>
                    <Badge 
                      className={`${severityConfig.color} text-white px-3 py-1 text-sm font-medium`}
                    >
                      {severityConfig.label}
                    </Badge>
                  </div>
                  
                  {test.test_type === 'pregnancy' && test.pregnancy_weeks && (
                    <p className="text-lg text-foreground">
                      Estimated Duration: <span className="font-bold">{test.pregnancy_weeks} weeks</span>
                    </p>
                  )}
                </div>

                {/* Severity Visualization */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Severity Level</span>
                    <div className="flex items-center gap-2">
                      <SeverityIcon className={`h-4 w-4 ${severityConfig.textColor}`} />
                      <span className={`font-medium ${severityConfig.textColor}`}>
                        {severityConfig.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`absolute inset-y-0 left-0 ${severityConfig.color} transition-all duration-1000 ease-out rounded-full`}
                      style={{ width: `${Math.max(5, severityConfig.percentage)}%` }}
                    />
                    {/* Severity markers */}
                    <div className="absolute inset-0 flex justify-between px-0.5">
                      <div className="w-0.5 h-full bg-background/50" style={{ marginLeft: '0%' }} />
                      <div className="w-0.5 h-full bg-background/50" style={{ marginLeft: '33%' }} />
                      <div className="w-0.5 h-full bg-background/50" style={{ marginLeft: '66%' }} />
                      <div className="w-0.5 h-full bg-background/50" style={{ marginLeft: '100%' }} />
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Negative</span>
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                  </div>
                </div>

                {/* Confidence Score */}
                {test.confidence_score && (
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-full border-4 border-primary flex items-center justify-center bg-primary/10">
                        <span className="text-sm font-bold text-primary">
                          {Math.round(test.confidence_score)}%
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">AI Confidence</p>
                        <p className="text-xs text-muted-foreground">Analysis accuracy</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Findings */}
        <Card className="glass-card overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span>AI Analysis Findings</span>
                <p className="text-sm font-normal text-muted-foreground">
                  Detailed observations from AI examination
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {test.ai_findings ? (
              <div className="prose prose-sm max-w-none text-foreground">
                <p className="whitespace-pre-wrap leading-relaxed">{test.ai_findings}</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No findings available
              </p>
            )}
          </CardContent>
        </Card>

        {/* WHO Recommendations */}
        <Card className="glass-card overflow-hidden border-success/30">
          <CardHeader className="border-b border-border/50 bg-success/5">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-success" />
              </div>
              <div>
                <span>WHO Treatment Recommendations</span>
                <p className="text-sm font-normal text-muted-foreground">
                  Guidelines based on World Health Organization protocols
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {test.who_recommendations ? (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none text-foreground">
                  <p className="whitespace-pre-wrap leading-relaxed">{test.who_recommendations}</p>
                </div>
                
                <div className="flex items-start gap-3 p-4 rounded-lg bg-success/5 border border-success/20">
                  <Pill className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Always consult a qualified healthcare professional before starting any treatment. 
                    These recommendations are based on WHO guidelines and should be adapted to local 
                    protocols and individual patient needs.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No recommendations available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Comparison View */}
        <ComparisonView
          testId={test.id}
          testType={test.test_type}
          testImageUrl={test.sample_image_url}
          testSeverity={test.severity}
          testFindings={test.ai_findings}
        />

        {/* Medical Disclaimer */}
        <div className="flex items-start gap-4 p-5 rounded-xl bg-warning/10 border border-warning/30">
          <AlertTriangle className="h-6 w-6 text-warning shrink-0" />
          <div>
            <h4 className="font-semibold text-foreground mb-1">Medical Disclaimer</h4>
            <p className="text-sm text-muted-foreground">
              This AI-generated report is intended for screening purposes only and does not replace 
              professional medical diagnosis. The results should be interpreted by a qualified healthcare 
              provider. Please seek immediate medical attention if you experience severe symptoms.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            className="flex-1 h-12"
            onClick={() => navigate('/scanner')}
          >
            <Microscope className="h-5 w-5 mr-2" />
            New Test
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 h-12"
            onClick={() => navigate('/history')}
          >
            <Activity className="h-5 w-5 mr-2" />
            View History
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Results;
