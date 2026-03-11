const apiKey = Deno.env.get("NOTION_API_KEY");
const dbId = "2f6bdc72e039816284db000c0eb56dd7"; // Clientes ID
const resp = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Notion-Version": "2022-06-28"
  }
});
const data = await resp.json();
console.log(JSON.stringify(data.properties, null, 2));
