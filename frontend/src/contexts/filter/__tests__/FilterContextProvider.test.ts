import { describe, expect, it } from "vitest";

import { getInitialFilterContext } from "../FilterContextProvider";

describe("getInitialFilterContext", () => {
    it("uses date range from URL before data queries are mounted", () => {
        const { filter } = getInitialFilterContext(
            "?dateStart=04-14-2025&dateEnd=04-28-2025"
        );

        expect(filter.dateStart).toEqual(new Date(2025, 3, 14));
        expect(filter.dateEnd).toEqual(new Date(2025, 3, 28));
    });

    it("keeps default date for an invalid URL value", () => {
        const { filter } = getInitialFilterContext("?dateStart=not-a-date");

        expect(Number.isNaN(filter.dateStart.getTime())).toBe(false);
    });
});
