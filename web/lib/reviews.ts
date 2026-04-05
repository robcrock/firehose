import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import type { DailyCount, ReviewsFile, Review, ClassifiedReview, ReviewCategory } from "./types";

const DATA_PATH = path.join(process.cwd(), "..", "data", "reviews.json");

export async function getReviews(): Promise<ReviewsFile> {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw) as ReviewsFile;
}

// ============================================================================
// CLASSIFICATION LOGIC
// ============================================================================

// Keyword patterns for classification
const BUG_PATTERNS = [
  /\bcrash(?:es|ed|ing)?\b/i,
  /\bbug(?:s|gy)?\b/i,
  /\bfreez(?:e|es|ing)\b/i,
  /\berror(?:s)?\b/i,
  /\bglitch(?:es|y)?\b/i,
  /\bnot work(?:ing)?\b/i,
  /\bdoesn'?t work\b/i,
  /\bwon'?t (?:open|load|start|connect)\b/i,
  /\bfail(?:s|ed|ing)?\b/i,
  /\bbroken\b/i,
  /\bunresponsive\b/i,
  /\bstuck\b/i,
  /\bhangs?\b/i,
  /\bslow\b/i,
  /\blaggy?\b/i,
  /\bforce close\b/i,
  /\bkeeps closing\b/i,
  /\bcan'?t (?:log ?in|sign ?in|connect|sync)\b/i,
  /\blogin (?:issue|problem|fail)\b/i,
  /\bsync(?:ing)? (?:issue|problem|fail|error)\b/i,
  /\bconnection (?:issue|problem|fail|error|lost)\b/i,
  /\bbattery drain\b/i,
  /\bdata (?:loss|lost|missing)\b/i,
];

const CLINICAL_PATTERNS = [
  /\binaccurate\b/i,
  /\bwrong reading\b/i,
  /\bincorrect (?:reading|value|number)\b/i,
  /\boff by\b/i,
  /\bdoesn'?t match\b/i,
  /\bblood (?:sugar|glucose)\b/i,
  /\breading(?:s)?\b/i,
  /\bsensor\b/i,
  /\bglucose\b/i,
  /\bdiabetes\b/i,
  /\bdiabetic\b/i,
  /\binsulin\b/i,
  /\ba1c\b/i,
  /\bhypo(?:glycemi[ac])?\b/i,
  /\bhyper(?:glycemi[ac])?\b/i,
  /\bcarbs?\b/i,
  /\bmedical\b/i,
  /\bhealth\b/i,
  /\bdanger(?:ous)?\b/i,
  /\blife threatening\b/i,
  /\bemergency\b/i,
  /\baccuracy\b/i,
  /\bcalibrat(?:e|ion)\b/i,
  /\balarm(?:s)?\b/i,
  /\balert(?:s)?\b/i,
  /\bnotif(?:y|ication)(?:s)?\b/i,
];

const FEATURE_PATTERNS = [
  /\bshould (?:have|add|include|allow)\b/i,
  /\bwould be (?:nice|great|helpful)\b/i,
  /\bplease add\b/i,
  /\bneeds? (?:to have|more|better)\b/i,
  /\bwish(?:es|ing)?\b/i,
  /\bsuggest(?:ion)?\b/i,
  /\brequest(?:ing)?\b/i,
  /\bfeature\b/i,
  /\bwant(?:s|ed)?\b/i,
  /\badd (?:a |an |the )?\b/i,
  /\bimprove\b/i,
  /\bupdate\b/i,
  /\benhance\b/i,
  /\boption(?:s)?\b/i,
  /\bability to\b/i,
  /\bintegrat(?:e|ion)\b/i,
  /\bsupport for\b/i,
  /\bwidget\b/i,
  /\bwatch\b/i,
  /\bapple watch\b/i,
  /\bcomplication\b/i,
  /\bdark mode\b/i,
  /\bexport\b/i,
  /\bshare\b/i,
  /\bcarplay\b/i,
];

