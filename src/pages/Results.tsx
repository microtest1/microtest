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
import { useAuth } from '@/contexts/AuthContext';
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
import type { Test, SeverityLevel, RiskLevel, DetectedRegion } from '@/types/database';
import { DetectionOverlay } from '@/components/DetectionOverlay';

interface PDFCustomizationData {
  hospitalName: string;
  location: string;
  reportDate: string;
}

const Results: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [showPDFDialog, setShowPDFDialog] = useState(false);

  const { data: test, isLoading, error } = useQuery({
    queryKey: ['test-result', testId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .maybeSingle();
      if (error) throw error;
      return data as Test | null;
    },
    enabled: !!testId && !authLoading && !!user,
    retry: 2,
    staleTime: 0,
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
    
    // Disclaimer banner (every page)
    const drawDisclaimer = (page: number, totalPages: number) => {
      doc.setPage(page);
      const pageH = doc.internal.pageSize.getHeight();
      doc.setFillColor(255, 243, 205);
      doc.rect(15, pageH - 32, pageWidth - 30, 22, 'F');
      doc.setFontSize(8);
      doc.setTextColor(120, 80, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('SCREENING ONLY — NOT A MEDICAL DIAGNOSIS', 20, pageH - 24);
      doc.setFont('helvetica', 'normal');
      const disclaimer = 'This AI-assisted result must be confirmed by laboratory microscopy and a qualified clinician. Microtest does not prescribe treatment or guarantee accuracy.';
      const lines = doc.splitTextToSize(disclaimer, pageWidth - 45);
      doc.text(lines, 20, pageH - 18);

      doc.setTextColor(150, 150, 150);
      doc.setFontSize(7);
      doc.text(
        `Microtest v1.0  •  Generated ${format(new Date(), 'yyyy-MM-dd HH:mm')}  •  Page ${page} / ${totalPages}`,
        20,
        pageH - 6,
      );
    };

    // Risk / count detail block
    if (test.risk_level || test.parasite_count != null) {
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('CLINICAL SUMMARY', 20, yPos);
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      if (test.risk_level) {
        doc.text(`Risk Classification: ${String(test.risk_level).toUpperCase()}`, 20, yPos);
        yPos += 6;
      }
      if (typeof test.parasite_count === 'number') {
        doc.text(`Parasite Candidates Identified: ${test.parasite_count}`, 20, yPos);
        yPos += 6;
      }
      const regions = Array.isArray(test.detected_regions) ? (test.detected_regions as DetectedRegion[]) : [];
      if (regions.length > 0) {
        doc.text(`Highlighted Regions: ${regions.length}`, 20, yPos);
        yPos += 6;
      }
      yPos += 6;
    }

    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) drawDisclaimer(p, totalPages);

    const fileName = `Microtest-Report-${test.verification_code || test.id.slice(0, 8)}.pdf`;
    doc.save(fileName);
  };

  if (authLoading || isLoading) {
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

  if (!user) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to view this screening result.
              </p>
              <Button onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </CardContent>
          </Card>
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

        {/* Strong disclaimer banner */}
        <div className="p-4 rounded-lg bg-warning/10 border-2 border-warning/30 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-foreground uppercase tracking-wide">
              Screening only — not a medical diagnosis
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This AI-assisted result must be confirmed by laboratory microscopy and a qualified clinician.
              Microtest does not prescribe treatment or guarantee accuracy.
            </p>
          </div>
        </div>

        {/* Sample image with AI detection overlay */}
        {test.sample_image_url && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Microscope className="h-4 w-4 text-primary" />
                AI Detection View
                {Array.isArray(test.detected_regions) && test.detected_regions.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {(test.detected_regions as DetectedRegion[]).length} region(s)
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DetectionOverlay
                imageUrl={test.sample_image_url}
                regions={(test.detected_regions as DetectedRegion[]) || []}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Highlighted boxes indicate areas the AI identified as parasite candidates. Confirm with laboratory microscopy.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Risk Level */}
          {test.risk_level && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    test.risk_level === 'high' ? 'bg-destructive/10' :
                    test.risk_level === 'medium' ? 'bg-warning/10' : 'bg-success/10'
                  }`}>
                    <AlertTriangle className={`h-5 w-5 ${
                      test.risk_level === 'high' ? 'text-destructive' :
                      test.risk_level === 'medium' ? 'text-warning' : 'text-success'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Classification</p>
                    <p className="font-semibold text-foreground capitalize">{test.risk_level} risk</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Parasite Count */}
          {typeof test.parasite_count === 'number' && test.parasite_count > 0 && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Candidates Identified</p>
                    <p className="font-semibold text-foreground">{test.parasite_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}


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
