import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Team, ScoringEvent } from '../types';

export default function HomePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [recentEvents, setRecentEvents] = useState<ScoringEvent[]>([]);

  useEffect(() => {
    api.getTeams().then(setTeams).catch(() => {});
    api.getScoringEvents(10).then(setRecentEvents).catch(() => {});
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-fire-left">🔥</div>
        <div className="hero-content">
          <h1 className="hero-title">SURVIVOR 50</h1>
          <p className="hero-subtitle">IN THE HANDS OF THE FANS</p>
          <p className="hero-tagline">Fantasy Draft League</p>
          <div className="hero-actions">
            <Link to="/scoreboard" className="btn btn-primary">View Scoreboard</Link>
            <Link to="/cast" className="btn btn-secondary">Meet the Cast</Link>
          </div>
        </div>
        <div className="hero-fire-right">🔥</div>
      </section>

      {teams.length > 0 && (
        <section className="section">
          <h2 className="section-title">Standings</h2>
          <div className="standings-preview">
            {teams.slice(0, 6).map((team, idx) => (
              <Link to={`/team/${team.id}`} key={team.id} className="standing-row">
                <span className="standing-rank">#{idx + 1}</span>
                <span className="standing-name">{team.name}</span>
                <span className="standing-owner">{team.owner_name}</span>
                <span className="standing-score">{team.total_score.toFixed(1)}</span>
              </Link>
            ))}
          </div>
          <Link to="/scoreboard" className="view-all-link">View Full Scoreboard →</Link>
        </section>
      )}

      {recentEvents.length > 0 && (
        <section className="section">
          <h2 className="section-title">Recent Activity</h2>
          <div className="activity-feed">
            {recentEvents.map(event => (
              <div key={event.id} className="activity-item">
                <span className="activity-player">{event.player_name}</span>
                <span className="activity-event">{event.event_type.replace(/_/g, ' ')}</span>
                <span className={`activity-points ${event.points >= 0 ? 'positive' : 'negative'}`}>
                  {event.points > 0 ? '+' : ''}{event.points}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">Scoring Rules</h2>
        <div className="scoring-rules-grid">
          <div className="rule-card">
            <div className="rule-icon">🏝️</div>
            <div className="rule-name">Makes the Merge</div>
            <div className="rule-points">+3</div>
          </div>
          <div className="rule-card">
            <div className="rule-icon">⚖️</div>
            <div className="rule-name">Makes the Jury</div>
            <div className="rule-points">+5</div>
          </div>
          <div className="rule-card">
            <div className="rule-icon">🏆</div>
            <div className="rule-name">Final Tribal</div>
            <div className="rule-points">+7</div>
          </div>
          <div className="rule-card">
            <div className="rule-icon">🗳️</div>
            <div className="rule-name">In on the Vote</div>
            <div className="rule-points">+1</div>
          </div>
          <div className="rule-card">
            <div className="rule-icon">🗿</div>
            <div className="rule-name">Finds Idol</div>
            <div className="rule-points">+2</div>
          </div>
          <div className="rule-card">
            <div className="rule-icon">🛡️</div>
            <div className="rule-name">Wins Immunity</div>
            <div className="rule-points">+3</div>
          </div>
          <div className="rule-card negative">
            <div className="rule-icon">📝</div>
            <div className="rule-name">Receives Votes</div>
            <div className="rule-points">-0.25</div>
          </div>
          <div className="rule-card negative">
            <div className="rule-icon">💀</div>
            <div className="rule-name">Idoled Out</div>
            <div className="rule-points">-5</div>
          </div>
        </div>
        <Link to="/scoreboard" className="view-all-link">See all scoring rules on the scoreboard →</Link>
      </section>
    </div>
  );
}
