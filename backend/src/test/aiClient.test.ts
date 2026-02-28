/**
 * Tests for AIServiceClient stub responses.
 *
 * Verifies that the fallback stubs return shapes that match the live AI
 * service Pydantic schemas (AITriageResponse / AIFollowupResponse).
 *
 * Run with: tsx src/test/aiClient.test.ts
 */

import { AIServiceClient } from '../services/aiClient.js';

console.log('Testing AIServiceClient stub responses...\n');

// Force stub mode without making an HTTP call
const client = new AIServiceClient();
(client as unknown as Record<string, unknown>).useStubs = true;

// ── startIntake stub ─────────────────────────────────────────────────────────

console.log('Test 1: startIntake stub returns string[] for clarifyingQuestions');
try {
  const result = await client.startIntake('I need help with my I-20 renewal');
  const isStringArray =
    Array.isArray(result.clarifyingQuestions) &&
    result.clarifyingQuestions.every(q => typeof q === 'string');
  if (isStringArray) {
    console.log('  [PASS] clarifyingQuestions is string[]');
  } else {
    console.log('  [FAIL] clarifyingQuestions is not string[]:', result.clarifyingQuestions);
  }
} catch (error) {
  console.log('  [FAIL] startIntake threw:', error);
}

console.log('\nTest 2: startIntake stub returns suggestedArticleIds (not suggestedArticles)');
try {
  const result = await client.startIntake('Cannot log into my email');
  const hasIds = 'suggestedArticleIds' in result && Array.isArray(result.suggestedArticleIds);
  const hasOldField = 'suggestedArticles' in result;
  if (hasIds && !hasOldField) {
    console.log('  [PASS] Response has suggestedArticleIds, not suggestedArticles');
  } else if (!hasIds) {
    console.log('  [FAIL] Missing suggestedArticleIds field');
  } else {
    console.log('  [FAIL] Old suggestedArticles field is still present');
  }
} catch (error) {
  console.log('  [FAIL] startIntake threw:', error);
}

console.log('\nTest 3: startIntake stub categorises I-20 keyword as International Affairs');
try {
  const result = await client.startIntake('I need my I-20 updated for visa renewal');
  if (result.category === 'International Affairs') {
    console.log('  [PASS] Correctly categorised as International Affairs');
  } else {
    console.log('  [FAIL] Expected International Affairs, got:', result.category);
  }
} catch (error) {
  console.log('  [FAIL] startIntake threw:', error);
}

console.log('\nTest 4: startIntake stub categorises Canvas keyword as Learning Technologies');
try {
  const result = await client.startIntake('I cannot submit my Canvas assignment');
  if (result.category === 'Learning Technologies') {
    console.log('  [PASS] Correctly categorised as Learning Technologies');
  } else {
    console.log('  [FAIL] Expected Learning Technologies, got:', result.category);
  }
} catch (error) {
  console.log('  [FAIL] startIntake threw:', error);
}

console.log('\nTest 5: startIntake stub response has required fields');
try {
  const result = await client.startIntake('I have a general question about tuition fees');
  const hasAllFields =
    typeof result.category === 'string' &&
    typeof result.service === 'string' &&
    Array.isArray(result.clarifyingQuestions) &&
    Array.isArray(result.suggestedArticleIds) &&
    typeof result.ticketDraft?.summary === 'string' &&
    typeof result.ticketDraft?.description === 'string' &&
    typeof result.ticketDraft?.priority === 'string' &&
    typeof result.confidence === 'number' &&
    (result.handoffRecommendation === 'ARTICLE_FIRST' || result.handoffRecommendation === 'CREATE_TICKET');
  if (hasAllFields) {
    console.log('  [PASS] All required fields present with correct types');
  } else {
    console.log('  [FAIL] Missing or wrong-type fields in:', JSON.stringify(result, null, 2));
  }
} catch (error) {
  console.log('  [FAIL] startIntake threw:', error);
}

// ── followupIntake stub ──────────────────────────────────────────────────────

const sampleTriageResult = await client.startIntake('I need my I-20 renewed urgently');

console.log('\nTest 6: followupIntake stub returns category and service at top level');
try {
  const result = await client.followupIntake(sampleTriageResult, ['My I-20 expires next week']);
  const hasTopLevel =
    typeof result.category === 'string' && typeof result.service === 'string';
  if (hasTopLevel) {
    console.log('  [PASS] category and service present at top level');
  } else {
    console.log('  [FAIL] Missing category or service at top level:', result);
  }
} catch (error) {
  console.log('  [FAIL] followupIntake threw:', error);
}

console.log('\nTest 7: followupIntake stub preserves category from triage result');
try {
  const result = await client.followupIntake(sampleTriageResult, ['In two weeks']);
  if (result.category === sampleTriageResult.category) {
    console.log('  [PASS] Preserves original category:', result.category);
  } else {
    console.log(
      '  [FAIL] Category mismatch — triage:',
      sampleTriageResult.category,
      'followup:',
      result.category,
    );
  }
} catch (error) {
  console.log('  [FAIL] followupIntake threw:', error);
}

console.log('\nTest 8: followupIntake stub incorporates answers into description');
try {
  const result = await client.followupIntake(sampleTriageResult, ['Expires 2026-03-10']);
  if (result.ticketDraft.description.includes('Expires 2026-03-10')) {
    console.log('  [PASS] Answer text appears in ticket description');
  } else {
    console.log('  [FAIL] Answer not found in description:', result.ticketDraft.description);
  }
} catch (error) {
  console.log('  [FAIL] followupIntake threw:', error);
}

console.log('\nTest 9: followupIntake stub does NOT include updatedCategory or updatedPriority');
try {
  const result = await client.followupIntake(sampleTriageResult, ['Some answer']) as unknown as Record<string, unknown>;
  const hasOldFields = 'updatedCategory' in result || 'updatedPriority' in result;
  if (!hasOldFields) {
    console.log('  [PASS] Old updatedCategory/updatedPriority fields absent');
  } else {
    console.log('  [FAIL] Old fields still present in response');
  }
} catch (error) {
  console.log('  [FAIL] followupIntake threw:', error);
}

console.log('\nTest 10: followupIntake stub has confidence field');
try {
  const result = await client.followupIntake(sampleTriageResult, ['My answer']);
  if (typeof result.confidence === 'number') {
    console.log('  [PASS] confidence is a number:', result.confidence);
  } else {
    console.log('  [FAIL] confidence missing or wrong type');
  }
} catch (error) {
  console.log('  [FAIL] followupIntake threw:', error);
}

console.log('\nAll AIServiceClient stub tests completed!\n');