const POSITIVE_PATTERNS = [
  /\blove(?:s|d)?\b/i,
  /\bgreat\b/i,
  /\bexcellent\b/i,
  /\bamazing\b/i,
  /\bawesome\b/i,
  /\bfantastic\b/i,
  /\bperfect\b/i,
  /\bwonderful\b/i,
  /\bincredible\b/i,
  /\boutstanding\b/i,
  /\bthank(?:s|ful)?\b/i,
  /\blife ?saver\b/i,
  /\blife ?changing\b/i,
  /\bgame ?changer\b/i,
  /\bhighly recommend\b/i,
  /\bbest app\b/i,
  /\bworks? (?:great|perfect|well|flawless)\b/i,
  /\bhappy\b/i,
  /\bsatisfied\b/i,
  /\bimpressed\b/i,
  /\breliable\b/i,
  /\baccurate\b/i,
  /\beasy to use\b/i,
  /\buser friendly\b/i,
  /\bsmooth\b/i,
  /\bseamless\b/i,
];

// Stop words to filter out when extracting phrases
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
  'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have',
  'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
  'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'this',
  'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me',
  'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their',
  'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also',
  'now', 'here', 'there', 'then', 'if', 'because', 'while', 'although',
  'though', 'after', 'before', 'since', 'until', 'unless', 'however', 'app',
  'apps', 'get', 'got', 'getting', 'go', 'going', 'gone', 'went', 'come',
  'coming', 'came', 'make', 'made', 'making', 'take', 'took', 'taking', 'see',
  'saw', 'seeing', 'know', 'knew', 'knowing', 'think', 'thought', 'thinking',
  'give', 'gave', 'giving', 'use', 'using', 'used', 'find', 'found', 'finding',
  'tell', 'told', 'telling', 'ask', 'asked', 'asking', 'work', 'worked',
  'working', 'seem', 'seemed', 'seeming', 'feel', 'felt', 'feeling', 'try',
  'tried', 'trying', 'leave', 'left', 'leaving', 'call', 'called', 'calling',
  'keep', 'kept', 'keeping', 'let', 'letting', 'begin', 'began', 'beginning',
  'show', 'showed', 'showing', 'hear', 'heard', 'hearing', 'play', 'played',
  'playing', 'run', 'ran', 'running', 'move', 'moved', 'moving', 'live',
  'lived', 'living', 'believe', 'believed', 'believing', 'bring', 'brought',
  'bringing', 'happen', 'happened', 'happening', 'write', 'wrote', 'writing',
  'provide', 'provided', 'providing', 'sit', 'sat', 'sitting', 'stand', 'stood',
  'standing', 'lose', 'lost', 'losing', 'pay', 'paid', 'paying', 'meet', 'met',
  'meeting', 'include', 'included', 'including', 'continue', 'continued',
  'continuing', 'set', 'setting', 'learn', 'learned', 'learning', 'change',
  'changed', 'changing', 'lead', 'led', 'leading', 'understand', 'understood',
  'understanding', 'watch', 'watched', 'watching', 'follow', 'followed',
  'following', 'stop', 'stopped', 'stopping', 'create', 'created', 'creating',
  'speak', 'spoke', 'speaking', 'read', 'reading', 'allow', 'allowed',
  'allowing', 'add', 'added', 'adding', 'spend', 'spent', 'spending', 'grow',
  'grew', 'growing', 'open', 'opened', 'opening', 'walk', 'walked', 'walking',
  'win', 'won', 'winning', 'offer', 'offered', 'offering', 'remember',
  'remembered', 'remembering', 'love', 'loved', 'loving', 'consider',
  'considered', 'considering', 'appear', 'appeared', 'appearing', 'buy',
  'bought', 'buying', 'wait', 'waited', 'waiting', 'serve', 'served', 'serving',
  'die', 'died', 'dying', 'send', 'sent', 'sending', 'expect', 'expected',
  'expecting', 'build', 'built', 'building', 'stay', 'stayed', 'staying',
  'fall', 'fell', 'falling', 'cut', 'cutting', 'reach', 'reached', 'reaching',
  'kill', 'killed', 'killing', 'remain', 'remained', 'remaining', 'suggest',
  'suggested', 'suggesting', 'raise', 'raised', 'raising', 'pass', 'passed',
  'passing', 'sell', 'sold', 'selling', 'require', 'required', 'requiring',
  'report', 'reported', 'reporting', 'decide', 'decided', 'deciding', 'pull',
  'pulled', 'pulling',
]);

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

