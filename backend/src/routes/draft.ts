import { Router, Request, Response } from 'express';
import pool from '../db';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/state', async (_req: Request, res: Response) => {
  try {
    const stateResult = await pool.query('SELECT * FROM draft_state LIMIT 1');
    if (stateResult.rows.length === 0) {
      res.json({ is_active: false, is_complete: false, current_pick: 1 });
      return;
    }
    res.json(stateResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch draft state' });
  }
});

router.post('/start', authMiddleware, async (_req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM draft_state');
    const result = await pool.query(
      'INSERT INTO draft_state (is_active, is_complete, current_pick) VALUES (true, false, 1) RETURNING *'
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start draft' });
  }
});

// Public: anyone can make a draft pick (for live drafts with friends)
router.post('/pick', async (req: Request, res: Response) => {
  try {
    const { team_id, player_id } = req.body;
    if (!team_id || !player_id) {
      res.status(400).json({ error: 'team_id and player_id are required' });
      return;
    }

    // Check player isn't already drafted
    const existing = await pool.query('SELECT * FROM team_players WHERE player_id = $1', [player_id]);
    if (existing.rows.length > 0) {
      res.status(400).json({ error: 'Player already drafted' });
      return;
    }

    // Get current pick number
    const pickCount = await pool.query('SELECT COUNT(*) FROM team_players');
    const pickNumber = parseInt(pickCount.rows[0].count) + 1;

    await pool.query(
      'INSERT INTO team_players (team_id, player_id, pick_number) VALUES ($1, $2, $3)',
      [team_id, player_id, pickNumber]
    );

    // Update draft state
    await pool.query(
      'UPDATE draft_state SET current_pick = $1, updated_at = NOW()',
      [pickNumber + 1]
    );

    // Check if draft is complete (all 24 players drafted)
    if (pickNumber >= 24) {
      await pool.query('UPDATE draft_state SET is_complete = true, is_active = false');
    }

    res.json({ success: true, pick_number: pickNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to make draft pick' });
  }
});

router.delete('/pick/:playerId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { playerId } = req.params;
    await pool.query('DELETE FROM team_players WHERE player_id = $1', [playerId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to undo draft pick' });
  }
});

router.post('/reset', authMiddleware, async (_req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM team_players');
    await pool.query('UPDATE draft_state SET is_active = false, is_complete = false, current_pick = 1');
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset draft' });
  }
});

export default router;
