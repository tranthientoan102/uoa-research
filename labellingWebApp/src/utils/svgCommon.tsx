

export const positionTranslate = (before: number[], trans: number[]) => {
    return before.map((d, i) => d - trans[i])
}