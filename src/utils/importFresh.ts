export default function importFresh(id: string) {
    return import(`${id}?requestedTimestamp=${Date.now()}`);
}
