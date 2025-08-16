import { Router, Request, Response } from 'express';
import { Branch, Subject, Topic } from '../models/index.js';

const router = Router();

/**
 * GET /api/taxonomy
 * Get complete taxonomy for a branch
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { branch } = req.query;
    
    if (!branch) {
      return res.status(400).json({ error: 'branch query parameter is required' });
    }

    // Get branch
    const branchData = await Branch.findOne({ key: branch });
    if (!branchData) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    // Get subjects for this branch
    const subjects = await Subject.find({ branchId: branchData._id })
      .sort({ order: 1 });

    // Get topics for each subject
    const subjectsWithTopics = await Promise.all(
      subjects.map(async (subject) => {
        const topics = await Topic.find({ 
          branchId: branchData._id, 
          subjectId: subject._id 
        }).sort({ order: 1 });

        return {
          id: subject._id,
          key: subject.key,
          name: subject.name,
          order: subject.order,
          topicCount: subject.topicCount,
          topics: topics.map(topic => ({
            id: topic._id,
            key: topic.key,
            name: topic.name,
            syllabusPath: topic.syllabusPath,
            order: topic.order
          }))
        };
      })
    );

    res.json({
      branch: {
        id: branchData._id,
        key: branchData.key,
        name: branchData.name,
        order: branchData.order
      },
      subjects: subjectsWithTopics
    });
  } catch (error: any) {
    console.error('Get taxonomy error:', error);
    res.status(500).json({ 
      error: 'Failed to get taxonomy',
      details: error.message 
    });
  }
});

/**
 * GET /api/taxonomy/branches
 * Get all available branches
 */
router.get('/branches', async (req: Request, res: Response) => {
  try {
    const branches = await Branch.find().sort({ order: 1 });
    
    res.json({
      branches: branches.map(branch => ({
        id: branch._id,
        key: branch.key,
        name: branch.name,
        order: branch.order
      }))
    });
  } catch (error: any) {
    console.error('Get branches error:', error);
    res.status(500).json({ 
      error: 'Failed to get branches',
      details: error.message 
    });
  }
});

/**
 * GET /api/taxonomy/branches/:branchKey/subjects
 * Get subjects for a specific branch
 */
router.get('/branches/:branchKey/subjects', async (req: Request, res: Response) => {
  try {
    const { branchKey } = req.params;
    
    const branch = await Branch.findOne({ key: branchKey });
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    const subjects = await Subject.find({ branchId: branch._id })
      .sort({ order: 1 });
    
    res.json({
      branch: {
        id: branch._id,
        key: branch.key,
        name: branch.name
      },
      subjects: subjects.map(subject => ({
        id: subject._id,
        key: subject.key,
        name: subject.name,
        order: subject.order,
        topicCount: subject.topicCount
      }))
    });
  } catch (error: any) {
    console.error('Get subjects error:', error);
    res.status(500).json({ 
      error: 'Failed to get subjects',
      details: error.message 
    });
  }
});

/**
 * GET /api/taxonomy/branches/:branchKey/subjects/:subjectKey/topics
 * Get topics for a specific subject
 */
router.get('/branches/:branchKey/subjects/:subjectKey/topics', async (req: Request, res: Response) => {
  try {
    const { branchKey, subjectKey } = req.params;
    
    const branch = await Branch.findOne({ key: branchKey });
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    const subject = await Subject.findOne({ 
      branchId: branch._id, 
      key: subjectKey 
    });
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const topics = await Topic.find({ 
      branchId: branch._id, 
      subjectId: subject._id 
    }).sort({ order: 1 });
    
    res.json({
      branch: {
        id: branch._id,
        key: branch.key,
        name: branch.name
      },
      subject: {
        id: subject._id,
        key: subject.key,
        name: subject.name
      },
      topics: topics.map(topic => ({
        id: topic._id,
        key: topic.key,
        name: topic.name,
        syllabusPath: topic.syllabusPath,
        order: topic.order
      }))
    });
  } catch (error: any) {
    console.error('Get topics error:', error);
    res.status(500).json({ 
      error: 'Failed to get topics',
      details: error.message 
    });
  }
});

export { router as taxonomyRoutes };
