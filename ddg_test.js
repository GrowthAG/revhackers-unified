async function duckDuckGoSearch(query) {
    try {
        const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const html = await response.text();
        const snippetRegex = /<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/g;
        let match;
        const snippets = [];
        while ((match = snippetRegex.exec(html)) !== null && snippets.length < 5) {
            snippets.push(match[1].replace(/<\/?[^>]+(>|$)/g, "").trim());
        }
        return snippets.join('\n');
    } catch (e) {
        return '';
    }
}
duckDuckGoSearch("Pricing RD Station Marketing Brasil").then(console.log);
