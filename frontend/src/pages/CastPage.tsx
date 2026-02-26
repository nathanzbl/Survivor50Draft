import { useEffect, useState } from 'react';
import { api } from '../api';
import { Player } from '../types';
import PlayerCard from '../components/PlayerCard';

const TRIBE_ORDER = ['Cila', 'Kalo', 'Vatu'];
const TRIBE_COLORS: Record<string, string> = {
  Cila: '#E87830',
  Kalo: '#4AC8D9',
  Vatu: '#D06CC0',
};

export default function CastPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    api.getPlayers().then(setPlayers).catch(console.error);
  }, []);

  const filtered = filter === 'all' ? players : players.filter(p => p.tribe === filter);

  return (
    <div className="cast-page">
      <h1 className="page-title">THE CASTAWAYS</h1>
      <p className="page-subtitle">24 returning players compete for the title of Sole Survivor</p>

      <div className="tribe-filters">
        <button
          className={`tribe-filter ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Tribes
        </button>
        {TRIBE_ORDER.map(tribe => (
          <button
            key={tribe}
            className={`tribe-filter ${filter === tribe ? 'active' : ''}`}
            onClick={() => setFilter(tribe)}
            style={{ '--tribe-color': TRIBE_COLORS[tribe] } as React.CSSProperties}
          >
            {tribe}
          </button>
        ))}
      </div>

      {TRIBE_ORDER.filter(t => filter === 'all' || filter === t).map(tribe => {
        const tribePlayers = filtered.filter(p => p.tribe === tribe);
        if (tribePlayers.length === 0) return null;
        return (
          <div key={tribe} className="tribe-section">
            <h2 className="tribe-heading" style={{ color: TRIBE_COLORS[tribe] }}>
              <span className="tribe-name">{tribe} Tribe</span>
            </h2>
            <div className="cast-grid">
              {tribePlayers.map(player => (
                <PlayerCard key={player.id} player={player} showScore />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
