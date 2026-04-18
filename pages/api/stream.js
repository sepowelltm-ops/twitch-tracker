export default async function handler(req, res) {
  const { user } = req.query;

  if (!user) {
    return res.status(400).json({ error: "Missing username" });
  }

  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${user}`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${process.env.TWITCH_TOKEN}`,
        },
      }
    );

    const data = await response.json();

    // If stream is offline
    if (!data.data || data.data.length === 0) {
      return res.status(200).json({
        live: false,
        viewers: 0,
      });
    }

    // If stream is live
    const stream = data.data[0];

    return res.status(200).json({
      live: true,
      viewers: stream.viewer_count,
    });

  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
