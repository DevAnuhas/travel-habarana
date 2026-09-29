const OBJECT_ID = /^[a-f\d]{24}$/i

/** Prefill only a current package; stale or malformed ids from old links become "". */
export function resolveInitialPackageId(
  raw: string | string[] | undefined,
  packages: ReadonlyArray<{ _id: string }>
): string {
  if (typeof raw !== "string" || !OBJECT_ID.test(raw)) return ""
  return packages.some((pkg) => pkg._id === raw) ? raw : ""
}
