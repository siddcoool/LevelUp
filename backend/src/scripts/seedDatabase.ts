import mongoose from 'mongoose';
import { Branch, Subject, Topic, Question, User } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/levelup';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      Branch.deleteMany({}),
      Subject.deleteMany({}),
      Topic.deleteMany({}),
      Question.deleteMany({}),
      User.deleteMany({})
    ]);

    // Create branches
    console.log('Creating branches...');
    const jeeBranch = await Branch.create({
      key: 'JEE',
      name: 'Joint Entrance Examination',
      order: 1
    });

    const neetBranch = await Branch.create({
      key: 'NEET',
      name: 'National Eligibility cum Entrance Test',
      order: 2
    });

    // Create subjects for JEE
    console.log('Creating JEE subjects...');
    const jeePhysics = await Subject.create({
      branchId: jeeBranch._id,
      key: 'physics',
      name: 'Physics',
      order: 1,
      topicCount: 0
    });

    const jeeChemistry = await Subject.create({
      branchId: jeeBranch._id,
      key: 'chemistry',
      name: 'Chemistry',
      order: 2,
      topicCount: 0
    });

    const jeeMath = await Subject.create({
      branchId: jeeBranch._id,
      key: 'mathematics',
      name: 'Mathematics',
      order: 3,
      topicCount: 0
    });

    // Create subjects for NEET
    console.log('Creating NEET subjects...');
    const neetPhysics = await Subject.create({
      branchId: neetBranch._id,
      key: 'physics',
      name: 'Physics',
      order: 1,
      topicCount: 0
    });

    const neetChemistry = await Subject.create({
      branchId: neetBranch._id,
      key: 'chemistry',
      name: 'Chemistry',
      order: 2,
      topicCount: 0
    });

    const neetBiology = await Subject.create({
      branchId: neetBranch._id,
      key: 'biology',
      name: 'Biology',
      order: 3,
      topicCount: 0
    });

    // Create topics for JEE Physics
    console.log('Creating JEE Physics topics...');
    const jeePhysicsTopics = await Topic.insertMany([
      {
        branchId: jeeBranch._id,
        subjectId: jeePhysics._id,
        key: 'mechanics',
        name: 'Mechanics',
        syllabusPath: ['Mechanics'],
        order: 1
      },
      {
        branchId: jeeBranch._id,
        subjectId: jeePhysics._id,
        key: 'kinematics',
        name: 'Kinematics',
        syllabusPath: ['Mechanics', 'Kinematics'],
        order: 2
      },
      {
        branchId: jeeBranch._id,
        subjectId: jeePhysics._id,
        key: 'dynamics',
        name: 'Dynamics',
        syllabusPath: ['Mechanics', 'Dynamics'],
        order: 3
      },
      {
        branchId: jeeBranch._id,
        subjectId: jeePhysics._id,
        key: 'thermodynamics',
        name: 'Thermodynamics',
        syllabusPath: ['Thermodynamics'],
        order: 4
      },
      {
        branchId: jeeBranch._id,
        subjectId: jeePhysics._id,
        key: 'electromagnetism',
        name: 'Electromagnetism',
        syllabusPath: ['Electromagnetism'],
        order: 5
      }
    ]);

    // Create topics for JEE Chemistry
    console.log('Creating JEE Chemistry topics...');
    const jeeChemistryTopics = await Topic.insertMany([
      {
        branchId: jeeBranch._id,
        subjectId: jeeChemistry._id,
        key: 'physical-chemistry',
        name: 'Physical Chemistry',
        syllabusPath: ['Physical Chemistry'],
        order: 1
      },
      {
        branchId: jeeBranch._id,
        subjectId: jeeChemistry._id,
        key: 'organic-chemistry',
        name: 'Organic Chemistry',
        syllabusPath: ['Organic Chemistry'],
        order: 2
      },
      {
        branchId: jeeBranch._id,
        subjectId: jeeChemistry._id,
        key: 'inorganic-chemistry',
        name: 'Inorganic Chemistry',
        syllabusPath: ['Inorganic Chemistry'],
        order: 3
      }
    ]);

    // Create topics for JEE Mathematics
    console.log('Creating JEE Mathematics topics...');
    const jeeMathTopics = await Topic.insertMany([
      {
        branchId: jeeBranch._id,
        subjectId: jeeMath._id,
        key: 'algebra',
        name: 'Algebra',
        syllabusPath: ['Algebra'],
        order: 1
      },
      {
        branchId: jeeBranch._id,
        subjectId: jeeMath._id,
        key: 'calculus',
        name: 'Calculus',
        syllabusPath: ['Calculus'],
        order: 2
      },
      {
        branchId: jeeBranch._id,
        subjectId: jeeMath._id,
        key: 'geometry',
        name: 'Geometry',
        syllabusPath: ['Geometry'],
        order: 3
      }
    ]);

    // Create topics for NEET subjects
    console.log('Creating NEET topics...');
    const neetPhysicsTopics = await Topic.insertMany([
      {
        branchId: neetBranch._id,
        subjectId: neetPhysics._id,
        key: 'mechanics',
        name: 'Mechanics',
        syllabusPath: ['Mechanics'],
        order: 1
      },
      {
        branchId: neetBranch._id,
        subjectId: neetPhysics._id,
        key: 'optics',
        name: 'Optics',
        syllabusPath: ['Optics'],
        order: 2
      }
    ]);

    const neetChemistryTopics = await Topic.insertMany([
      {
        branchId: neetBranch._id,
        subjectId: neetChemistry._id,
        key: 'organic-chemistry',
        name: 'Organic Chemistry',
        syllabusPath: ['Organic Chemistry'],
        order: 1
      },
      {
        branchId: neetBranch._id,
        subjectId: neetChemistry._id,
        key: 'biochemistry',
        name: 'Biochemistry',
        syllabusPath: ['Biochemistry'],
        order: 2
      }
    ]);

    const neetBiologyTopics = await Topic.insertMany([
      {
        branchId: neetBranch._id,
        subjectId: neetBiology._id,
        key: 'botany',
        name: 'Botany',
        syllabusPath: ['Botany'],
        order: 1
      },
      {
        branchId: neetBranch._id,
        subjectId: neetBiology._id,
        key: 'zoology',
        name: 'Zoology',
        syllabusPath: ['Zoology'],
        order: 2
      }
    ]);

    // Update subject topic counts
    await Subject.findByIdAndUpdate(jeePhysics._id, { topicCount: jeePhysicsTopics.length });
    await Subject.findByIdAndUpdate(jeeChemistry._id, { topicCount: jeeChemistryTopics.length });
    await Subject.findByIdAndUpdate(jeeMath._id, { topicCount: jeeMathTopics.length });
    await Subject.findByIdAndUpdate(neetPhysics._id, { topicCount: neetPhysicsTopics.length });
    await Subject.findByIdAndUpdate(neetChemistry._id, { topicCount: neetChemistryTopics.length });
    await Subject.findByIdAndUpdate(neetBiology._id, { topicCount: neetBiologyTopics.length });

    // Create sample questions
    console.log('Creating sample questions...');
    const sampleQuestions = await Question.insertMany([
      // JEE Physics - Kinematics
      {
        branchId: jeeBranch._id,
        subjectId: jeePhysics._id,
        topicIds: [jeePhysicsTopics.find(t => t.key === 'kinematics')!._id],
        source: 'db',
        status: 'approved',
        stem: 'A car accelerates from rest at 2 m/s² for 10 seconds. What is its final velocity?',
        options: ['5 m/s', '10 m/s', '20 m/s', '25 m/s'],
        correctIndex: 2,
        solution: 'Using v = u + at, where u = 0, a = 2 m/s², t = 10s. v = 0 + 2 × 10 = 20 m/s',
        difficulty: 0.4,
        tags: ['kinematics', 'acceleration', 'velocity'],
        stats: { attemptCount: 0, correctCount: 0, avgTimeSec: 0 }
      },
      {
        branchId: jeeBranch._id,
        subjectId: jeePhysics._id,
        topicIds: [jeePhysicsTopics.find(t => t.key === 'kinematics')!._id],
        source: 'db',
        status: 'approved',
        stem: 'A ball is thrown vertically upward with a velocity of 20 m/s. How high does it rise? (g = 10 m/s²)',
        options: ['10 m', '20 m', '30 m', '40 m'],
        correctIndex: 1,
        solution: 'Using v² = u² + 2as, where v = 0, u = 20 m/s, a = -10 m/s². 0 = 400 - 20s, s = 20 m',
        difficulty: 0.6,
        tags: ['kinematics', 'projectile', 'height'],
        stats: { attemptCount: 0, correctCount: 0, avgTimeSec: 0 }
      },
      // JEE Chemistry - Organic
      {
        branchId: jeeBranch._id,
        subjectId: jeeChemistry._id,
        topicIds: [jeeChemistryTopics.find(t => t.key === 'organic-chemistry')!._id],
        source: 'db',
        status: 'approved',
        stem: 'Which of the following is a functional group in organic chemistry?',
        options: ['-OH', '-NH₂', '-COOH', 'All of the above'],
        correctIndex: 3,
        solution: 'All three are common functional groups: -OH (hydroxyl), -NH₂ (amino), -COOH (carboxyl)',
        difficulty: 0.3,
        tags: ['organic-chemistry', 'functional-groups'],
        stats: { attemptCount: 0, correctCount: 0, avgTimeSec: 0 }
      },
      // JEE Mathematics - Algebra
      {
        branchId: jeeBranch._id,
        subjectId: jeeMath._id,
        topicIds: [jeeMathTopics.find(t => t.key === 'algebra')!._id],
        source: 'db',
        status: 'approved',
        stem: 'Solve the quadratic equation: x² - 5x + 6 = 0',
        options: ['x = 2, 3', 'x = -2, -3', 'x = 1, 6', 'x = -1, -6'],
        correctIndex: 0,
        solution: 'Factoring: x² - 5x + 6 = (x - 2)(x - 3) = 0. Therefore, x = 2 or x = 3',
        difficulty: 0.5,
        tags: ['algebra', 'quadratic', 'factoring'],
        stats: { attemptCount: 0, correctCount: 0, avgTimeSec: 0 }
      },
      // NEET Biology - Botany
      {
        branchId: neetBranch._id,
        subjectId: neetBiology._id,
        topicIds: [neetBiologyTopics.find(t => t.key === 'botany')!._id],
        source: 'db',
        status: 'approved',
        stem: 'Which process is responsible for the movement of water from roots to leaves in plants?',
        options: ['Osmosis', 'Transpiration', 'Photosynthesis', 'Respiration'],
        correctIndex: 1,
        solution: 'Transpiration creates a negative pressure that pulls water up through the xylem from roots to leaves',
        difficulty: 0.4,
        tags: ['botany', 'transpiration', 'water-transport'],
        stats: { attemptCount: 0, correctCount: 0, avgTimeSec: 0 }
      }
    ]);

    // Create a sample admin user
    console.log('Creating sample admin user...');
    await User.create({
      clerkUserId: 'admin-sample',
      role: 'admin',
      name: 'Admin User',
      email: 'admin@levelup.com'
    });

    console.log('Database seeded successfully!');
    console.log(`Created ${sampleQuestions.length} sample questions`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedDatabase();
