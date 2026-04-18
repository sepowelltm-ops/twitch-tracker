import { useState, useEffect } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const loadLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const checkTwitch = async () => {
    if (!username) return;

    setLoading(true);
    setData(null);

    try {
      const streamRes = await fetch(`/api/stream?user=${username}`);
      const streamData = await streamRes.json();

      const userRes = await fetch(`/api/user?user=${username}`);
      const userData = await userRes.json();

      setData({ ...streamData, ...userData });
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="page">

      <h1 className="title">🎮 Twitch Tracker</h1>

      <div className="searchBox">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter Twitch username"
        />

        <button onClick={checkTwitch}>Check</button>
      </div>

      <button
        className="toggleBtn"
        onClick={() => setShowLeaderboard(!showLeaderboard)}
      >
        {showLeaderboard ? "Hide Leaderboard" : "Show Leaderboard 🏆"}
      </button>

      {loading && <p>Loading...</p>}

      {data && (
        <div className="card">
          <h2>{username}</h2>
          <p>{data.live ? "🟢 Live" : "🔴 Offline"}</p>
          <p>Followers: {data.followers ?? "N/A"}</p>
          {data.live && <p>Viewers: {data.viewers}</p>}
        </div>
      )}

      {showLeaderboard && (
        <div className="leaderboard">
          <h2>🏆 Leaderboard</h2>

          {leaderboard.map((user, i) => (
            <div key={i} className="card">
              <h3>#{i + 1} {user.name}</h3>

              <p className={user.isLive ? "live" : "offline"}>
                {user.isLive ? "🟢 Live" : "🔴 Offline"}
              </p>

              <p>👀 {user.viewers}</p>
              <p>⭐ {user.followers.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
