export interface FirstLetter {
    firstLetter: string;
}

export function addFirstLetter<P, T>(items: P[], field: keyof P): (P & FirstLetter)[] {
    return items.map((item) => {
        const name = item[field];
        let firstLetter: string = "0";

        if (typeof name === "string") {
            firstLetter = /[0-9]/.test(name[0].toUpperCase())
                ? "0-9"
                : name[0].toUpperCase();
        }

        return {
            ...item,
            firstLetter,
        };
    });
}
