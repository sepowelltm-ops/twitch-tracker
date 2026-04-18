import { useState, useEffect } from "react";

export default function Home() {
  console.log("🔥 PAGE LOADED");

  const [username, setUsername] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  // 🏆 Load leaderboard
  const loadLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();

      console.log("RAW LEADERBOARD:", data);

      setLeaderboard(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔄 Run once on page load
  useEffect(() => {
    loadLeaderboard();
  }, []);

  // 🔍 Single user check
  const checkTwitch = async () => {
    if (!username) return;

    setLoading(true);
    setData(null);

    try {
      const streamRes = await fetch(`/api/stream?user=${username}`);
      const streamData = await streamRes.json();

      const userRes = await fetch(`/api/user?user=${username}`);
      const userData = await userRes.json();

      setData({
        ...streamData,
        ...userData,
      });
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>🎮 Twitch Tracker</h1>

      {/* INPUT */}
      <div>
        <input
          type="text"
          placeholder="Enter Twitch username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <button onClick={checkTwitch}>
          Check
        </button>
      </div>

      {/* SINGLE USER CARD */}
      {loading && <p>Loading...</p>}

      {data && (
        <div className="card">
          <h2>{username}</h2>

          <p>
            Status: {data.live ? "🟢 Live" : "🔴 Offline"}
          </p>

          <p>Followers: {data.followers ?? "N/A"}</p>

          {data.live && <p>Viewers: {data.viewers}</p>}
        </div>
      )}

      {/* 🏆 LEADERBOARD (ALWAYS VISIBLE) */}
      <h2>🏆 Leaderboard</h2>

      {leaderboard.length > 0 ? (
        leaderboard.map((user, i) => (
          <div key={i} className="card">
            <h3>
              {i + 1}. {user.name}
            </h3>

            <p>
              Status: {user.isLive ? "🟢 Live" : "🔴 Offline"}
            </p>

            <p>Viewers: {user.viewers}</p>

            <p>Followers: {user.followers}</p>

            {user.started_at && (
              <p>
                Started:{" "}
                {new Date(user.started_at).toLocaleTimeString()}
              </p>
            )}
          </div>
        ))
      ) : (
        <p>Loading leaderboard...</p>
      )}
    </div>
  );
}
