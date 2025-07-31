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


export default function Home() {
  const [score, setScore] = useState(0);
  const [ville, setVille] = useState(villes[0]);
  const [clickPosition, setClickPosition] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [lastScore, setLastScore] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setVille(villes[Math.floor(Math.random() * villes.length)]);
    
    // Vérification de la taille d'écran
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const nextCity = () => {
    setShowResult(false);
    setClickPosition(null);
    setDistance(null);
    setLastScore(0);
    setMessage("");
    const next = villes[Math.floor(Math.random() * villes.length)];
    setVille(next);
  };


  const handleMapClick = (lat: number, lng: number) => {
    if (showResult) return; // Empêche de cliquer pendant l'affichage du résultat
    
    const dist = haversineDistance(lat, lng, ville.lat, ville.lon);
    
    // Nouveau barème : 0 à 3 points
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
      msg = "� Plus de 50 km : 2 points.";
    } else {
      pts = 3;
      msg = "🎯 Moins de 50 km : 3 points !";
    }
    setClickPosition([lat, lng]);
    setDistance(dist);
    setLastScore(pts);
    setMessage(msg);
    setShowResult(true);
    setScore(score + pts);
  };

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
          <div style={{ 
            fontSize: isMobile ? '20px' : '24px', 
            fontWeight: 'bold', 
            color: '#059669', 
            marginBottom: '15px' 
          }}>
            Score : {score} points
          </div>
          
          {!showResult ? (
            <>
              <div style={{ 
                fontSize: isMobile ? '14px' : '16px', 
                color: '#374151', 
                marginBottom: '15px' 
              }}>
                Cliquez sur la carte à l'endroit où vous pensez que se trouve :
              </div>
              <h3 style={{ 
                color: '#dc2626', 
                margin: '0', 
                fontSize: isMobile ? '28px' : '32px', 
                fontWeight: 'bold' 
              }}>
                {ville.nom}
              </h3>
            </>
          ) : (
            <div style={{ 
              fontSize: isMobile ? '14px' : '16px', 
              color: '#6366f1' 
            }}>
              Résultat affiché sur la carte {isMobile ? '↓' : '→'}
            </div>
          )}
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
            <div style={{ 
              fontSize: isMobile ? '24px' : '28px', 
              marginBottom: '15px' 
            }}>
              {message}
            </div>
            <div style={{ 
              fontSize: isMobile ? '16px' : '18px', 
              color: '#374151', 
              marginBottom: '10px' 
            }}>
              Tu étais à <strong>{distance?.toFixed(1)} km</strong> de
            </div>
            <div style={{ 
              fontSize: isMobile ? '20px' : '24px', 
              color: '#dc2626', 
              fontWeight: 'bold', 
              marginBottom: '10px' 
            }}>
              {ville.nom}
            </div>
            <div style={{ 
              fontSize: isMobile ? '18px' : '20px', 
              color: '#059669', 
              fontWeight: 'bold', 
              marginBottom: '20px' 
            }}>
              +{lastScore} points !
            </div>
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
          </div>
        )}

        {!showResult && !isMobile && (
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #dbeafe',
            borderRadius: '6px',
            padding: '15px',
            fontSize: '14px',
            color: '#1e40af',
            textAlign: 'center'
          }}>
            💡 Plus vous cliquez près de la ville, plus vous gagnez de points !
            <br />
            <br />
            <strong>Barème :</strong>
            <br />
            • &lt; 0 - 50 km : 3 pts 🎯
            <br />
            • &lt; 50 - 100 km : 2 pts 
            <br />
            • &lt; 100 - 200 km : 1 pts 
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
