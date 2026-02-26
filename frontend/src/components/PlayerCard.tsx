import { Player } from '../types';

const TRIBE_COLORS: Record<string, string> = {
  Cila: '#E87830',
  Kalo: '#4AC8D9',
  Vatu: '#D06CC0',
};

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
  showScore?: boolean;
}

export default function PlayerCard({ player, onClick, selected, compact, showScore }: PlayerCardProps) {
  const tribeColor = TRIBE_COLORS[player.tribe] || '#D4A843';
  const displayName = player.nickname || player.name.split(' ')[0];

  return (
    <div
      className={`player-card ${compact ? 'compact' : ''} ${selected ? 'selected' : ''} ${player.is_eliminated ? 'eliminated' : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{ '--tribe-color': tribeColor } as React.CSSProperties}
    >
      <div className="player-avatar" style={{ background: `linear-gradient(135deg, ${tribeColor}, ${tribeColor}88)` }}>
        {player.photo_url ? (
          <img src={player.photo_url} alt={player.name} />
        ) : (
          <span className="avatar-initials">{getInitials(player.name)}</span>
        )}
        {player.is_eliminated && <div className="eliminated-overlay">OUT</div>}
      </div>
      <div className="player-info">
        <div className="player-name">{compact ? displayName : player.name}</div>
        {!compact && (
          <>
            <div className="player-tribe" style={{ color: tribeColor }}>{player.tribe}</div>
            <div className="player-seasons">S{player.original_seasons}</div>
          </>
        )}
        {showScore && (
          <div className="player-score">{Number(player.total_points).toFixed(1)} pts</div>
        )}
      </div>
      {player.placement && (
        <div className="placement-badge">#{player.placement}</div>
      )}
    </div>
  );
}
