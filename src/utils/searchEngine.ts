import Fuse from "fuse.js";

export default function SearchEngine<T = unknown>(data: T[], query: string, factors?: string[]) {
    const fuse = new Fuse(data, {
        shouldSort: true,
        threshold: 0.5,
        location: 0,
        distance: 80,
        minMatchCharLength: 1,
        keys: factors || Object.keys(data)
    });

    const result = fuse.search(query);

    return result.map((m) => m.item);
}
