import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Player, Team, ScoringRule, ScoringEvent } from '../types';
import PlayerCard from '../components/PlayerCard';

type AdminTab = 'scoring' | 'eliminate' | 'teams' | 'draft';

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('scoring');

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/login');
  }, [isAdmin, authLoading, navigate]);

  if (authLoading) return <div className="loading">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="admin-page">
      <h1 className="page-title">TRIBAL COUNCIL</h1>
      <p className="page-subtitle">League Administration</p>

      <div className="tab-bar">
        <button className={`tab ${tab === 'scoring' ? 'active' : ''}`} onClick={() => setTab('scoring')}>
          Add Scores
        </button>
        <button className={`tab ${tab === 'eliminate' ? 'active' : ''}`} onClick={() => setTab('eliminate')}>
          Eliminate
        </button>
        <button className={`tab ${tab === 'teams' ? 'active' : ''}`} onClick={() => setTab('teams')}>
          Manage Teams
        </button>
        <button className={`tab ${tab === 'draft' ? 'active' : ''}`} onClick={() => setTab('draft')}>
          Draft
        </button>
      </div>

      {tab === 'scoring' && <ScoringTab />}
      {tab === 'eliminate' && <EliminateTab />}
      {tab === 'teams' && <TeamsTab />}
      {tab === 'draft' && <DraftTab />}
    </div>
  );
}

