/**
 * Stryker mutation testing configuration.
 *
 * Mutation testing is the strongest available signal that the test suite really
 * asserts behaviour (not just executes lines). It targets the deterministic
 * core logic and breaks the build below a 90% mutation score.
 */
export default {
  packageManager: 'npm',
  testRunner: 'vitest',
  reporters: ['progress', 'clear-text', 'html'],
  coverageAnalysis: 'perTest',
  mutate: [
    'src/core/heap.ts',
    'src/core/geometry.ts',
    'src/core/graph.ts',
    'src/core/crowd.ts',
    'src/core/routing.ts',
    'src/core/steps.ts',
    'src/core/planner.ts',
  ],
  thresholds: { high: 95, low: 90, break: 90 },
  tempDirName: '.stryker-tmp',
  htmlReporter: { fileName: 'reports/mutation/index.html' },
};
