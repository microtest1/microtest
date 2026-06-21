import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PDFCustomizationDialog } from '@/components/PDFCustomizationDialog';
import { useAuth } from '@/contexts/AuthContext';
import { getScreeningResult } from '@/lib/screeningResult';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  Download,
  Activity,
  CheckCircle2,
  XCircle,
  Microscope,
  ShieldCheck,
  FileText,
  RotateCcw,
  Gauge,
  AlertCircle,
  ScanLine,
} from 'lucide-react';
import type { Test, DetectedRegion, ImageQuality } from '@/types/database';
import { DetectionOverlay } from '@/components/DetectionOverlay';

interface PDFCustomizationData {
  hospitalName: string;
  location: string;
  reportDate: string;
}

const SYSTEM_VERSION = 'Microtest v1.2';

// ---------- Derivations ----------

type DetectionStatus = 'none' | 'suspected' | 'detected';

const QUALITY_SCORE: Record<ImageQuality, number> = {
  excellent: 95,
  good: 80,
  fair: 60,
  poor: 30,
};

function getQualityScore(q: Test['image_quality']): number {
  if (!q) return 65;
  return QUALITY_SCORE[q] ?? 65;
}

function getDetectionStatus(test: Test): DetectionStatus {
  const sev = test.severity;
  const conf = test.confidence_score ?? 0;
  if (sev === 'negative') return 'none';
  if (sev === 'mild' || sev === 'moderate' || sev === 'severe') {
    return conf >= 70 ? 'detected' : 'suspected';
  }
  return 'none';
}

function detectionMeta(status: DetectionStatus) {
  switch (status) {
    case 'detected':
      return {
        label: 'Parasite Detected',
        tone: 'destructive' as const,
        icon: XCircle,
        accent: 'text-destructive',
        bar: 'bg-destructive',
        bg: 'bg-destructive/5 border-destructive/20',
      };
    case 'suspected':
      return {
        label: 'Parasite Suspected',
        tone: 'warning' as const,
        icon: AlertCircle,
        accent: 'text-warning',
        bar: 'bg-warning',
        bg: 'bg-warning/5 border-warning/20',
      };
    default:
      return {
        label: 'No Parasite Detected',
        tone: 'success' as const,
        icon: CheckCircle2,
        accent: 'text-success',
        bar: 'bg-success',
        bg: 'bg-success/5 border-success/20',
      };
  }
}

function densityLabel(d: Test['parasite_density']): string | null {
  if (!d) return null;
  if (d === 'low') return 'Low';
  if (d === 'medium') return 'Moderate';
  if (d === 'high') return 'High';
  if (d === 'critical') return 'High';
  return null;
}

function riskLabel(r: Test['risk_level']): string | null {
  if (!r) return null;
  return r === 'low' ? 'Low Risk' : r === 'medium' ? 'Moderate Risk' : 'High Risk';
}

function buildImageAssessment(test: Test, qualityCompromised: boolean): string {
  if (qualityCompromised) {
    return 'Image quality below recommended threshold for optimal screening accuracy. Please resubmit a clearer microscopy capture for a reliable assessment.';
  }
  const status = getDetectionStatus(test);
  const qual = test.image_quality ?? 'acceptable';
  if (status === 'detected') {
    return `Image characteristics indicate parasitic structures consistent with malaria. Sample quality assessed as ${qual}.`;
  }
  if (status === 'suspected') {
    return `Image characteristics indicate potential parasitic structures requiring further evaluation. Sample quality assessed as ${qual}.`;
  }
  return `Submitted sample analyzed with ${qual} quality. No parasitic structures identified across the screening layers.`;
}

function buildNarrative(test: Test, qualityCompromised: boolean): string {
  if (qualityCompromised) {
    return 'Image processed through the Microtest screening engine. Quality validation flagged the sample as below recommended thresholds; numerical scoring suppressed to preserve diagnostic integrity.';
  }
  if (test.ai_findings && test.ai_findings.length > 20) return test.ai_findings;
  return 'Image processed successfully using the Microtest screening engine. Microscopic structures were analyzed across multiple detection layers. Confidence reflects feature density and sample clarity.';
}

// ---------- Visual primitives ----------

const ScoreBar: React.FC<{ value: number; tone?: string }> = ({ value, tone = 'bg-primary' }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
    <div
      className={`h-full rounded-full transition-all ${tone}`}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const ConfidenceGauge: React.FC<{ value: number; tone: string }> = ({ value, tone }) => {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className="relative">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-5xl font-bold tabular-nums tracking-tight text-foreground">
          {Math.round(v)}
        </span>
        <span className="text-xl font-medium text-muted-foreground">%</span>
      </div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${v}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>Low</span>
        <span>Confident</span>
      </div>
    </div>
  );
};

const StatRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-border/50 py-2 last:border-0">
    <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
    <span className="font-mono text-sm font-medium text-foreground">{value}</span>
  </div>
);

// ---------- Page ----------

const Results: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [showPDFDialog, setShowPDFDialog] = useState(false);

  const { data: test, isLoading, error } = useQuery({
    queryKey: ['test-result', testId, user?.id],
    queryFn: async () => {
      if (!testId) throw new Error('Missing screening result id');
      return getScreeningResult(testId);
    },
    enabled: !!testId && !authLoading && !!user,
    retry: 2,
    staleTime: 0,
  });

  const derived = useMemo(() => {
    if (!test) return null;
    const qualityScore = getQualityScore(test.image_quality);
    const qualityCompromised =
      test.image_quality === 'poor' && (test.confidence_score ?? 0) < 40;
    const detection = getDetectionStatus(test);
    const meta = detectionMeta(detection);
    const confidence = qualityCompromised ? null : test.confidence_score ?? 0;
    const density = qualityCompromised ? null : densityLabel(test.parasite_density);
    const risk = qualityCompromised ? null : riskLabel(test.risk_level);
    return {
      qualityScore,
      qualityCompromised,
      detection,
      meta,
      confidence,
      density,
      risk,
      assessment: buildImageAssessment(test, qualityCompromised),
      narrative: buildNarrative(test, qualityCompromised),
    };
  }, [test]);

  // ---------- PDF ----------

  const generatePDF = async (customization: PDFCustomizationData) => {
    if (!test || !derived) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 40;

    // ----- Color palette (clinical teal) -----
    const ink = [22, 32, 46] as const;
    const muted = [110, 122, 138] as const;
    const line = [225, 230, 236] as const;
    const teal = [14, 116, 144] as const;
    const tone =
      derived.detection === 'detected'
        ? ([200, 38, 50] as const)
        : derived.detection === 'suspected'
          ? ([196, 130, 14] as const)
          : ([22, 138, 90] as const);

    const setFill = (c: readonly [number, number, number]) => doc.setFillColor(c[0], c[1], c[2]);
    const setStroke = (c: readonly [number, number, number]) => doc.setDrawColor(c[0], c[1], c[2]);
    const setText = (c: readonly [number, number, number]) => doc.setTextColor(c[0], c[1], c[2]);

    // ----- Header band -----
    setFill(teal);
    doc.rect(0, 0, W, 70, 'F');

    setText([255, 255, 255]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(customization.hospitalName || 'Microtest', M, 32);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(
      customization.location || 'AI-Assisted Malaria Screening Report',
      M,
      46,
    );
    doc.setFontSize(8);
    doc.text('Laboratory Information System • Powered by Microtest', M, 58);

    // Report meta (top-right)
    const reportId = (test.id || '').slice(0, 8).toUpperCase();
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`REPORT ${reportId}`, W - M, 30, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(format(new Date(test.created_at), "yyyy-MM-dd • HH:mm 'UTC'"), W - M, 44, {
      align: 'right',
    });
    if (test.verification_code) {
      doc.text(`Verify: ${test.verification_code}`, W - M, 56, { align: 'right' });
    }

    // ----- Patient / Sample identifiers row -----
    let y = 96;
    setText(muted);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT ID', M, y);
    doc.text('SAMPLE ID', M + 170, y);
    doc.text('IMAGE QUALITY', M + 340, y);

    setText(ink);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text((test.user_id || '').slice(0, 8).toUpperCase(), M, y + 14);
    doc.text(reportId, M + 170, y + 14);
    doc.text(
      `${derived.qualityScore}/100 • ${(test.image_quality ?? 'n/a').toUpperCase()}`,
      M + 340,
      y + 14,
    );

    // divider
    y += 28;
    setStroke(line);
    doc.setLineWidth(0.5);
    doc.line(M, y, W - M, y);

    // ----- Headline result card -----
    y += 18;
    setStroke(line);
    doc.setLineWidth(0.8);
    doc.roundedRect(M, y, W - M * 2, 110, 8, 8, 'S');

    // tone accent
    setFill(tone);
    doc.roundedRect(M, y, 6, 110, 3, 3, 'F');

    setText(muted);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('DETECTION STATUS', M + 20, y + 22);

    setText(ink);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(derived.meta.label, M + 20, y + 48);

    setText(muted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const summaryLines = doc.splitTextToSize(derived.assessment, W - M * 2 - 200);
    doc.text(summaryLines, M + 20, y + 66);

    // Confidence dial (right)
    const dialX = W - M - 90;
    setText(muted);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('CONFIDENCE', dialX, y + 22);

    setText(tone);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(
      derived.confidence != null ? `${Math.round(derived.confidence)}%` : '—',
      dialX,
      y + 56,
    );

    // mini bar
    setFill([240, 243, 247]);
    doc.roundedRect(dialX, y + 70, 90, 6, 3, 3, 'F');
    if (derived.confidence != null) {
      setFill(tone);
      doc.roundedRect(dialX, y + 70, (90 * derived.confidence) / 100, 6, 3, 3, 'F');
    }

    y += 132;

    // ----- Metric grid (3 columns) -----
    const colW = (W - M * 2 - 24) / 3;
    const metrics: Array<{ label: string; value: string }> = [
      {
        label: 'Sample Quality',
        value:
          derived.qualityScore >= 90
            ? 'Excellent'
            : derived.qualityScore >= 75
              ? 'Good'
              : derived.qualityScore >= 50
                ? 'Acceptable'
                : 'Poor',
      },
      { label: 'Parasite Density', value: derived.density ?? '—' },
      { label: 'Risk Classification', value: derived.risk ?? '—' },
    ];
    metrics.forEach((m, i) => {
      const x = M + i * (colW + 12);
      setStroke(line);
      doc.roundedRect(x, y, colW, 64, 6, 6, 'S');
      setText(muted);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(m.label.toUpperCase(), x + 14, y + 20);
      setText(ink);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text(m.value, x + 14, y + 44);
    });
    y += 84;

    // ----- Analysis Summary -----
    setText(ink);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('ANALYSIS SUMMARY', M, y);
    y += 6;
    setStroke(line);
    doc.line(M, y, W - M, y);
    y += 14;
    setText([60, 70, 82]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const narrLines = doc.splitTextToSize(derived.narrative, W - M * 2);
    doc.text(narrLines, M, y);
    y += narrLines.length * 12 + 12;

    // ----- Technical Metadata -----
    setText(ink);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TECHNICAL METADATA', M, y);
    y += 6;
    setStroke(line);
    doc.line(M, y, W - M, y);
    y += 14;

    const meta: Array<[string, string]> = [
      ['System Version', SYSTEM_VERSION],
      [
        'Detected Regions',
        Array.isArray(test.detected_regions) ? String(test.detected_regions.length) : '0',
      ],
      [
        'Parasite Candidates',
        typeof test.parasite_count === 'number' ? String(test.parasite_count) : '0',
      ],
      ['Report Generated', format(new Date(), "yyyy-MM-dd HH:mm 'UTC'")],
      ['Verification Code', test.verification_code || '—'],
    ];
    setText([60, 70, 82]);
    doc.setFontSize(9);
    meta.forEach(([k, v], i) => {
      const x = i % 2 === 0 ? M : M + (W - M * 2) / 2;
      const ly = y + Math.floor(i / 2) * 16;
      doc.setFont('helvetica', 'normal');
      setText(muted);
      doc.text(k, x, ly);
      doc.setFont('helvetica', 'bold');
      setText(ink);
      doc.text(v, x + 110, ly);
    });
    y += Math.ceil(meta.length / 2) * 16 + 18;

    // ----- QR + Signature row -----
    try {
      const qrPayload = JSON.stringify({
        id: reportId,
        v: test.verification_code,
        ts: test.created_at,
      });
      const qrUrl = await QRCode.toDataURL(qrPayload, {
        margin: 1,
        width: 240,
        color: { dark: '#16202E', light: '#FFFFFF' },
      });
      doc.addImage(qrUrl, 'PNG', M, y, 80, 80);
    } catch {
      /* QR optional */
    }

    setText(muted);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('SCAN TO VERIFY', M, y + 92);

    // Signature box
    const sigX = M + 110;
    setStroke(line);
    doc.roundedRect(sigX, y, W - M - sigX, 80, 6, 6, 'S');
    setText(muted);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('REVIEWING CLINICIAN', sigX + 14, y + 18);
    setStroke([180, 188, 200]);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(sigX + 14, y + 50, W - M - 14, y + 50);
    doc.setLineDashPattern([], 0);
    doc.setFont('helvetica', 'normal');
    doc.text('Signature & Date', sigX + 14, y + 64);

    // ----- Footer -----
    setStroke(line);
    doc.line(M, H - 50, W - M, H - 50);
    setText(muted);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'AI-assisted screening result. Intended to support — not replace — clinical evaluation and laboratory confirmation.',
      M,
      H - 34,
    );
    doc.text(`${SYSTEM_VERSION}  •  Report ${reportId}`, M, H - 22);
    doc.text(`Page 1 / 1`, W - M, H - 22, { align: 'right' });

    doc.save(`Microtest-Report-${test.verification_code || reportId}.pdf`);
  };

  // ---------- Render ----------

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-6">
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
              <Button onClick={() => navigate('/auth')}>Sign In</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !test || !derived) {
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

  const { meta, qualityScore, qualityCompromised, confidence, density, risk } = derived;
  const DetectionIcon = meta.icon;
  const reportId = test.id.slice(0, 8).toUpperCase();
  const qualityLabel =
    qualityScore >= 90
      ? 'Excellent'
      : qualityScore >= 75
        ? 'Good'
        : qualityScore >= 50
          ? 'Acceptable'
          : 'Poor';
  const qualityTone =
    qualityScore >= 75 ? 'bg-success' : qualityScore >= 50 ? 'bg-warning' : 'bg-destructive';

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Top bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/history')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <FileText className="h-3 w-3" />
                <span>Screening Report · {reportId}</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Analysis Completed
              </h1>
              <p className="text-sm text-muted-foreground">
                {format(new Date(test.created_at), 'EEEE, MMMM d, yyyy • h:mm a')}
              </p>
            </div>
          </div>
          <Button onClick={() => setShowPDFDialog(true)} className="gap-2">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>

        <PDFCustomizationDialog
          open={showPDFDialog}
          onOpenChange={setShowPDFDialog}
          onConfirm={generatePDF}
        />

        {/* Quality compromised banner */}
        {qualityCompromised && (
          <Card className="border-warning/40 bg-warning/5">
            <CardContent className="flex items-start gap-3 p-5">
              <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Image quality below recommended threshold for optimal screening accuracy
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Density, risk and confidence scoring have been suppressed to preserve diagnostic
                  integrity. Please resubmit a clearer microscopy capture.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/scanner')}>
                Resubmit
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Headline detection card */}
        <Card className={`border-2 ${meta.bg} overflow-hidden`}>
          <CardContent className="grid gap-8 p-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <ScanLine className="h-3 w-3" />
                Detection Status
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-background/70 flex items-center justify-center border border-border/50">
                  <DetectionIcon className={`h-7 w-7 ${meta.accent}`} />
                </div>
                <div>
                  <h2 className="font-display text-3xl font-bold text-foreground leading-tight">
                    {meta.label}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {density && <Badge variant="secondary">Density · {density}</Badge>}
                    {risk && <Badge variant="secondary">{risk}</Badge>}
                  </div>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground max-w-prose">
                {derived.assessment}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/60 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <Gauge className="h-3 w-3" />
                Confidence Score
              </div>
              <div className="mt-3">
                {confidence != null ? (
                  <ConfidenceGauge value={confidence} tone={meta.bar} />
                ) : (
                  <div className="py-6 text-sm text-muted-foreground">
                    Suppressed — quality validation failed
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric strip */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Sample Quality
                </p>
                <Badge variant="outline" className="font-mono">
                  {qualityScore}/100
                </Badge>
              </div>
              <p className="mt-2 font-display text-2xl font-bold text-foreground">{qualityLabel}</p>
              <div className="mt-3">
                <ScoreBar value={qualityScore} tone={qualityTone} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Parasite Density Estimate
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-foreground">
                {density ?? '—'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {typeof test.parasite_count === 'number'
                  ? `${test.parasite_count} candidate region(s) identified`
                  : 'No measurable candidates'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Risk Classification
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-foreground">{risk ?? '—'}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Derived from detection profile and density
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detection view */}
        {test.sample_image_url && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Microscope className="h-4 w-4 text-primary" />
                Detection View
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
            </CardContent>
          </Card>
        )}

        {/* Two-column analysis */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" />
                AI Analysis Narrative
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{derived.narrative}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                Technical Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                <StatRow label="Report ID" value={reportId} />
                <StatRow
                  label="Verification"
                  value={test.verification_code || '—'}
                />
                <StatRow label="System" value={SYSTEM_VERSION} />
                <StatRow
                  label="Generated"
                  value={format(new Date(test.created_at), 'yyyy-MM-dd HH:mm')}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer disclaimer (single, calm line) */}
        <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            <ShieldCheck className="inline h-3 w-3 mr-1.5 -mt-0.5" />
            AI-assisted screening result — intended to support clinical evaluation, not replace
            laboratory confirmation.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={() => navigate('/scanner')}>
            <RotateCcw className="h-4 w-4 mr-2" />
            New Screening
          </Button>
          <Button className="flex-1" onClick={() => setShowPDFDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF Report
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Results;
