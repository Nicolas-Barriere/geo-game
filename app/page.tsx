'use client';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup, Circle } from 'react-leaflet';
import { useState, useEffect } from 'react';
import { villes } from '../data/villes';
import { haversineDistance } from '../utils/geo';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression, Icon, DivIcon } from 'leaflet';

const centerFrance: LatLngExpression = [46.603354, 1.888334];

// Icônes personnalisées
const userClickIcon = new DivIcon({
  html: '<div style="background-color: #dc2626; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
  className: 'custom-div-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const correctLocationIcon = new DivIcon({
  html: '<div style="background-color: #059669; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
  className: 'custom-div-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});


export default function Home() {
  const [score, setScore] = useState(0);
  const [ville, setVille] = useState(villes[0]);
  const [clickPosition, setClickPosition] = useState<LatLngExpression | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [lastScore, setLastScore] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    setVille(villes[Math.floor(Math.random() * villes.length)]);
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

  function MapClicker() {
    useMapEvents({
      click(e: any) {
        if (showResult) return; // Empêche de cliquer pendant l'affichage du résultat
        
        const dist = haversineDistance(
          e.latlng.lat, e.latlng.lng,
          ville.lat, ville.lon
        );
        
        // Système de points plus sophistiqué
        let pts = 0;
        let msg = "";
        
        if (dist < 10) {
          pts = 1000;
          msg = "🎯 Parfait !";
        } else if (dist < 25) {
          pts = 800;
          msg = "🎯 Excellent !";
        } else if (dist < 50) {
          pts = 600;
          msg = "👍 Très bien !";
        } else if (dist < 100) {
          pts = 400;
          msg = "👌 Bien !";
        } else if (dist < 200) {
          pts = 200;
          msg = "🤔 Pas mal...";
        } else {
          pts = 50;
          msg = "😅 Oups !";
        }
        
        setClickPosition([e.latlng.lat, e.latlng.lng]);
        setDistance(dist);
        setLastScore(pts);
        setMessage(msg);
        setShowResult(true);
        setScore(score + pts);
      },
    });
    return null;
  }

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      padding: '20px',
      display: 'flex',
      gap: '20px',
      height: '100vh',
      maxHeight: '100vh'
    }}>
      {/* Panneau de gauche - Informations et contrôles */}
      <div style={{ 
        flex: '0 0 400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#2563eb', marginBottom: '10px', fontSize: '28px' }}>🇫🇷 Jeu de Géographie</h1>
          <h2 style={{ color: '#374151', marginBottom: '20px', fontSize: '20px' }}>France</h2>
        </div>

        <div style={{
          backgroundColor: '#f9fafb',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669', marginBottom: '15px' }}>
            Score : {score} points
          </div>
          
          {!showResult ? (
            <>
              <div style={{ fontSize: '16px', color: '#374151', marginBottom: '15px' }}>
                Cliquez sur la carte à l'endroit où vous pensez que se trouve :
              </div>
              <h3 style={{ color: '#dc2626', margin: '0', fontSize: '32px', fontWeight: 'bold' }}>
                {ville.nom}
              </h3>
            </>
          ) : (
            <div style={{ fontSize: '16px', color: '#6366f1' }}>
              Résultat affiché sur la carte →
            </div>
          )}
        </div>

        {/* Panneau de résultats */}
        {showResult && (
          <div style={{
            backgroundColor: '#f3f4f6',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '15px' }}>{message}</div>
            <div style={{ fontSize: '18px', color: '#374151', marginBottom: '10px' }}>
              Tu étais à <strong>{distance?.toFixed(1)} km</strong> de
            </div>
            <div style={{ fontSize: '24px', color: '#dc2626', fontWeight: 'bold', marginBottom: '10px' }}>
              {ville.nom}
            </div>
            <div style={{ fontSize: '20px', color: '#059669', fontWeight: 'bold', marginBottom: '20px' }}>
              +{lastScore} points !
            </div>
            <button
              onClick={nextCity}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '15px 30px',
                fontSize: '18px',
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

        {!showResult && (
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
            • &lt; 10 km : 1000 pts 🎯
            <br />
            • &lt; 25 km : 800 pts 
            <br />
            • &lt; 50 km : 600 pts 
            <br />
            • &lt; 100 km : 400 pts 
            <br />
            • &lt; 200 km : 200 pts 
            <br />
            • + 200 km : 50 pts 😅
          </div>
        )}
      </div>

      {/* Panneau de droite - Carte */}
      <div style={{ 
        flex: '1',
        border: '2px solid #e5e7eb', 
        borderRadius: '8px', 
        overflow: 'hidden',
        minHeight: '600px'
      }}>
        <MapContainer center={centerFrance} zoom={6} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; CartoDB'
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          />
          <MapClicker />
          
          {/* Marqueur de clic de l'utilisateur */}
          {clickPosition && (
            <Marker position={clickPosition} icon={userClickIcon}>
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <strong>Ton clic</strong><br />
                  🔴 Tu as cliqué ici
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Marqueur de la position correcte */}
          {showResult && (
            <Marker position={[ville.lat, ville.lon]} icon={correctLocationIcon}>
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <strong>{ville.nom}</strong><br />
                  🟢 Position correcte
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Ligne entre le clic et la position correcte */}
          {showResult && clickPosition && distance && (
            <Circle 
              center={clickPosition} 
              radius={distance * 1000} 
              pathOptions={{ 
                color: '#dc2626', 
                fillColor: '#dc2626', 
                fillOpacity: 0.1, 
                weight: 2,
                dashArray: '5, 5'
              }} 
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
