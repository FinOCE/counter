export function count(mode: (typeof modes)[number][0], content: string) {
  switch (mode) {
    case "default":
      return /^\d+$/.test(content) ? parseInt(content) : null
    default:
      throw new Error(`Counting mode '${mode}' not found`)
  }
}

export function isMode(mode: string): mode is (typeof modes)[number][0] {
  return modes.includes(mode as any)
}

export const modes = [["default", "Default"]] as const
