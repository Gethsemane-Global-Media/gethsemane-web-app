import { Plan } from '../types';
import { OLD_TESTAMENT_BOOKS } from './bibleBooks';

const paulineEpistles = [
    'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon'
];

export const communityPlan: Plan = {
    id: 'pauline-epistles',
    title: 'Pauline Epistle',
    description: 'Join thousands of people around the world to study the Chronological Order of The Pauline Epistles',
    longDescription: 'Complete the Pauline Epistle in one month. by reading 7 chapter per day.',
    type: 'community',
    details: {
        duration: '30 days',
        ends: 'December',
        chaptersPerDay: 7,
        books: paulineEpistles,
    }
};

const oldTestamentPlan: Plan = {
    id: 'old-testament',
    title: 'Old Testament',
    description: 'A plan to read through the entire Old Testament.',
    longDescription: 'Complete the Old testament in two month. by reading 14 chapter per day.',
    type: 'community',
    details: {
        duration: '30 days',
        ends: 'December',
        chaptersPerDay: 14,
        books: OLD_TESTAMENT_BOOKS,
    }
};

export const moreCommunityPlans: Plan[] = [
    oldTestamentPlan,
];
