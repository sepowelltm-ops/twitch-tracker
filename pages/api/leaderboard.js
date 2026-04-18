export default async function handler(req, res) {
  const usernames = ["kai_cenat", "xqc", "pokimane"];

  const headers = {
    "Client-ID": process.env.TWITCH_CLIENT_ID,
    "Authorization": `Bearer ${process.env.TWITCH_TOKEN}`,
  };

  // 1️⃣ Get user IDs
  const userRes = await fetch(
    `https://api.twitch.tv/helix/users?${usernames
      .map(u => `login=${u}`)
      .join("&")}`,
    { headers }
  );

  const userData = await userRes.json();

  const users = {};
  userData.data.forEach(u => {
    users[u.login] = {
      id: u.id,
      name: u.display_name,
    };
  });

  // 2️⃣ Get live stream data
  const streamRes = await fetch(
    `https://api.twitch.tv/helix/streams?${usernames
      .map(u => `user_login=${u}`)
      .join("&")}`,
    { headers }
  );

  const streamData = await streamRes.json();

  // 3️⃣ Build result
  const results = await Promise.all(
    usernames.map(async (username) => {
      const user = users[username];
      const stream = streamData.data.find(
        s => s.user_login === username
      );

      const followRes = await fetch(
        `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${user.id}`,
        { headers }
      );

      const followData = await followRes.json();

      return {
        name: user.name,
        isLive: !!stream,
        viewers: stream?.viewer_count || 0,
        started_at: stream?.started_at || null,
        followers: followData.total || 0,
      };
    })
  );

  // ✅ SORT FIRST
  const sorted = results.sort((a, b) => {
    if (a.isLive && !b.isLive) return -1;
    if (!a.isLive && b.isLive) return 1;

    return b.viewers - a.viewers;
  });

  // ✅ THEN RETURN
  return res.status(200).json(sorted);
}
