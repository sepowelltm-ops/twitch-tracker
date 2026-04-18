export default function Home() {
  console.log("🔥 THIS FILE IS RUNNING");
  
import { useState, useEffect } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [leaderboard, setLeaderboard] = useState([]);

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

  console.log("leaderboard:", leaderboard);
  
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

      {loading && <p>Loading...</p>}

      {data && (
        <div className="card">
          <h2>{username}</h2>

          <p>
            Status:{" "}
            {data.live ? "🟢 Live" : "🔴 Offline"}
          </p>

          <p>Followers: {data.followers ?? "N/A"}</p>

          {data.live && (
            <p>Viewers: {data.viewers}</p>
          )}
       
         <h2>🏆 Leaderboard</h2>

        {leaderboard.map((user, i) => (
          <div key={i} className="card">
            <h3>{i + 1}. {user.name}</h3>
            <p>Status: {user.isLive ? "🟢 Live" : "🔴 Offline"}</p>
            <p>Viewers: {user.viewers}</p>
            <p>Followers: {user.followers}</p>

            {user.started_at && (
              <p>
                Started: {new Date(user.started_at).toLocaleTimeString()}
              </p>
            )}
          </div>
        ))}
       
  </div>
);
