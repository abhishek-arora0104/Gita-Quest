/**
 * Tiny className combiner — joins truthy values with a space.
 * Avoids pulling in clsx/tailwind-merge for a project this size.
 */
export function cn(
  ...inputs: Array<string | false | null | undefined>
): string {
  return inputs.filter(Boolean).join(" ");
}
