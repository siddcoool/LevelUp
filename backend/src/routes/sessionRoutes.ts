import type { Request, Response } from 'express';
import { Router } from 'express';
import { SessionService } from '../services/SessionService';
import type { CreateSessionRequest, SubmitSessionRequest, TestSession } from '../types';

const router = Router();

/**
 * POST /api/sessions
 * Create a new test session
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { clerkUserId } = req;
    if (!clerkUserId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const request: CreateSessionRequest = req.body;
    
    // Validate request
    if (!request.mode || !request.branchId) {
      return res.status(400).json({ 
        error: 'Missing required fields: mode and branchId' 
      });
    }

    // Validate mode
    if (!['all', 'subject', 'topic'].includes(request.mode)) {
      return res.status(400).json({ 
        error: 'Invalid mode. Must be one of: all, subject, topic' 
      });
    }

    // Validate subject/topic requirements
    if (request.mode === 'subject' && !request.subjectId) {
      return res.status(400).json({ 
        error: 'subjectId required when mode is "subject"' 
      });
    }

    if (request.mode === 'topic' && (!request.subjectId || !request.topicId)) {
      return res.status(400).json({ 
        error: 'Both subjectId and topicId required when mode is "topic"' 
      });
    }

    const session = await SessionService.createSession(clerkUserId, request);
    
    res.status(201).json({
      message: 'Session created successfully',
      session: {
        id: session._id,
        mode: session.mode,
        levelNumber: session.levelNumber,
        questionCount: session.questionItems.length,
        startedAt: session.startedAt,
        questionItems: session.questionItems.map(q => ({
          questionId: q.questionId,
          stem: q.stem,
          options: q.options,
          difficulty: q.difficulty
        }))
      }
    });
  } catch (error: any) {
    console.error('Create session error:', error);
    res.status(500).json({ 
      error: 'Failed to create session',
      details: error.message 
    });
  }
});

/**
 * POST /api/sessions/:id/submit
 * Submit a completed test session
 */
router.post('/:id/submit', async (req: Request, res: Response) => {
  try {
    const { clerkUserId } = req;
    if (!clerkUserId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const request: SubmitSessionRequest = req.body;

    // Validate request
    if (!request.responses || !Array.isArray(request.responses)) {
      return res.status(400).json({ 
        error: 'responses array is required' 
      });
    }

    if (request.responses.length === 0) {
      return res.status(400).json({ 
        error: 'At least one response is required' 
      });
    }

    // Validate each response
    for (const response of request.responses) {
      if (!response.questionId || 
          typeof response.selectedIndex !== 'number' || 
          typeof response.timeSec !== 'number') {
        return res.status(400).json({ 
          error: 'Each response must have questionId, selectedIndex, and timeSec' 
        });
      }
    }

    const session = await SessionService.submitSession(id, request);
    
    res.json({
      message: 'Session submitted successfully',
      session: {
        id: session._id,
        score: session.score,
        completed: session.completed,
        completedAt: session.completedAt,
        responses: session.responses
      }
    });
  } catch (error: any) {
    console.error('Submit session error:', error);
    
    if (error.message === 'Session not found') {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (error.message === 'Session already completed') {
      return res.status(400).json({ error: 'Session already completed' });
    }
    
    res.status(500).json({ 
      error: 'Failed to submit session',
      details: error.message 
    });
  }
});

/**
 * GET /api/sessions/:id
 * Get a test session
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { clerkUserId } = req;
    if (!clerkUserId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const includeAnswers = req.query.answers === 'true';
    
    const session = await SessionService.getSession(id, includeAnswers);
    
    res.json({
      session: {
        id: session._id,
        mode: session.mode,
        levelNumber: session.levelNumber,
        targetDifficulty: session.targetDifficulty,
        questionCount: session.questionItems.length,
        startedAt: session.startedAt,
        completed: session.completed,
        completedAt: session.completedAt,
        score: session.score,
        questionItems: session.questionItems.map(q => ({
          questionId: q.questionId,
          stem: q.stem,
          options: q.options,
          difficulty: q.difficulty,
          correctIndex: q.correctIndex // Only included if includeAnswers=true
        })),
        responses: session.responses
      }
    });
  } catch (error: any) {
    console.error('Get session error:', error);
    
    if (error.message === 'Session not found') {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.status(500).json({ 
      error: 'Failed to get session',
      details: error.message 
    });
  }
});

/**
 * GET /api/sessions
 * Get user's session history
 */
// router.get('/', async (req: Request, res: Response) => {
//   try {
//     const { clerkUserId } = req;
//     if (!clerkUserId) {
//       return res.status(401).json({ error: 'Authentication required' });
//     }

//     const { branchId, limit = '10', offset = '0' } = req.query;
    
//     if (!branchId) {
//       return res.status(400).json({ error: 'branchId query parameter is required' });
//     }

//     const sessions = await SessionService.getSessions({
//       branchId: branchId as string,
//       limit: parseInt(limit as string),
//       offset: parseInt(offset as string)
//     });

//     res.json({
//       sessions: sessions.map((session: TestSession) => ({
//         id: session._id,
//         mode: session.mode,
//         levelNumber: session.levelNumber,
//         score: session.score,
//         completed: session.completed,
//         startedAt: session.startedAt,
//         completedAt: session.completedAt,
//         questionCount: session.questionItems.length
//       })),
//       pagination: {
//         total: sessions.length,
//         limit: parseInt(limit as string),
//         offset: parseInt(offset as string)
//       }
//     });
//   } catch (error: any) {
//     console.error('Get sessions error:', error);
//     res.status(500).json({ 
//       error: 'Failed to get sessions',
//       details: error.message 
//     });
//   }
// });

export { router as sessionRoutes };
