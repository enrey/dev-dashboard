export function getName(names: string[]) {
    return names.reduce((acc, el) => (el.length > acc.length ? el : acc));
}
