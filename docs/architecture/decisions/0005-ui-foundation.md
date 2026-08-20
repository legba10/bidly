# ADR-0005: Bidly-owned UI foundation

- Status: accepted
- Date: 2026-08-20

## Context

Bidly needs a coherent consumer identity and accessible interaction behavior. A pre-themed dashboard kit would create visual sameness and coupling; implementing every complex primitive from scratch would create accessibility risk.

## Decision

Own semantic tokens and the `tokens/primitives/components/patterns/icons` source layers in `packages/ui`. Use native HTML first. Tailwind 4 is a build-time utility engine. For a future complex primitive, review shadcn source and Radix/Base UI behavior per component, copy/install only what is justified, restyle completely, and record the dependency/source.

No shadcn/Radix/Base UI package is installed now: the bootstrap primitives do not need it. Storybook, axe, component tests, Russian content stress, and responsive/manual checks are part of the contract.

## Consequences

- Bidly bears maintenance for copied source and token compatibility.
- Visual changes remain centralized and vendor-neutral.
- Accessibility still requires manual review; a primitive library or axe cannot guarantee conformance.

References: [shadcn/ui model](https://ui.shadcn.com/docs), [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction), [Base UI](https://base-ui.com/react/overview/about), [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
