import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/analytics/performance
 * Track performance metrics for monitoring
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fcp, lcp, cls, ttfb, pageLoadTime, timestamp, url, userAgent } = body;

    // Log performance metrics
    console.log('Performance Metrics:', {
      fcp: fcp ? `${fcp.toFixed(2)}ms` : 'N/A',
      lcp: lcp ? `${lcp.toFixed(2)}ms` : 'N/A',
      cls: cls ? cls.toFixed(3) : 'N/A',
      ttfb: ttfb ? `${ttfb.toFixed(2)}ms` : 'N/A',
      pageLoadTime: pageLoadTime ? `${pageLoadTime.toFixed(2)}ms` : 'N/A',
      url,
      timestamp,
    });

    // TODO: Send to analytics service (e.g., Google Analytics, Datadog, etc.)
    // For now, we'll just log it

    // Check if metrics meet Lighthouse targets
    const meetsTargets = {
      fcp: (fcp ?? 0) < 1800,
      lcp: (lcp ?? 0) < 2500,
      cls: (cls ?? 0) < 0.1,
      ttfb: (ttfb ?? 0) < 600,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Performance metrics recorded',
        meetsTargets,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error recording performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to record performance metrics' },
      { status: 500 }
    );
  }
}

