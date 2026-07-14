import { Plan } from '../types';
import { OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS } from './bibleBooks';

const paulineEpistles = [
    'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon'
];

const gospelBooks = ['Matthew', 'Mark', 'Luke', 'John'];

const psalmBooks = ['Psalms'];

export const communityPlan: Plan = {
    id: 'pauline-epistles',
    title: 'Pauline Epistles',
    description: 'join thousands of people around the world to study the Chronological Order of The Pauline Epistles',
    longDescription: 'Complete the Pauline Epistles in one month by reading 7 chapters per day. Walk through Paul\'s letters in chronological order and discover the depth of grace, faith, and Christian living.',
    type: 'community',
    category: 'epistles',
    participantCount: 4821,
    details: {
        duration: '30 days',
        ends: 'December',
        chaptersPerDay: 7,
        books: paulineEpistles,
    }
};

const newTestamentPlan: Plan = {
    id: 'new-testament',
    title: 'New Testament',
    description: 'read through the entire New Testament with a community of believers around the world',
    longDescription: 'Complete the New Testament in one month by reading 9 chapters per day. Experience the life of Christ, the early church, and the letters that shaped Christian faith.',
    type: 'community',
    category: 'new-testament',
    participantCount: 9103,
    details: {
        duration: '30 days',
        ends: 'December',
        chaptersPerDay: 9,
        books: NEW_TESTAMENT_BOOKS,
    }
};

const oldTestamentPlan: Plan = {
    id: 'old-testament',
    title: 'Old Testament',
    description: 'journey through the entire Old Testament at a steady, guided pace',
    longDescription: 'Walk through the entire Old Testament in 60 days by reading 14 chapters per day. From creation to the prophets, trace God\'s faithfulness through the story of Israel.',
    type: 'community',
    category: 'old-testament',
    participantCount: 6247,
    details: {
        duration: '60 days',
        ends: 'December',
        chaptersPerDay: 14,
        books: OLD_TESTAMENT_BOOKS,
    }
};

const fourGospelsPlan: Plan = {
    id: 'four-gospels',
    title: 'The Four Gospels',
    description: 'walk through Matthew, Mark, Luke, and John in 30 days and encounter Jesus afresh',
    longDescription: 'Read all four Gospel accounts in 30 days, 3 chapters per day. See the life, ministry, death, and resurrection of Jesus through four unique perspectives.',
    type: 'community',
    category: 'gospels',
    participantCount: 3214,
    details: {
        duration: '30 days',
        ends: 'December',
        chaptersPerDay: 3,
        books: gospelBooks,
    }
};

const psalmsJourneyPlan: Plan = {
    id: 'psalms-journey',
    title: 'Psalms in 30 Days',
    description: 'read through all 150 Psalms in one month — prayers, praises, and laments for every season',
    longDescription: 'Immerse yourself in the Book of Psalms over 30 days, reading 5 chapters per day. Let the ancient prayers of David and others become your own voice before God.',
    type: 'community',
    category: 'devotional',
    participantCount: 5638,
    details: {
        duration: '30 days',
        ends: 'December',
        chaptersPerDay: 5,
        books: psalmBooks,
    }
};

export const featuredCommunityPlans: Plan[] = [
    newTestamentPlan,
    communityPlan,
    fourGospelsPlan,
    psalmsJourneyPlan,
    oldTestamentPlan,
];
