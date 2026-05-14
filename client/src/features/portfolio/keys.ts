export const portfolioKeys = {
  all: ['portfolio'] as const,
  lists: () => [...portfolioKeys.all, 'list'] as const,
  list: () => [...portfolioKeys.lists()] as const,
}