function EliminateTab() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => { loadPlayers(); }, []);

  const loadPlayers = () => {
    api.getPlayers().then(setPlayers).catch(console.error);
  };

  const activePlayers = players.filter(p => !p.is_eliminated);
  const eliminatedPlayers = players.filter(p => p.is_eliminated);

  const handleEliminate = async (player: Player) => {
    if (!window.confirm(`Eliminate ${player.name}? Their card will be grayed out across all pages.`)) return;
    try {
      await api.updatePlayer(player.id, { is_eliminated: true });
      setMessage(`${player.name} has been voted out!`);
      loadPlayers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleReinstate = async (player: Player) => {
    try {
      await api.updatePlayer(player.id, { is_eliminated: false });
      setMessage(`${player.name} reinstated`);
      loadPlayers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="admin-tab-content">
      {message && (
        <div className={`form-message ${message.startsWith('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="eliminate-section">
        <h3>Still in the Game ({activePlayers.length})</h3>
        <p className="eliminate-hint">Tap a player to eliminate them</p>
        <div className="cast-grid">
          {activePlayers.map(p => (
            <div key={p.id} className="eliminate-card-wrapper" onClick={() => handleEliminate(p)}>
              <PlayerCard player={p} onClick={() => handleEliminate(p)} />
            </div>
          ))}
        </div>
      </div>

      {eliminatedPlayers.length > 0 && (
        <div className="eliminate-section" style={{ marginTop: '2rem' }}>
          <h3>Voted Out ({eliminatedPlayers.length})</h3>
          <p className="eliminate-hint">Tap to undo elimination</p>
          <div className="cast-grid">
            {eliminatedPlayers.map(p => (
              <div key={p.id} className="eliminate-card-wrapper">
                <PlayerCard player={p} onClick={() => handleReinstate(p)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoringTab() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [rules, setRules] = useState<ScoringRule[]>([]);
  const [events, setEvents] = useState<ScoringEvent[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<number>(0);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [episode, setEpisode] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [placement, setPlacement] = useState<string>('');
  const [message, setMessage] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    api.getPlayers().then(setPlayers).catch(console.error);
    api.getScoringRules().then(setRules).catch(console.error);
    api.getScoringEvents(30).then(setEvents).catch(console.error);
  };

  const togglePlayerSelection = (id: number) => {
    setSelectedPlayers(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (bulkMode) {
        if (selectedPlayers.length === 0 || !selectedEvent) {
          setMessage('Select players and an event type');
          return;
        }
        await api.addBulkScoringEvents({
          player_ids: selectedPlayers,
          event_type: selectedEvent,
          episode: episode ? parseInt(episode) : undefined,
          notes: notes || undefined,
        });
        setMessage(`Added "${selectedEvent.replace(/_/g, ' ')}" for ${selectedPlayers.length} players!`);
        setSelectedPlayers([]);
      } else {
        if (!selectedPlayer || !selectedEvent) {
          setMessage('Select a player and event type');
          return;
        }
        const data: any = {
          player_id: selectedPlayer,
          event_type: selectedEvent,
          episode: episode ? parseInt(episode) : undefined,
          notes: notes || undefined,
        };
        if (selectedEvent === 'placement') {
          data.custom_points = parseInt(placement);
        }
        await api.addScoringEvent(data);
        const playerName = players.find(p => p.id === selectedPlayer)?.name;
        setMessage(`Score added for ${playerName}!`);
      }
      setSelectedPlayer(0);
      setSelectedEvent('');
      setEpisode('');
      setNotes('');
      setPlacement('');
      loadData();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteEvent = async (id: number) => {
    try {
      await api.deleteScoringEvent(id);
      loadData();
      setMessage('Event deleted');
      setTimeout(() => setMessage(''), 2000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const selectedRule = rules.find(r => r.event_type === selectedEvent);

  return (
    <div className="admin-tab-content">
      <form onSubmit={handleSubmit} className="scoring-form">
        <div className="form-row">
          <label className="form-toggle">
            <input
              type="checkbox"
              checked={bulkMode}
              onChange={e => { setBulkMode(e.target.checked); setSelectedPlayers([]); }}
            />
            <span>Bulk Mode (multiple players)</span>
          </label>
        </div>

        {!bulkMode ? (
          <div className="form-group">
            <label>Player</label>
            <select
              value={selectedPlayer}
              onChange={e => setSelectedPlayer(parseInt(e.target.value))}
              className="form-select"
            >
              <option value={0}>-- Select Player --</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.tribe}) {p.is_eliminated ? '(OUT)' : ''}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="form-group">
            <label>Select Players ({selectedPlayers.length} selected)</label>
            <div className="bulk-player-grid">
              {players.filter(p => !p.is_eliminated).map(p => (
                <PlayerCard
                  key={p.id}
                  player={p}
                  compact
                  selected={selectedPlayers.includes(p.id)}
                  onClick={() => togglePlayerSelection(p.id)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Scoring Event</label>
          <select
            value={selectedEvent}
            onChange={e => setSelectedEvent(e.target.value)}
            className="form-select"
          >
            <option value="">-- Select Event --</option>
            {rules.map(r => (
              <option key={r.event_type} value={r.event_type}>
                {r.description} ({r.is_variable ? 'variable' : (r.points > 0 ? '+' : '') + r.points})
              </option>
            ))}
          </select>
        </div>

        {selectedEvent === 'placement' && (
          <div className="form-group">
            <label>Placement (1 = Winner, 24 = First Boot)</label>
            <input
              type="number"
              min="1"
              max="24"
              value={placement}
              onChange={e => setPlacement(e.target.value)}
              className="form-input"
              placeholder="Enter placement..."
            />
            {placement && (
              <div className="placement-preview">
                Points awarded: {25 - parseInt(placement || '0')}
              </div>
            )}
          </div>
        )}

        <div className="form-row-inline">
          <div className="form-group">
            <label>Episode (optional)</label>
            <input
              type="number"
              min="1"
              value={episode}
              onChange={e => setEpisode(e.target.value)}
              className="form-input"
              placeholder="Ep #"
            />
          </div>
          <div className="form-group flex-1">
            <label>Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="form-input"
              placeholder="Optional notes..."
            />
          </div>
        </div>

        {selectedRule && !selectedRule.is_variable && (
          <div className="points-preview">
            {bulkMode ? `${selectedPlayers.length} × ` : ''}
            {selectedRule.points > 0 ? '+' : ''}{selectedRule.points} points
            {bulkMode ? ` = ${(selectedPlayers.length * selectedRule.points).toFixed(2)} total` : ''}
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-full">
          🔥 Add Score{bulkMode ? 's' : ''}
        </button>

        {message && (
          <div className={`form-message ${message.startsWith('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </form>

      <div className="recent-events">
        <h3>Recent Scoring Events</h3>
        <table className="log-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Event</th>
              <th>Points</th>
              <th>Ep</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td>{event.player_name}</td>
                <td>{event.event_type.replace(/_/g, ' ')}</td>
                <td className={event.points >= 0 ? 'positive' : 'negative'}>
                  {event.points > 0 ? '+' : ''}{event.points}
                </td>
                <td>{event.episode || '-'}</td>
                <td>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="btn-icon delete-btn"
                    title="Delete"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeamsTab() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [draftOrder, setDraftOrder] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { loadTeams(); }, []);

  const loadTeams = () => {
    api.getTeams().then(setTeams).catch(console.error);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ownerName) return;
    try {
      await api.createTeam({
        name,
        owner_name: ownerName,
        draft_order: draftOrder ? parseInt(draftOrder) : undefined,
      });
      setName('');
      setOwnerName('');
      setDraftOrder('');
      loadTeams();
      setMessage('Team created!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this team? This will remove all draft picks.')) return;
    try {
      await api.deleteTeam(id);
      loadTeams();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="admin-tab-content">
      <form onSubmit={handleCreate} className="team-form">
        <h3>Create New Team</h3>
        <div className="form-row-inline">
          <div className="form-group flex-1">
            <label>Team Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="form-input"
              placeholder="e.g. Blindside Brigade"
            />
          </div>
          <div className="form-group flex-1">
            <label>Manager Name</label>
            <input
              type="text"
              value={ownerName}
              onChange={e => setOwnerName(e.target.value)}
              className="form-input"
              placeholder="e.g. Nathan"
            />
          </div>
          <div className="form-group">
            <label>Draft Order</label>
            <input
              type="number"
              min="1"
              value={draftOrder}
              onChange={e => setDraftOrder(e.target.value)}
              className="form-input"
              placeholder="#"
              style={{ width: '80px' }}
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Create Team</button>
        {message && <div className="form-message success">{message}</div>}
      </form>

      <div className="existing-teams">
        <h3>Existing Teams ({teams.length})</h3>
        {teams.map(team => (
          <div key={team.id} className="admin-team-card">
            <div className="admin-team-info">
              <strong>{team.name}</strong>
              <span className="team-meta">{team.owner_name} — Draft #{team.draft_order || '?'}</span>
              <span className="team-meta">{team.players?.length || 0} players — {team.total_score.toFixed(1)} pts</span>
            </div>
            <button onClick={() => handleDelete(team.id)} className="btn btn-danger btn-small">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DraftTab() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number>(0);
  const [selectedPlayer, setSelectedPlayer] = useState<number>(0);
  const [message, setMessage] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    api.getPlayers().then(setPlayers).catch(console.error);
    api.getTeams().then(setTeams).catch(console.error);
  };

  const availablePlayers = players.filter(p => !p.team_id);
  const draftedPlayers = players.filter(p => p.team_id);

  const handlePick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !selectedPlayer) {
      setMessage('Select both a team and a player');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    try {
      await api.makePick(selectedTeam, selectedPlayer);
      const playerName = players.find(p => p.id === selectedPlayer)?.name;
      const teamName = teams.find(t => t.id === selectedTeam)?.name;
      setMessage(`${playerName} drafted to ${teamName}!`);
      setSelectedPlayer(0);
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleUndoPick = async (playerId: number) => {
    try {
      await api.undoPick(playerId);
      loadData();
      setMessage('Pick undone');
      setTimeout(() => setMessage(''), 2000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleResetDraft = async () => {
    if (!window.confirm('Reset the entire draft? This removes ALL picks.')) return;
    try {
      await api.resetDraft();
      loadData();
      setMessage('Draft reset');
      setTimeout(() => setMessage(''), 2000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="admin-tab-content">
      <form onSubmit={handlePick} className="draft-form">
        <h3>Make a Draft Pick</h3>
        <div className="form-row-inline">
          <div className="form-group flex-1">
            <label>Team</label>
            <select
              value={selectedTeam}
              onChange={e => setSelectedTeam(parseInt(e.target.value))}
              className="form-select"
            >
              <option value={0}>-- Select Team --</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.owner_name}) — {t.players?.length || 0} players
                </option>
              ))}
            </select>
          </div>
          <div className="form-group flex-1">
            <label>Available Player</label>
            <select
              value={selectedPlayer}
              onChange={e => setSelectedPlayer(parseInt(e.target.value))}
              className="form-select"
            >
              <option value={0}>-- Select Player --</option>
              {availablePlayers.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.tribe})</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">🔥 Draft Player</button>
        {message && (
          <div className={`form-message ${message.startsWith('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </form>

      <div className="draft-status">
        <div className="draft-counts">
          <span className="draft-count-item">
            <strong>{availablePlayers.length}</strong> Available
          </span>
          <span className="draft-count-item">
            <strong>{draftedPlayers.length}</strong> Drafted
          </span>
        </div>
      </div>

      <div className="available-players-section">
        <h3>Available Players ({availablePlayers.length})</h3>
        <div className="draft-player-grid">
          {availablePlayers.map(p => (
            <PlayerCard
              key={p.id}
              player={p}
              compact
              onClick={() => setSelectedPlayer(p.id)}
              selected={selectedPlayer === p.id}
            />
          ))}
        </div>
      </div>

      {teams.length > 0 && (
        <div className="draft-rosters">
          <h3>Current Rosters</h3>
          <div className="rosters-grid">
            {teams.map(team => (
              <div key={team.id} className="roster-card">
                <h4>{team.name} <span className="roster-owner">({team.owner_name})</span></h4>
                {team.players?.length === 0 ? (
                  <p className="empty-roster">No players yet</p>
                ) : (
                  <ul className="roster-list">
                    {team.players?.map((p: any) => (
                      <li key={p.id} className="roster-item">
                        <span>{p.name}</span>
                        <button
                          onClick={() => handleUndoPick(p.id)}
                          className="btn-icon delete-btn"
                          title="Undo pick"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="draft-actions">
        <button onClick={handleResetDraft} className="btn btn-danger">Reset Entire Draft</button>
      </div>
    </div>
  );
}
