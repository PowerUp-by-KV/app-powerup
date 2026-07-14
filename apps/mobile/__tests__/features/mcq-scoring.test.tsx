import { scoreMcqActivity } from "@/features/learning-journey/components/McqActivity";

/**
 * Regression guard for the >100% activity score.
 *
 * The correct-answer count used to increment once per *submit* rather than per *question*.
 * Dismissing the result sheet cleared `lastResult`, which re-enabled the options without
 * clearing the selection or rolling the count back — so re-answering a question counted it
 * twice. A 3-question activity could report "You answered 4 of 3 questions correctly."
 * (133%), and that score was POSTed to the server as the real one.
 *
 * Keying correctness by question index is what makes the tally idempotent.
 */
describe("scoreMcqActivity", () => {
  it("cannot exceed 100% when a question is answered more than once", () => {
    // Re-answering question 0 overwrites its entry rather than adding to a running total.
    const afterReanswering = { 0: true, 1: true, 2: true };

    expect(scoreMcqActivity(afterReanswering, 3)).toEqual({
      score: 100,
      passed: true,
      totalCorrect: 3,
    });
  });

  it("never reports more correct answers than there are questions", () => {
    // Even if the map is somehow over-populated, the count is clamped to the question count.
    const overCounted = { 0: true, 1: true, 2: true, 3: true };

    const result = scoreMcqActivity(overCounted, 3);

    expect(result.totalCorrect).toBe(3);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("scores a partially correct run", () => {
    expect(scoreMcqActivity({ 0: true, 1: false, 2: true }, 3)).toEqual({
      score: 67,
      passed: false, // 67% is under the 70% pass bar
      totalCorrect: 2,
    });
  });

  it("passes at the 70% threshold", () => {
    const result = scoreMcqActivity({ 0: true, 1: true, 2: true, 3: false }, 4);

    expect(result.score).toBe(75);
    expect(result.passed).toBe(true);
  });

  it("scores an all-wrong run as zero rather than NaN", () => {
    expect(scoreMcqActivity({ 0: false, 1: false }, 2)).toEqual({
      score: 0,
      passed: false,
      totalCorrect: 0,
    });
  });

  it("does not divide by zero when there are no questions", () => {
    expect(scoreMcqActivity({}, 0)).toEqual({ score: 0, passed: false, totalCorrect: 0 });
  });
});
