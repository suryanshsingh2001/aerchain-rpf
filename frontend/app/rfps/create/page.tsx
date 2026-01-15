'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Loader2,
  Package,
  DollarSign,
  Calendar,
  FileText,
  Shield,
  Clock,
  ChevronRight,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRfps } from '@/hooks/use-rfps';
import type { Rfp, RfpItem } from '@/lib/types';
import { toast } from 'sonner';

const examplePrompts = [
  "20 laptops with 16GB RAM and 15 monitors 27-inch for new office. Budget $50,000, delivery in 30 days, net 30 payment, 1 year warranty.",
  "50 ergonomic chairs, 25 standing desks, 10 conference tables. Budget $75,000, delivery in 2 weeks, 2 year warranty.",
  "100 iPads 256GB for sales team. Budget $60,000, net 45 payment, delivery in 3 weeks."
];

export default function CreateRfpPage() {
  const router = useRouter();
  const { createRfp, loading } = useRfps();
  const [input, setInput] = useState('');
  const [generatedRfp, setGeneratedRfp] = useState<Rfp | null>(null);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error('Please describe what you want to procure');
      return;
    }

    if (input.length < 20) {
      toast.error('Please provide more details about your requirements');
      return;
    }

    const rfp = await createRfp(input);
    if (rfp) {
      setGeneratedRfp(rfp);
      toast.success('RFP generated successfully!');
    } else {
      toast.error('Failed to generate RFP. Please try again.');
    }
  };

  const handleUseExample = (example: string) => {
    setInput(example);
  };

  const formatCurrency = (value: string | null | undefined, currency = 'USD') => {
    if (!value) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
      {!generatedRfp ? (
          <div className="space-y-6">
            {/* Main Input Section - Hero Style */}
            <div className="text-center space-y-2 pt-4">
              <div className="inline-flex items-center justify-center rounded-full bg-violet-500/10 p-3 mb-2">
                <Sparkles className="h-6 w-6 text-violet-500" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">What do you need to procure?</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Describe your requirements and we'll create a structured RFP instantly.
              </p>
            </div>

            {/* Large Textarea */}
            <div className="space-y-3">
              <Textarea
                placeholder="Describe what you need, quantities, budget, timeline, and any specific requirements..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={14}
                className="min-h-40 text-base p-5 rounded-xl border-2 focus:border-violet-500 transition-colors"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {input.length > 0 ? `${input.length} characters` : 'Min 20 characters required'}
                </span>
                <Button 
                  onClick={handleGenerate} 
                  disabled={loading || input.length < 20}
                  size="lg"
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate RFP
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Examples - Compact */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">Try an example:</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleUseExample(prompt)}
                    className="text-left p-3 rounded-lg border bg-muted/30 hover:bg-muted/60 hover:border-violet-500/30 transition-all text-sm"
                  >
                    <p className="line-clamp-2 text-muted-foreground">{prompt}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips - Minimal */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground pt-4">
              <span className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" /> Items & quantities
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" /> Budget
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Timeline
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Requirements
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Generated RFP Preview */}
            <Card className="border-emerald-500/50 bg-emerald-500/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2 bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                      ✓ RFP Generated
                    </Badge>
                    <CardTitle>{generatedRfp.title}</CardTitle>
                    {generatedRfp.description && (
                      <CardDescription className="mt-2">
                        {generatedRfp.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Items */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Items Required
                  </h4>
                  <div className="space-y-2">
                    {(generatedRfp.items as RfpItem[]).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-3 rounded-lg border bg-background"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.specifications && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.specifications}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary">
                          Qty: {item.quantity} {item.unit || ''}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Terms Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Budget</span>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(generatedRfp.budget, generatedRfp.currency)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Delivery</span>
                    </div>
                    <p className="font-medium">
                      {generatedRfp.deliveryDays
                        ? `${generatedRfp.deliveryDays} days`
                        : 'Not specified'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">Payment Terms</span>
                    </div>
                    <p className="font-medium">
                      {generatedRfp.paymentTerms || 'Not specified'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm">Warranty</span>
                    </div>
                    <p className="font-medium">
                      {generatedRfp.warrantyMonths
                        ? `${generatedRfp.warrantyMonths} months`
                        : 'Not specified'}
                    </p>
                  </div>
                </div>

                {generatedRfp.additionalTerms && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Additional Terms</h4>
                      <p className="text-sm text-muted-foreground">
                        {generatedRfp.additionalTerms}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedRfp(null);
                  setInput('');
                }}
              >
                Start Over
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <Link href={`/rfps/${generatedRfp.id}`}>
                    View Details
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/rfps/${generatedRfp.id}/send`}>
                    <Send className="h-4 w-4" />
                    Send to Vendors
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
