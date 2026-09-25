import { Router, Request, Response, NextFunction } from 'express';
import { TournamentService } from './tournament.service';
import { authenticate, AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { requireAdmin } from '../../common/middleware/admin.middleware';
import { store } from '../../database/data-store';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/v1/tournaments
router.get('/', (req: Request, res: Response) => {
  const { mode, map, status, maxEntryFee } = req.query;
  const list = TournamentService.getAllTournaments({
    mode: mode as string,
    map: map as string,
    status: status as string,
    maxEntryFee: maxEntryFee ? Number(maxEntryFee) : undefined,
  });
  res.json({ success: true, data: list });
});

// GET /api/v1/tournaments/my/matches
router.get('/my/matches', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const userRegs = Array.from(store.registrations.values())
    .filter((r) => r.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const matches = userRegs.map((reg) => {
    const tournament = store.tournaments.get(reg.tournament_id);
    const result = Array.from(store.results.values()).find(
      (r) => r.tournament_id === reg.tournament_id && r.user_id === userId
    );

    let canViewRoom = false;
    let roomId = null;
    let roomPassword = null;

    if (tournament) {
      const isTimePassed = new Date() >= new Date(tournament.room_release_time);
      if (isTimePassed || tournament.status === 'LIVE') {
        const matchRoom = Array.from(store.matches.values()).find((m) => m.tournament_id === tournament.id);
        if (matchRoom) {
          canViewRoom = true;
          roomId = matchRoom.room_id;
          roomPassword = matchRoom.room_password;
        }
      }
    }

    return {
      registration: reg,
      tournament,
      result: result || null,
      room: canViewRoom ? { roomId, roomPassword } : null,
    };
  });

  res.json({ success: true, data: matches });
});

// GET /api/v1/tournaments/:id
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const tournament = TournamentService.getTournamentById(req.params.id);
    res.json({ success: true, data: tournament });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/tournaments/:id/join
router.post('/:id/join', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { inGameName, inGameUid, teamName } = req.body;
    if (!inGameName || !inGameUid) {
      return res.status(400).json({ success: false, message: 'Free Fire In-Game Name and UID are required' });
    }

    const registration = await TournamentService.joinTournament(req.user!.id, req.params.id, {
      inGameName,
      inGameUid,
      teamName,
    });

    res.status(201).json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/tournaments/:id/room (Protected Room Credentials)
router.get('/:id/room', authenticate, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const creds = TournamentService.getRoomCredentials(req.user!.id, req.params.id);
    res.json({ success: true, data: creds });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/tournaments/:id/result (Result Submission)
router.post('/:id/result', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { kills, placement, screenshotUrl, notes } = req.body;
    if (kills === undefined || placement === undefined || !screenshotUrl) {
      return res.status(400).json({ success: false, message: 'Kills, placement, and screenshot proof are required' });
    }

    const result = await TournamentService.submitMatchResult(req.user!.id, req.params.id, {
      kills: Number(kills),
      placement: Number(placement),
      screenshotUrl,
      notes,
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ADMIN: POST /api/v1/tournaments (Create Tournament)
router.post('/', requireAdmin(['SUPER_ADMIN', 'ADMIN', 'TOURNAMENT_ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const id = uuidv4();
  const body = req.body;

  const newTournament = {
    id,
    title: body.title || 'Free Fire Skill Tournament',
    description: body.description || '',
    game: 'Free Fire MAX',
    mode: body.mode || 'SOLO',
    match_type: body.matchType || 'Battle Royale',
    map: body.map || 'Bermuda',
    entry_fee: Number(body.entryFee || 20),
    prize_pool: Number(body.prizePool || 1000),
    platform_fee_percent: 10,
    max_participants: Number(body.maxParticipants || 50),
    min_participants: 10,
    current_participants: 0,
    start_time: body.startTime || new Date(Date.now() + 3600000).toISOString(),
    reg_deadline: body.regDeadline || new Date(Date.now() + 3000000).toISOString(),
    room_release_time: body.roomReleaseTime || new Date(Date.now() + 3300000).toISOString(),
    result_deadline: body.resultDeadline || new Date(Date.now() + 7200000).toISOString(),
    rules: body.rules || '1. Fair play only. No emulators.',
    scoring_rules: body.scoringRules || { killPoints: 10, placementPoints: { '1': 100, '2': 80, '3': 60 } },
    prize_distribution: body.prizeDistribution || { '1': 400, '2': 250, '3': 150 },
    status: 'OPEN' as const,
    banner_url: body.bannerUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.tournaments.set(id, newTournament);

  // Create match room
  const matchId = uuidv4();
  store.matches.set(matchId, {
    id: matchId,
    tournament_id: id,
    match_number: 1,
    status: 'SCHEDULED',
    room_id: body.roomId || '',
    room_password: body.roomPassword || '',
  });

  res.status(201).json({ success: true, data: newTournament });
});

// ADMIN: PUT /api/v1/tournaments/:id/room
router.put('/:id/room', requireAdmin(['SUPER_ADMIN', 'ADMIN', 'TOURNAMENT_ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { roomId, roomPassword, status } = req.body;
  const match = Array.from(store.matches.values()).find((m) => m.tournament_id === req.params.id);

  if (match) {
    if (roomId) match.room_id = roomId;
    if (roomPassword) match.room_password = roomPassword;
    if (status) match.status = status;
    match.room_released_at = new Date().toISOString();
  }

  res.json({ success: true, message: 'Room credentials updated successfully' });
});

// ADMIN: POST /api/v1/tournaments/:id/disburse
router.post('/:id/disburse', requireAdmin(['SUPER_ADMIN', 'ADMIN', 'TOURNAMENT_ADMIN', 'FINANCE_ADMIN']), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { approvedResults } = req.body;
    const result = await TournamentService.verifyAndDisbursePrizes(req.user!.id, req.params.id, approvedResults);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ADMIN: POST /api/v1/tournaments/:id/cancel
router.post('/:id/cancel', requireAdmin(['SUPER_ADMIN', 'ADMIN']), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    const result = await TournamentService.cancelAndRefundTournament(req.user!.id, req.params.id, reason || 'Organizer cancellation');
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export const tournamentRouter = router;
