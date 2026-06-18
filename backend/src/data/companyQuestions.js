// Curated bank of real, commonly-asked interview questions grouped by company
// and round. Used to ground AI generation and as a fallback when the AI service
// is unavailable, so users always get authentic company-style questions.

// Generic, round-specific questions (company name is interpolated at runtime).
const GENERIC = {
  hr: [
    'Tell me about yourself and why you want to work at {company}.',
    'Why do you want to join {company} specifically?',
    'Where do you see yourself in five years?',
    'What are your biggest strengths and weaknesses?',
    'Tell me about a time you faced a conflict in a team and how you resolved it.',
    'Why are you leaving your current role / looking for a change?',
    'What do you know about {company} and our products?'
  ],
  technical: [
    'Explain the difference between an array and a linked list, and when you would use each.',
    'What happens, step by step, when you type a URL into a browser and press Enter?',
    'Explain the difference between processes and threads.',
    'What is the difference between SQL and NoSQL databases? When would you pick each?',
    'How does garbage collection work in the language you are most comfortable with?',
    'Explain time and space complexity and analyze a function you have written.',
    'What are REST APIs and what makes an API RESTful?'
  ],
  behavioral: [
    'Tell me about a time you failed and what you learned from it.',
    'Describe a situation where you had to meet a tight deadline.',
    'Tell me about a time you disagreed with a teammate or manager.',
    'Describe a project you are most proud of and your specific contribution.',
    'Tell me about a time you took ownership of something outside your responsibilities.',
    'Describe a time you received difficult feedback and how you responded.'
  ],
  coding: [
    'Given an array of integers, return indices of the two numbers that add up to a target.',
    'Reverse a linked list, both iteratively and recursively.',
    'Find the longest substring without repeating characters.',
    'Check whether a string of brackets is balanced/valid.',
    'Merge two sorted linked lists into one sorted list.',
    'Find the maximum sum of a contiguous subarray (Kadane\'s algorithm).',
    'Given a binary tree, return its level-order (BFS) traversal.'
  ],
  system_design: [
    'Design a URL shortening service like TinyURL.',
    'Design a scalable news feed system.',
    'Design a rate limiter for an API gateway.',
    'Design a chat application that supports millions of concurrent users.',
    'Design a key-value store with high availability.',
    'How would you design a notification system (email/SMS/push) at scale?'
  ]
};

// Company-specific flavour. Where a company/round is missing we fall back to GENERIC.
const COMPANIES = {
  Google: {
    technical: [
      'How would you detect a cycle in a directed graph?',
      'Explain how a hash map works internally and how collisions are handled.',
      'Design an LRU cache with O(1) get and put operations.'
    ],
    coding: [
      'Given a 2D grid of 1s and 0s, count the number of islands.',
      'Implement an autocomplete system using a Trie.',
      'Find the median of two sorted arrays in logarithmic time.'
    ],
    system_design: ['Design Google Search autocomplete.', 'Design a distributed web crawler.'],
    behavioral: ['Tell me about a time you handled ambiguity on a project ("Googleyness").']
  },
  Amazon: {
    behavioral: [
      'Tell me about a time you had to make a decision with incomplete data (Bias for Action).',
      'Describe a time you disagreed with your manager and how you handled it (Have Backbone; Disagree and Commit).',
      'Tell me about a time you went above and beyond for a customer (Customer Obsession).',
      'Describe a time you took ownership of a problem that was not yours (Ownership).'
    ],
    technical: ['Design a parking lot system using object-oriented principles.', 'How does DynamoDB achieve scalability?'],
    coding: ['Find the k closest points to the origin.', 'Implement a function to return the top K frequent elements.'],
    system_design: ['Design Amazon\'s product recommendation system.', 'Design an e-commerce order/checkout system.']
  },
  Microsoft: {
    coding: ['Reverse words in a string in place.', 'Given a linked list, detect and remove the loop.', 'Serialize and deserialize a binary tree.'],
    technical: ['Explain virtual memory and paging.', 'What is the difference between an abstract class and an interface?'],
    system_design: ['Design a service like Microsoft Teams chat.']
  },
  Meta: {
    coding: ['Given a string, find the longest palindromic substring.', 'Implement a function to flatten a nested list of integers.', 'Merge k sorted lists.'],
    behavioral: ['Tell me about a time you moved fast and broke something — what did you do next?'],
    system_design: ['Design the Facebook News Feed.', 'Design Instagram.']
  },
  Apple: {
    technical: ['Explain memory management and ARC (Automatic Reference Counting).', 'How would you debug a memory leak?'],
    coding: ['Implement a thread-safe singleton.', 'Given a stream of numbers, return the running median.'],
    system_design: ['Design the backend for iMessage.']
  },
  Netflix: {
    system_design: ['Design a video streaming service like Netflix.', 'Design a content delivery / caching strategy for video.'],
    behavioral: ['Describe how you handled a high-impact production incident.']
  },
  Uber: {
    system_design: ['Design a ride-hailing service like Uber.', 'Design a system to match riders with nearby drivers in real time.'],
    coding: ['Find the shortest path in a weighted graph (Dijkstra).']
  },
  Airbnb: {
    system_design: ['Design a booking/reservation system like Airbnb.', 'Design a search-and-filter system for listings.'],
    coding: ['Design a data structure for an availability calendar.']
  },
  Flipkart: {
    coding: ['Find the maximum profit from at most two stock transactions.', 'Implement an inventory deduction system handling concurrent orders.'],
    system_design: ['Design a flash-sale system that handles massive traffic spikes.']
  },
  Zoho: {
    technical: ['Write a program to check if two strings are anagrams.', 'Explain joins in SQL with examples.'],
    coding: ['Print all prime numbers up to N efficiently (Sieve of Eratosthenes).', 'Find the second largest element in an array.']
  }
};

const ROUND_KEYS = ['hr', 'technical', 'behavioral', 'coding', 'system_design'];

const normalizeRound = (round) => {
  const r = String(round || '').toLowerCase().replace(/[\s-]+/g, '_');
  return ROUND_KEYS.includes(r) ? r : 'technical';
};

const difficultyForRound = (round, askedCount) => {
  if (round === 'coding' || round === 'system_design') {
    return askedCount < 2 ? 'medium' : 'hard';
  }
  return askedCount < 3 ? 'easy' : askedCount < 6 ? 'medium' : 'hard';
};

// Build the candidate question pool for a company + round.
const poolFor = (company, round) => {
  const r = normalizeRound(round);
  const generic = (GENERIC[r] || GENERIC.technical).map(q => q.replace(/\{company\}/g, company || 'the company'));
  const specific = (COMPANIES[company] && COMPANIES[company][r]) || [];
  return [...specific, ...generic];
};

// Returns a real, company-specific question object not already asked.
const getFallbackQuestion = (company, round, askedQuestions = []) => {
  const r = normalizeRound(round);
  const asked = new Set((askedQuestions || []).map(q => String(q).trim().toLowerCase()));
  const pool = poolFor(company, r);
  const next = pool.find(q => !asked.has(q.trim().toLowerCase())) || pool[asked.size % pool.length] || 'Tell me about yourself.';
  return {
    question: next,
    type: r === 'system_design' ? 'system_design' : r === 'coding' ? 'coding' : r === 'behavioral' || r === 'hr' ? 'behavioral' : 'technical',
    difficulty: difficultyForRound(r, asked.size),
    expectedKeyPoints: [],
    followUps: []
  };
};

module.exports = { getFallbackQuestion, poolFor, normalizeRound };
