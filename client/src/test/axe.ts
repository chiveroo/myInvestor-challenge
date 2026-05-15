import axe from 'axe-core'

type AxeContext = Element | Document | ShadowRoot

const defaultRules: axe.RunOptions['rules'] = {
  'color-contrast': { enabled: false },
}

function formatViolations(violations: axe.Result[]): string {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `  - ${node.target.join(' ')}: ${node.failureSummary ?? 'No summary available'}`)
        .join('\n')

      return `${violation.id} (${violation.impact ?? 'unknown'})\n${violation.help}\n${nodes}`
    })
    .join('\n\n')
}

export async function expectNoA11yViolations(context: AxeContext): Promise<void> {
  const results = await axe.run(context, {
    rules: defaultRules,
  })

  if (results.violations.length > 0) {
    throw new Error(`axe found ${results.violations.length} accessibility violation(s):\n${formatViolations(results.violations)}`)
  }
}
