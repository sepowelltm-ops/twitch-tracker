export default async function handler(req, res) {
  const { user } = req.query;

  if (!user) {
    return res.status(400).json({ error: "Missing username" });
  }

  try {
    // Step 1: Get user info (to get user ID)
    const userResponse = await fetch(
      `https://api.twitch.tv/helix/users?login=${user}`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${process.env.TWITCH_TOKEN}`,
        },
      }
    );

    const userData = await userResponse.json();

    if (!userData.data || userData.data.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userData.data[0].id;

    // Step 2: Get follower count
    const followResponse = await fetch(
      `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${userId}`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${process.env.TWITCH_TOKEN}`,
        },
      }
    );

    const followData = await followResponse.json();

    return res.status(200).json({
      followers: followData.total || 0,
    });

  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
