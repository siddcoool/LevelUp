import type { Request, Response } from 'express';
import { Router } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply admin middleware to all admin routes
router.use(adminMiddleware);

/**
 * GET /api/admin/metrics/overview
 * Get overview metrics for a date range
 */
router.get('/metrics/overview', async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ 
        error: 'Both from and to date parameters are required (YYYY-MM-DD format)' 
      });
    }

    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD format' 
      });
    }

    if (fromDate > toDate) {
      return res.status(400).json({ 
        error: 'From date must be before or equal to to date' 
      });
    }

    const metrics = await AnalyticsService.getOverviewMetrics(fromDate, toDate);
    
    res.json(metrics);
  } catch (error: any) {
    console.error('Get overview metrics error:', error);
    res.status(500).json({ 
      error: 'Failed to get overview metrics',
      details: error.message 
    });
  }
});

/**
 * GET /api/admin/heatmap/topic-accuracy
 * Get topic accuracy heatmap for a branch
 */
router.get('/heatmap/topic-accuracy', async (req: Request, res: Response) => {
  try {
    const { branchId, from, to } = req.query;
    
    if (!branchId) {
      return res.status(400).json({ error: 'branchId parameter is required' });
    }

    if (!from || !to) {
      return res.status(400).json({ 
        error: 'Both from and to date parameters are required (YYYY-MM-DD format)' 
      });
    }

    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD format' 
      });
    }

    const heatmap = await AnalyticsService.getTopicAccuracyHeatmap(
      branchId as string,
      fromDate,
      toDate
    );
    
    res.json({
      branchId,
      period: { from: from as string, to: to as string },
      heatmap
    });
  } catch (error: any) {
    console.error('Get topic accuracy heatmap error:', error);
    res.status(500).json({ 
      error: 'Failed to get topic accuracy heatmap',
      details: error.message 
    });
  }
});

/**
 * GET /api/admin/users/:id/responses
 * Get individual user response drilldown
 */
router.get('/users/:id/responses', async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.params;
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ 
        error: 'Both from and to date parameters are required (YYYY-MM-DD format)' 
      });
    }

    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD format' 
      });
    }

    const userData = await AnalyticsService.getUserResponses(
      userId,
      fromDate,
      toDate
    );
    
    res.json(userData);
  } catch (error: any) {
    console.error('Get user responses error:', error);
    res.status(500).json({ 
      error: 'Failed to get user responses',
      details: error.message 
    });
  }
});

/**
 * GET /api/admin/sessions
 * Get sessions with filters
 */
router.get('/sessions', async (req: Request, res: Response) => {
  try {
    const { 
      branchId, 
      subjectId, 
      from, 
      to, 
      limit = '50', 
      offset = '0' 
    } = req.query;

    const filters: any = {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    };

    if (branchId) filters.branchId = branchId as string;
    if (subjectId) filters.subjectId = subjectId as string;
    
    if (from && to) {
      const fromDate = new Date(from as string);
      const toDate = new Date(to as string);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return res.status(400).json({ 
          error: 'Invalid date format. Use YYYY-MM-DD format' 
        });
      }

      filters.fromDate = fromDate;
      filters.toDate = toDate;
    }

    const sessions = await AnalyticsService.getSessions(filters);
    
    res.json(sessions);
  } catch (error: any) {
    console.error('Get admin sessions error:', error);
    res.status(500).json({ 
      error: 'Failed to get sessions',
      details: error.message 
    });
  }
});

/**
 * GET /api/admin/dashboard
 * Get dashboard summary data
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    // Get last 7 days metrics
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);

    const weeklyMetrics = await AnalyticsService.getOverviewMetrics(fromDate, toDate);
    
    // Get last 30 days metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyMetrics = await AnalyticsService.getOverviewMetrics(thirtyDaysAgo, toDate);

    res.json({
      weekly: weeklyMetrics,
      monthly: monthlyMetrics,
      lastUpdated: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to get dashboard data',
      details: error.message 
    });
  }
});

export { router as adminRoutes };
