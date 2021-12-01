import fetch from "node-fetch";
import { TwitterResponse } from "src/typings/twresponse";

const BASE =
    "https://api.twitter.com/2/tweets/search/recent?query=from%3ARONBupdates&max_results=10&tweet.fields=created_at&expansions=author_id,attachments.media_keys&media.fields=media_key,url,type&user.fields=profile_image_url";

export async function getLatestPost() {
    try {
        const res = (await fetch(BASE, {
            headers: {
                Authorization: `Bearer ${process.env.TWITTER_API_KEY}`
            }
        })
            .then((res) => (!res.ok ? null : res.json()))
            .catch(() => null)) as TwitterResponse | null;
        if (!res || !res.data?.length) return null;

        const latest = res.data[0];

        return {
            createdAt: new Date(latest.created_at),
            id: latest.id,
            content: latest.text,
            url: `https://twitter.com/RONBupdates/status/${latest.id}`,
            image: !latest.attachments?.media_keys?.length
                ? null
                : res.includes.media.find((x) => x.media_key === latest.attachments?.media_keys[0] && x.type === "photo")?.url || null
        };
    } catch {
        return null;
    }
}
