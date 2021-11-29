export default function parseJSON<T = unknown>(data: string): T | null {
    if (!data) return null;
    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
}
