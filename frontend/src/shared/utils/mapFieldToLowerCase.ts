export function mapFieldToLowerCase<T>(arr: T[], key: keyof T): T[] {
    return arr.map((item) => {
        const val = item[key] as unknown as string;

        if (item[key] && typeof item[key] === "string") {
            // @ts-expect-error - Need to cast to string to ensure lowercase conversion
            item[key] = val.toLowerCase();
        }

        return item;
    });
}
