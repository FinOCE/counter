export function count(mode: (typeof modes)[number][0], content: string) {
  switch (mode) {
    case "default":
      return /^\d+$/.test(content) ? parseInt(content) : null
    default:
      throw new Error(`Counting mode '${mode}' not found`)
  }
}

export function isMode(mode: string): mode is (typeof modes)[number][0] {
  return modes.some(m => m[0] === mode)
}

export const modes = [["default", "Default"]] as const
