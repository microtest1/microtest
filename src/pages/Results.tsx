import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PDFCustomizationDialog } from '@/components/PDFCustomizationDialog';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Activity, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Microscope,
  Clock,
  ShieldCheck,
  FileText,
  MapPin,
  RotateCcw
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
          bgColor: 'bg-destructive/5',
          borderColor: 'border-destructive/20',
          textColor: 'text-destructive',
          badgeColor: 'bg-destructive text-destructive-foreground',
          icon: XCircle,
          label: 'Malaria Detected',
          sublabel: 'High Parasite Density',
          description: 'Urgent medical attention recommended. High concentration of malaria parasites detected in blood sample.',
        };
      case 'moderate':
        return {
          bgColor: 'bg-warning/5',
          borderColor: 'border-warning/20',
          textColor: 'text-warning',
          badgeColor: 'bg-warning text-warning-foreground',
          icon: AlertTriangle,
          label: 'Malaria Detected',
          sublabel: 'Moderate Parasite Density',
          description: 'Medical attention recommended. Moderate concentration of malaria parasites detected.',
        };
      case 'mild':
        return {
          bgColor: 'bg-warning/5',
          borderColor: 'border-warning/20',
          textColor: 'text-warning',
          badgeColor: 'bg-warning text-warning-foreground',
          icon: AlertTriangle,
          label: 'Malaria Detected',
          sublabel: 'Low Parasite Density',
          description: 'Treatment recommended. Low concentration of malaria parasites detected.',
        };
      case 'negative':
        return {
          bgColor: 'bg-success/5',
          borderColor: 'border-success/20',
          textColor: 'text-success',
          badgeColor: 'bg-success text-success-foreground',
          icon: CheckCircle2,
          label: 'Not Detected',
          sublabel: 'No Parasites Found',
          description: 'No malaria parasites detected in this blood sample. If symptoms persist, consider retesting.',
        };
      default:
        return {
          bgColor: 'bg-muted',
          borderColor: 'border-border',
          textColor: 'text-muted-foreground',
          badgeColor: 'bg-muted text-muted-foreground',
          icon: Clock,
          label: 'Processing',
          sublabel: 'Analysis in Progress',
          description: 'Your sample is being analyzed. Results will be available shortly.',
        };
    }
  };

  const generatePDF = (customization: PDFCustomizationData) => {
    if (!test) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const severityConfig = getSeverityConfig(test.severity);
    
    // Header
    doc.setFillColor(14, 116, 144); // Primary color
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    
    if (customization.hospitalName) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(customization.hospitalName, 20, 18);
      
      if (customization.location) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(customization.location, 20, 26);
      }
      
      doc.setFontSize(9);
      doc.text('Powered by Microtest', 20, 36);
    } else {
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Microtest', 20, 22);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Malaria Screening Report', 20, 32);
    }
    
    if (test.verification_code) {
      doc.setFontSize(8);
      doc.text(`Verification: ${test.verification_code}`, pageWidth - 60, 22);
    }
    
    // Report Info
    doc.setTextColor(50, 50, 50);
    let yPos = 60;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Test Date: ${format(new Date(test.created_at), 'MMMM d, yyyy • h:mm a')}`, 20, yPos);
    yPos += 15;
    
    // Result Box
    const resultColor = test.severity === 'negative' ? [34, 139, 34] : [220, 53, 69];
    doc.setFillColor(resultColor[0], resultColor[1], resultColor[2]);
    doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(severityConfig.label.toUpperCase(), 25, yPos + 15);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(severityConfig.sublabel, 25, yPos + 25);
    
    if (test.confidence_score) {
      doc.text(`Confidence: ${test.confidence_score}%`, pageWidth - 60, yPos + 15);
    }
    
    yPos += 50;
    
    // Details Section
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('ANALYSIS DETAILS', 20, yPos);
    yPos += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    if (test.parasite_species) {
      doc.text(`Parasite Species: ${test.parasite_species}`, 20, yPos);
      yPos += 7;
    }
    
    if (test.parasite_density) {
      doc.text(`Parasite Density: ${test.parasite_density}`, 20, yPos);
      yPos += 7;
    }
    
    if (test.image_quality) {
      doc.text(`Image Quality: ${test.image_quality}`, 20, yPos);
      yPos += 7;
    }
    
    yPos += 10;
    
    // AI Findings
    if (test.ai_findings) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('AI ANALYSIS', 20, yPos);
      yPos += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const findingsLines = doc.splitTextToSize(test.ai_findings, pageWidth - 40);
      doc.text(findingsLines, 20, yPos);
      yPos += findingsLines.length * 5 + 10;
    }
    
    // Recommendations
    if (test.who_recommendations) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('CLINICAL GUIDANCE', 20, yPos);
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
    doc.text('IMPORTANT DISCLAIMER', 20, yPos + 8);
    doc.setFont('helvetica', 'normal');
    const disclaimer = 'This is an AI-assisted screening result and does not constitute a medical diagnosis. Laboratory confirmation is recommended. Please consult a qualified healthcare provider.';
    const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 45);
    doc.text(disclaimerLines, 20, yPos + 14);
    
    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(`Generated by Microtest • ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 20, 285);
    
    const fileName = `Microtest-Report-${test.verification_code || test.id.slice(0, 8)}.pdf`;
    doc.save(fileName);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !test) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Result Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The screening result could not be found.
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
  const isPositive = test.severity && test.severity !== 'negative';

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/history')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold font-display text-foreground">Screening Results</h1>
              <p className="text-sm text-muted-foreground">
                {format(new Date(test.created_at), 'MMMM d, yyyy • h:mm a')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowPDFDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <PDFCustomizationDialog
          open={showPDFDialog}
          onOpenChange={setShowPDFDialog}
          onConfirm={generatePDF}
        />

        {/* Main Result Card */}
        <Card className={`${severityConfig.bgColor} ${severityConfig.borderColor} border-2 overflow-hidden`}>
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className={`w-16 h-16 rounded-2xl ${isPositive ? 'bg-destructive/10' : 'bg-success/10'} flex items-center justify-center flex-shrink-0`}>
                <SeverityIcon className={`h-8 w-8 ${severityConfig.textColor}`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className={`text-2xl font-bold ${severityConfig.textColor}`}>
                    {severityConfig.label}
                  </h2>
                  <Badge className={severityConfig.badgeColor}>
                    {severityConfig.sublabel}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground mb-4">
                  {severityConfig.description}
                </p>
                
                {test.confidence_score && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <span className="text-lg font-bold text-foreground">{test.confidence_score}%</span>
                    </div>
                    <div className="flex-1 max-w-xs h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isPositive ? 'bg-destructive' : 'bg-success'}`}
                        style={{ width: `${test.confidence_score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer Banner */}
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">AI-Assisted Screening Result</p>
            <p className="text-sm text-muted-foreground">
              This is a preliminary screening. Laboratory confirmation is recommended for all positive results.
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Verification */}
          {test.verification_code && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Verification Code</p>
                    <p className="font-mono font-bold text-foreground">{test.verification_code}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Parasite Info */}
          {test.parasite_species && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Microscope className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Parasite Species</p>
                    <p className="font-semibold text-foreground">{test.parasite_species}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Density */}
          {test.parasite_density && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Parasite Density</p>
                    <p className="font-semibold text-foreground capitalize">{test.parasite_density}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Image Quality */}
          {test.image_quality && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Image Quality</p>
                    <p className="font-semibold text-foreground capitalize">{test.image_quality}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* AI Analysis */}
        {test.ai_findings && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Microscope className="h-4 w-4 text-primary" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{test.ai_findings}</p>
            </CardContent>
          </Card>
        )}

        {/* Clinical Guidance */}
        {test.who_recommendations && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-secondary" />
                Clinical Guidance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{test.who_recommendations}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate('/scanner')}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            New Screening
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => window.open('https://www.google.com/maps/search/clinic+near+me', '_blank')}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Find Nearby Clinic
          </Button>
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={() => setShowPDFDialog(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Save Result
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Results;
