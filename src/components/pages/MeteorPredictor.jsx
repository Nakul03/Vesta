import React, { useEffect, useRef, useState } from "react";
import "./MeteorPredictor.css";

const MeteorPredictor = () => {
  const canvasRef = useRef(null);

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [budget, setBudget] = useState(100);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [notification, setNotification] = useState(null);
  const [screen, setScreen] = useState("start");

  const [threats, setThreats] = useState([]);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId;
    let gameInterval;
    let timeInterval;

    const generateThreat = () => ({
      x: Math.random() * canvas.width,
      y: -10,
      speed: 1 + Math.random() * 2,
      radius: 8 + Math.random() * 10,
      color: "orange",
    });

    const resetGame = () => {
      setScore(0);
      setBudget(100);
      setTimeRemaining(30);
      setLevel(1);
      setThreats([generateThreat()]);
      setParticles([]);
    };

    const drawEarth = () => {
      const x = canvas.width / 2;
      const y = canvas.height - 80;
      ctx.beginPath();
      ctx.arc(x, y, 50, 0, Math.PI * 2);
      ctx.fillStyle = "#2e8b57";
      ctx.fill();
      ctx.strokeStyle = "#00ffcc";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();
    };

    const drawThreats = () => {
      threats.forEach((t) => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        ctx.fillStyle = t.color;
        ctx.fill();
        ctx.closePath();
      });
    };

    const drawParticles = () => {
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.closePath();
      });
    };

    const updateParticles = () => {
      setParticles((prev) =>
        prev
          .map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, radius: p.radius * 0.98 }))
          .filter((p) => p.radius > 0.5)
      );
    };

    const updateThreats = () => {
      setThreats((prev) =>
        prev
          .map((t) => ({ ...t, y: t.y + t.speed }))
          .filter((t) => {
            const earthY = canvas.height - 80;
            if (t.y + t.radius >= earthY) {
              gameOver();
              return false;
            }
            return true;
          })
      );
    };

    const explodeThreat = (threat) => {
      const newParticles = Array.from({ length: 20 }, () => ({
        x: threat.x,
        y: threat.y,
        radius: 2 + Math.random() * 3,
        color: "yellow",
        vx: -2 + Math.random() * 4,
        vy: -2 + Math.random() * 4,
      }));
      setParticles((prev) => [...prev, ...newParticles]);
    };

    const deployMission = (x, y) => {
      if (budget < 10) {
        showNotification("Not enough budget!", "error");
        return;
      }
      setBudget((b) => b - 10);

      setThreats((prev) => {
        const target = prev.find((t) => Math.hypot(t.x - x, t.y - y) < t.radius + 20);
        if (target) {
          explodeThreat(target);
          setScore((s) => s + 10);
          return prev.filter((t) => t !== target);
        }
        return prev;
      });
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawEarth();
      drawThreats();
      drawParticles();
      updateThreats();
      updateParticles();
      animationId = requestAnimationFrame(loop);
    };

    const startGame = () => {
      resetGame();
      setScreen("game");
      showNotification(`Level ${level} - Mission Start`, "info");
      gameInterval = setInterval(() => {
        setThreats((prev) => [...prev, generateThreat()]);
      }, 1500);

      timeInterval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            levelComplete();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);

      loop();
    };

    const levelComplete = () => {
      clearAll();
      setScreen("success");
      showNotification("Level Complete!", "success");
    };

    const nextLevel = () => {
      setLevel((l) => l + 1);
      setBudget((b) => b + 50);
      startGame();
    };

    const gameOver = () => {
      clearAll();
      setScreen("failure");
      showNotification("Earth Destroyed. Mission Failed.", "error");
    };

    const clearAll = () => {
      cancelAnimationFrame(animationId);
      clearInterval(gameInterval);
      clearInterval(timeInterval);
    };

    const showNotification = (message, type) => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3000);
    };

    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      deployMission(x, y);
    });

    if (screen === "game") startGame();

    return () => clearAll();
  }, [screen]);

  return (
    <div className="meteor-container">
      {screen === "start" && (
        <div className="start-screen">
          <h1>Meteor Trajectory Predictor</h1>
          <button onClick={() => setScreen("game")}>Start Mission</button>
        </div>
      )}

      {screen === "game" && (
        <>
          <canvas ref={canvasRef} id="gameCanvas"></canvas>
          <div id="ui">
            <div id="score">Score: {score}</div>
            <div id="level">Level: {level}</div>
            <div id="budget">Budget: ${budget}</div>
            <div id="time">Time: {timeRemaining}s</div>
          </div>
        </>
      )}

      {screen === "success" && (
        <div className="overlay success">
          <h2>Level Complete!</h2>
          <p>Score: {score}</p>
          <button onClick={() => setScreen("game")}>Play Again</button>
          <button onClick={() => setScreen("start")}>Main Menu</button>
        </div>
      )}

      {screen === "failure" && (
        <div className="overlay failure">
          <h2>Mission Failed!</h2>
          <p>Score: {score}</p>
          <button onClick={() => setScreen("start")}>Retry</button>
        </div>
      )}

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default MeteorPredictor;
