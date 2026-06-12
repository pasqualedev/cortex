export const QueryKeys = {
  dashboard: ['dashboard'] as const,
  brainCurrent: ['brain', 'current'] as const,
  brainHistory: (days: number) => ['brain', 'history', days] as const,
  achievements: ['achievements'] as const,
  userMe: ['user', 'me'] as const,
  challengeNext: ['challenge', 'next'] as const,
} as const
