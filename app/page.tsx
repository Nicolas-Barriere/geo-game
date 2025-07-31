'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { villes } from '../data/villes';
import { haversineDistance } from '../utils/geo';
import 'leaflet/dist/leaflet.css';


// Import dynamique du composant Map complet
const DynamicMap = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => <div style={{ 
    height: '400px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#f9fafb',
    color: '#6b7280'
  }}>
    Chargement de la carte...
  </div>
});



type Player = { name: string; score: number };

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [setup, setSetup] = useState(true);
  const [playerInputs, setPlayerInputs] = useState<string[]>(["", "", "", "", ""]);
  const [numPlayers, setNumPlayers] = useState(2);
  const [numRounds, setNumRounds] = useState(5); // nombre de tours sélectionné
  const [currentRound, setCurrentRound] = useState(1); // round actuel (1-based)
  const [difficulty, setDifficulty] = useState<'simple' | 'medium' | 'hard'>('simple');
  const [ville, setVille] = useState(villes['simple'][0]);
  const [clickPosition, setClickPosition] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [lastScore, setLastScore] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    // Sélectionne une ville aléatoire dans la catégorie de difficulté
    const villesCat = villes[difficulty];
    setVille(villesCat[Math.floor(Math.random() * villesCat.length)]);
    // Vérification de la taille d'écran
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [difficulty]);

  const startGame = () => {
    const enteredPlayers = playerInputs.slice(0, numPlayers).map(name => ({ name: name.trim() || "Joueur", score: 0 }));
    setPlayers(enteredPlayers);
    setCurrentPlayerIdx(0);
    setCurrentRound(1);
    setSetup(false);
    setShowResult(false);
    setClickPosition(null);
    setDistance(null);
    setLastScore(0);
    setMessage("");
    setGameOver(false);
    // Sélectionne une ville aléatoire dans la catégorie de difficulté
    const villesCat = villes[difficulty];
    setVille(villesCat[Math.floor(Math.random() * villesCat.length)]);
  };

  const nextCity = () => {
    // Si dernier tour et dernier joueur, fin de partie
    if (currentPlayerIdx === players.length - 1 && currentRound === numRounds) {
      setGameOver(true);
      setShowResult(false);
      return;
    }
    setShowResult(false);
    setClickPosition(null);
    setDistance(null);
    setLastScore(0);
    setMessage("");
    // Sélectionne une ville aléatoire dans la catégorie de difficulté
    const villesCat = villes[difficulty];
    setVille(villesCat[Math.floor(Math.random() * villesCat.length)]);
    if (players.length > 0) {
      if (currentPlayerIdx === players.length - 1) {
        setCurrentPlayerIdx(0);
        setCurrentRound((r) => r + 1);
      } else {
        setCurrentPlayerIdx((prev) => prev + 1);
      }
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (showResult) return;
    const dist = haversineDistance(lat, lng, ville.lat, ville.lon);
    let pts = 0;
    let msg = "";
    if (dist > 200) {
      pts = 0;
      msg = "❌ Trop loin ! 0 point.";
    } else if (dist > 100) {
      pts = 1;
      msg = "😅 Plus de 100 km : 1 point.";
    } else if (dist > 50) {
      pts = 2;
      msg = "👌 Plus de 50 km : 2 points.";
    } else {
      pts = 3;
      msg = "🎯 Moins de 50 km : 3 points !";
    }
    setClickPosition([lat, lng]);
    setDistance(dist);
    setLastScore(pts);
    setMessage(msg);
    setShowResult(true);
    // Ajout des points au joueur courant
    setPlayers(prev => prev.map((p, idx) => idx === currentPlayerIdx ? { ...p, score: p.score + pts } : p));
  };

  if (setup) {
    return (
      <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px #0001', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: '#2563eb', textAlign: 'center', marginBottom: 24 }}>Jeu de Géographie 🇫🇷</h1>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 8 }}>Nombre de joueurs :</label>
        <select value={numPlayers} onChange={e => setNumPlayers(Number(e.target.value))} style={{ width: '100%', padding: 8, marginBottom: 16 }}>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 8 }}>Nombre de tours par joueur :</label>
        <select value={numRounds} onChange={e => setNumRounds(Number(e.target.value))} style={{ width: '100%', padding: 8, marginBottom: 16 }}>
          {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 8 }}>Difficulté :</label>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value as 'simple' | 'medium' | 'hard')} style={{ width: '100%', padding: 8, marginBottom: 16 }}>
          <option value="simple">Simple</option>
          <option value="medium">Moyen</option>
          <option value="hard">Difficile</option>
        </select>
        {[...Array(numPlayers)].map((_, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Prénom du joueur ${i+1}`}
            value={playerInputs[i]}
            onChange={e => setPlayerInputs(inputs => { const arr = [...inputs]; arr[i] = e.target.value; return arr; })}
            style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #ddd' }}
          />
        ))}
        <button onClick={startGame} style={{ width: '100%', padding: 12, background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', fontSize: 18, marginTop: 8, cursor: 'pointer' }}>Démarrer la partie</button>
      </div>
    );
  }

  const currentPlayer = players[currentPlayerIdx];

  if (gameOver) {
    // Affichage de fin de partie
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    return (
      <div style={{ maxWidth: 500, margin: '40px auto', padding: 32, background: '#f9fafb', borderRadius: 16, border: '2px solid #e5e7eb', boxShadow: '0 2px 12px #0002', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: '#059669', marginBottom: 24 }}>🎉 Fin de la partie !</h1>
        <h2 style={{ color: '#2563eb', marginBottom: 16 }}>Classement final :</h2>
        <ol style={{ textAlign: 'left', margin: '0 auto 24px', paddingLeft: 32, maxWidth: 300 }}>
          {sortedPlayers.map((p, i) => (
            <li key={i} style={{ color: i === 0 ? '#059669' : '#374151', fontWeight: i === 0 ? 'bold' : 'normal', fontSize: i === 0 ? 20 : 16 }}>
              {p.name} : {p.score} pt{p.score > 1 ? 's' : ''}
            </li>
          ))}
        </ol>
        <button onClick={() => setSetup(true)} style={{ padding: '12px 28px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', fontSize: 18, cursor: 'pointer' }}>Rejouer</button>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      padding: '20px',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '20px',
      height: '100vh',
      maxHeight: '100vh'
    }}>
      {/* Panneau de gauche - Informations et contrôles */}
      <div style={{ 
        flex: isMobile ? 'none' : '0 0 400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        minHeight: isMobile ? 'auto' : 'unset'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ 
            color: '#2563eb', 
            marginBottom: '10px', 
            fontSize: isMobile ? '24px' : '28px'
          }}>
            🇫🇷 Jeu de Géographie
          </h1>
        </div>

        <div style={{
          backgroundColor: '#f9fafb',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: isMobile ? '18px' : '20px', color: '#374151', marginBottom: 8 }}>
            <b>Tour de :</b> <span style={{ color: '#2563eb' }}>{currentPlayer?.name}</span>
          </div>
          <div style={{ fontSize: isMobile ? '16px' : '18px', color: '#059669', marginBottom: 8 }}>
            Score : <b>{currentPlayer?.score}</b> point{currentPlayer?.score > 1 ? 's' : ''}
          </div>
          <div style={{ fontSize: isMobile ? '14px' : '16px', color: '#374151', marginBottom: '8px' }}>
            Manche : <b>{currentRound}</b> / {numRounds}
          </div>
          <div style={{ fontSize: isMobile ? '14px' : '16px', color: '#374151', marginBottom: '15px' }}>
            Cliquez sur la carte à l&apos;endroit où vous pensez que se trouve :
          </div>
          <h3 style={{ color: '#dc2626', margin: '0', fontSize: isMobile ? '28px' : '32px', fontWeight: 'bold' }}>
            {ville.nom}
          </h3>
        </div>

        {/* Panneau de résultats */}
        {showResult && (
          <div style={{
            backgroundColor: '#f3f4f6',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            padding: isMobile ? '15px' : '20px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: isMobile ? '24px' : '28px', marginBottom: '15px' }}>{message}</div>
            <div style={{ fontSize: isMobile ? '16px' : '18px', color: '#374151', marginBottom: '10px' }}>
              Tu étais à <strong>{distance?.toFixed(1)} km</strong> de
            </div>
            <div style={{ fontSize: isMobile ? '20px' : '24px', color: '#dc2626', fontWeight: 'bold', marginBottom: '10px' }}>
              {ville.nom}
            </div>
            <div style={{ fontSize: isMobile ? '18px' : '20px', color: '#059669', fontWeight: 'bold', marginBottom: '20px' }}>
              +{lastScore} point{lastScore > 1 ? 's' : ''} !
            </div>
            {!gameOver && (
              <button
                onClick={nextCity}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: isMobile ? '12px 20px' : '15px 30px',
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  width: '100%'
                }}
                onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
              >
                Ville suivante 🏃‍♂️
              </button>
            )}
          </div>
        )}

        {/* Classement */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, marginTop: 8, padding: 10 }}>
          <b>Classement :</b>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            {players.map((p, i) => (
              <li key={i} style={{ color: i === currentPlayerIdx ? '#2563eb' : '#374151', fontWeight: i === currentPlayerIdx ? 'bold' : 'normal' }}>
                {p.name} : {p.score} pt{p.score > 1 ? 's' : ''}
              </li>
            ))}
          </ol>
        </div>

        {!showResult && !isMobile && (
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #dbeafe',
            borderRadius: '6px',
            padding: '15px',
            fontSize: '14px',
            color: '#1e40af',
            textAlign: 'center',
            marginTop: 8
          }}>
            💡 Plus vous cliquez près de la ville, plus vous gagnez de points !
            <br />
            <br />
            <strong>Barème :</strong>
            <br />
            • 0 - 50 km : 3 pts 🎯
            <br />
            • 50 - 100 km : 2 pts 
            <br />
            • 100 - 200 km : 1 pt
            <br />
            • + 200 km : 0 pt 😅
          </div>
        )}
      </div>

      {/* Panneau de droite - Carte */}
      <div style={{ 
        flex: isMobile ? 'none' : '1',
        border: '2px solid #e5e7eb', 
        borderRadius: '8px', 
        overflow: 'hidden',
        height: isMobile ? '400px' : 'auto',
        minHeight: isMobile ? '400px' : '600px'
      }}>
        <DynamicMap
          clickPosition={clickPosition}
          showResult={showResult}
          ville={ville}
          distance={distance}
          onMapClick={handleMapClick}
        />
      </div>

      {/* Guide mobile uniquement */}
      {!showResult && isMobile && (
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #dbeafe',
          borderRadius: '6px',
          padding: '10px',
          fontSize: '12px',
          color: '#1e40af',
          textAlign: 'center'
        }}>
          💡 Plus vous cliquez près de la ville, plus vous gagnez de points !
        </div>
      )}
    </div>
  );
}
