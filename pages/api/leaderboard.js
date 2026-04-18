export default async function handler(req, res) {
  const usernames = [
    "kaicenat","ibai","ninja","auronplay","rubius","thegrefg","xqc",
    "juansguarnizo","tfue","shroud","elmariana","elspreen","jynxzi",
    "pokimane","sodapoppin","clix","caseoh_","alanzoka","timthetatman",
    "riotgames","myth","tommyinnit","sypherpk","mongraal","arigameplays",
    "adinross","rivers_gg","nickmercs","quackity","summit1g","amouranth",
    "dream","nickeh30","squeezie","moistcr1tikal","bugha","loltyler1",
    "tubbo","georgenotfound","elded","robleis"
  ];

  const headers = {
    "Client-ID": process.env.TWITCH_CLIENT_ID,
    "Authorization": `Bearer ${process.env.TWITCH_TOKEN}`,
  };

  try {
    const userRes = await fetch(
      `https://api.twitch.tv/helix/users?${usernames.map(u => `login=${u}`).join("&")}`,
      { headers }
    );
    const userData = await userRes.json();

    const users = {};
    userData.data.forEach(u => users[u.login] = { id: u.id, name: u.display_name });

    const streamRes = await fetch(
      `https://api.twitch.tv/helix/streams?${usernames.map(u => `user_login=${u}`).join("&")}`,
      { headers }
    );
    const streamData = await streamRes.json();

    const streamMap = {};
    streamData.data.forEach(s => streamMap[s.user_login] = s);

    const results = await Promise.all(
      usernames.map(async (u) => {
        const user = users[u];
        if (!user) return null;

        const followRes = await fetch(
          `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${user.id}`,
          { headers }
        );
        const followData = await followRes.json();

        return {
          name: user.name,
          followers: Number(followData.total || 0),
        };
      })
    );

    const sorted = results
      .filter(Boolean)
      .sort((a, b) => b.followers - a.followers)
      .slice(0, 100);

    return res.status(200).json(sorted);

  } catch (e) {
    return res.status(500).json({ error: "Leaderboard failed" });
  }
}
