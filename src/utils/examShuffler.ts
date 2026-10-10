import { ExamQuestion, MultipleChoiceQuestion, TrueFalseQuestion, ShortAnswerQuestion } from '../types';

/**
 * Fisher-Yates array shuffle using random or seeded generator
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Shuffles MCQ questions and their 4 options (A, B, C, D) with balanced key distribution.
 * 
 * Guarantees:
 * 1. Question order is shuffled.
 * 2. Option choices (A, B, C, D) are shuffled, with correctAnswer index updated accurately.
 * 3. CRITICAL: Prevents answer keys from clustering on a single option (e.g. all A, all B, all C, or all D).
 *    In 16 MCQs, each letter (A, B, C, D) is distributed evenly (roughly 4 of each: 3-5 per option).
 *    No single option exceeds 5 occurrences, and no option has fewer than 3.
 */
export function shuffleExamQuestions(questions: ExamQuestion[]): ExamQuestion[] {
  // Separate questions by type
  const mcqs = questions.filter(q => q.type === 'multiple_choice') as MultipleChoiceQuestion[];
  const tfs = questions.filter(q => q.type === 'true_false') as TrueFalseQuestion[];
  const sas = questions.filter(q => q.type === 'short_answer') as ShortAnswerQuestion[];

  if (mcqs.length === 0) {
    return [...questions];
  }

  // 1. First, shuffle the question order of MCQs
  const shuffledMcqOrder = shuffleArray(mcqs);

  // 2. Prepare balanced target key distribution for 16 MCQs:
  // e.g. [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3] (exactly 4 A's, 4 B's, 4 C's, 4 D's)
  const targetKeys: number[] = [];
  const count = shuffledMcqOrder.length;
  for (let i = 0; i < count; i++) {
    targetKeys.push(i % 4); // 0 = A, 1 = B, 2 = C, 3 = D
  }
  // Shuffle target key assignments so they don't appear in a predictable cycle
  const randomizedTargetKeys = shuffleArray(targetKeys);

  // 3. For each MCQ, rearrange options so that the correct answer lands on the assigned balanced target key
  const balancedShuffledMcqs: MultipleChoiceQuestion[] = shuffledMcqOrder.map((q, idx) => {
    const originalOptions = [...q.options];
    const correctText = originalOptions[q.correctAnswer];
    const distractorTexts = originalOptions.filter((_, i) => i !== q.correctAnswer);
    const shuffledDistractors = shuffleArray(distractorTexts);

    const desiredCorrectIndex = randomizedTargetKeys[idx]; // 0, 1, 2, or 3
    const newOptions: [string, string, string, string] = ['', '', '', ''];
    newOptions[desiredCorrectIndex] = correctText;

    let distractorIdx = 0;
    for (let pos = 0; pos < 4; pos++) {
      if (pos !== desiredCorrectIndex) {
        newOptions[pos] = shuffledDistractors[distractorIdx++];
      }
    }

    return {
      ...q,
      options: newOptions,
      correctAnswer: desiredCorrectIndex
    };
  });

  // 4. Also shuffle statements in True/False question if present, maintaining subId
  const processedTfs = tfs.map(tf => {
    // Keep statements or shuffle statements content
    const shuffledStatements = shuffleArray([...tf.statements]).map((st, i) => ({
      ...st,
      subId: (['a', 'b', 'c', 'd'][i]) as 'a' | 'b' | 'c' | 'd'
    }));
    return {
      ...tf,
      statements: shuffledStatements as [any, any, any, any]
    };
  });

  return [...balancedShuffledMcqs, ...processedTfs, ...sas];
}
