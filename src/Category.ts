/**
 * Type of category tags.
 */
export type CategoryTag = string | symbol;
/** dts2md break */
/**
 * Type of category records.
 */
export type CategoryRecord = [CategoryTag, number];
/** dts2md break */
/**
 * Type of `Category` namespace.
 */
export interface CategoryNamespace {
    /**
     * Max count of categories. (32)
     */
    readonly MAX_COUNT: number;
    /**
     * Full category mask. (0xFFFF_FFFF)
     */
    readonly FULL_MASK: number;
    /**
     * Category registry.
     * (Used by `Category.for` & `Category.tagFor`.)
     */
    registry: CategoryRecord[];
    /**
     * Current count of categories.
     */
    count: number;
    /**
     * Get next category.
     */
    readonly next: () => number;
    /**
     * Get a tagged category.
     */
    readonly for: (tag: CategoryTag) => number;
    /**
     * Get the tag of specific category.
     */
    readonly tagFor: (category: number) => CategoryTag | undefined;
}
/** dts2md break */
/**
 * Category-related APIs.
 */
export const Category: CategoryNamespace = {

    MAX_COUNT: 32,
    FULL_MASK: 0xFFFF_FFFF,
    registry: [],
    count: 0,

    next() {
        if (Category.count > Category.MAX_COUNT) {
            throw "Max category count exceeded";
        }
        return 1 << Category.count++;
    },

    for(tag) {
        const record = Category.registry.find(record => record[0] === tag);
        if (!record) {
            const category = Category.next();
            Category.registry.push([tag, category]);
            return category;
        } else {
            return record[1];
        }
    },

    tagFor(category) {
        const result = Category.registry.find(record => record[1] === category);
        return result && result[0];
    },

};
