export default async function handler(req, res) {
const usernames = [
  "kaicenat",
  "ibai",
  "ninja",
  "auronplay",
  "rubius",
  "easyliker",
  "thegrefg",
  "xqc",
  "juansguarnizo",
  "tfue",
  "shroud",
  "elmariana",
  "elspreen",
  "jynxzi",
  "pokimane",
  "sodapoppin",
  "clix",
  "caseoh_",
  "alanzoka",
  "timthetatman",
  "heelmike",
  "riotgames",
  "myth",
  "tommyinnit",
  "sypherpk",
  "mongraal",
  "arigameplays",
  "adinross",
  "rivers_gg",
  "nickmercs",
  "eslcs",
  "quackity",
  "summit1g",
  "fortnite",
  "amouranth",
  "dream",
  "robleis",
  "nickeh30",
  "squeezie",
  "moistcr1tikal",
  "montanablack88",
  "elded",
  "bugha",
  "loltyler1",
  "tubbo",
  "carreraaa",
  "georgenotfound",
  "slakun10",
  "elraenn"
];
    
    // 👉 keep adding up to 100 usernames here
  ];

  const headers = {
    "Client-ID": process.env.TWITCH_CLIENT_ID,
    "Authorization": `Bearer ${process.env.TWITCH_TOKEN}`,
  };

  try {
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

    // 2️⃣ Build results (followers only)
    const results = await Promise.all(
      usernames.map(async (username) => {
        const user = users[username];
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

    // 3️⃣ Remove nulls + SORT (highest → lowest)
    const sorted = results
      .filter(Boolean)
      .sort((a, b) => b.followers - a.followers)
      .slice(0, 100);

    // 4️⃣ return leaderboard
    return res.status(200).json(sorted);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Leaderboard failed" });
  }
}