function classifyReview(review: Review): ReviewCategory {
  const text = `${review.title ?? ''} ${review.body}`.toLowerCase();
  
  // First check: high-star reviews with positive language are positive
  if (review.rating >= 4) {
    const positiveMatches = countMatches(text, POSITIVE_PATTERNS);
    if (positiveMatches >= 1) return 'positive';
    // High ratings without negative indicators are still likely positive
    const bugMatches = countMatches(text, BUG_PATTERNS);
    const clinicalMatches = countMatches(text, CLINICAL_PATTERNS);
    if (bugMatches === 0 && clinicalMatches === 0) return 'positive';
  }

  // For lower-rated reviews or high-rated with issues mentioned
  const bugMatches = countMatches(text, BUG_PATTERNS);
  const clinicalMatches = countMatches(text, CLINICAL_PATTERNS);
  const featureMatches = countMatches(text, FEATURE_PATTERNS);
  const positiveMatches = countMatches(text, POSITIVE_PATTERNS);

  // Clinical concerns take priority as they're safety-related
  if (clinicalMatches >= 2 && review.rating <= 3) return 'clinical_concern';
  
  // Bug reports
  if (bugMatches >= 2 || (bugMatches >= 1 && review.rating <= 2)) return 'bug';
  
  // Clinical concerns with any signal
  if (clinicalMatches >= 1 && review.rating <= 3) return 'clinical_concern';
  
  // Feature requests
  if (featureMatches >= 2) return 'feature_request';
  
  // Positive reviews
  if (positiveMatches >= 2 || (positiveMatches >= 1 && review.rating >= 4)) return 'positive';
  
  // Default classification based on rating
  if (review.rating >= 4) return 'positive';
  if (review.rating <= 2 && bugMatches >= 1) return 'bug';
  
  return 'other';
}

function extractKeyPhrases(text: string): string[] {
  // Clean and tokenize
  const cleaned = text.toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = cleaned.split(' ').filter(w => 
    w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w)
  );
  
  // Extract bigrams (two-word phrases)
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    if (bigram.length >= 5) {
      bigrams.push(bigram);
    }
  }
  
  // Also include meaningful single words
  const meaningfulSingles = words.filter(w => w.length >= 5);
  
  // Combine and dedupe, prioritizing bigrams
  const phrases = [...new Set([...bigrams, ...meaningfulSingles])];
  
  return phrases.slice(0, 5); // Max 5 phrases per review
}

function deriveSentiment(rating: number): 'negative' | 'neutral' | 'positive' {
  if (rating <= 2) return 'negative';
  if (rating >= 4) return 'positive';
  return 'neutral';
}

export function classifyReviews(reviews: Review[]): ClassifiedReview[] {
  return reviews.map(review => ({
    ...review,
    category: classifyReview(review),
    keyPhrases: extractKeyPhrases(`${review.title ?? ''} ${review.body}`),
    sentiment: deriveSentiment(review.rating),
  }));
}

export async function getClassifiedReviews(): Promise<ClassifiedReview[]> {
  const reviewsFile = await getReviews();
  return classifyReviews(reviewsFile.reviews);
}

/**
 * Bucket reviews into per-day counts (UTC days), zero-filling any days with no
 * reviews so the x-axis of the chart is continuous.
 */
export function getDailyCounts(
  reviews: ReviewsFile["reviews"],
  windowDays: number,
  generatedAt: string,
): DailyCount[] {
  // End day = the UTC day of generatedAt. Start day = windowDays-1 before that.
  const end = parseISO(generatedAt);
  const endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  const startDay = addDays(endDay, -(windowDays - 1));

  const counts = new Map<string, number>();
  for (let d = startDay; d <= endDay; d = addDays(d, 1)) {
    counts.set(format(d, "yyyy-MM-dd"), 0);
  }

  for (const r of reviews) {
    const d = parseISO(r.date);
    const day = format(
      new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())),
      "yyyy-MM-dd",
    );
    if (counts.has(day)) {
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
  }

  return Array.from(counts, ([date, count]) => ({ date, count }));
}

export function daysBetween(a: string, b: string): number {
  return differenceInCalendarDays(parseISO(b), parseISO(a));
}
