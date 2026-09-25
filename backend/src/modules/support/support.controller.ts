import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { store, SupportTicket, Dispute } from '../../database/data-store';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../../common/errors/api-error';
import { AuditService } from '../../common/utils/audit';

const router = Router();

// GET /api/v1/support/faq
router.get('/faq', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      {
        category: 'Skill vs Chance',
        question: 'Is Tournament X skill-based and legal?',
        answer: 'Yes. Free Fire esports tournaments on Tournament X depend predominantly on player skill, tactical positioning, aiming accuracy, and strategic coordination. The platform complies with Indian legal standards recognizing skill-based esports.',
      },
      {
        category: 'KYC & Verification',
        question: 'Why is KYC required to withdraw money?',
        answer: 'KYC is legally required to verify that players meet the age eligibility requirement (18+) and do not reside in prohibited jurisdictions, as well as to prevent fraud and money laundering.',
      },
      {
        category: 'Room Credentials',
        question: 'When will I receive my Custom Room ID and Password?',
        answer: 'Room credentials unlock automatically 15 minutes prior to match start in the "My Matches" section and are sent via push notification to all confirmed registered players.',
      },
      {
        category: 'Withdrawals',
        question: 'How long does a withdrawal take?',
        answer: 'Verified player withdrawals via UPI or IMPS Bank Transfer are processed in 5 to 30 minutes, subject to anti-fraud automated checks.',
      },
      {
        category: 'Anti-Cheat',
        question: 'What happens if a player uses hacks or emulators?',
        answer: 'Using hacks, auto-aim scripts, or emulators in mobile-only brackets results in immediate disqualification, forfeiture of prizes, and permanent hardware and account bans.',
      },
    ],
  });
});

// GET /api/v1/support/tickets
router.get('/tickets', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const tickets = Array.from(store.supportTickets.values())
    .filter((t) => t.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json({ success: true, data: tickets });
});

// POST /api/v1/support/tickets
router.post('/tickets', authenticate, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { category, subject, description, priority } = req.body;
    if (!category || !subject || !description) {
      return res.status(400).json({ success: false, message: 'Category, subject, and description are required' });
    }

    const ticketId = uuidv4();
    const ticketNumber = `TX-TCK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket: SupportTicket = {
      id: ticketId,
      ticket_number: ticketNumber,
      user_id: req.user!.id,
      category,
      subject,
      description,
      priority: priority || 'MEDIUM',
      status: 'OPEN',
      messages: [
        {
          id: uuidv4(),
          sender_id: req.user!.id,
          sender_role: 'PLAYER',
          message: description,
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.supportTickets.set(ticketId, newTicket);
    res.status(201).json({ success: true, data: newTicket });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/support/tickets/:id/reply
router.post('/tickets/:id/reply', authenticate, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ticket = store.supportTickets.get(req.params.id);
    if (!ticket) throw ApiError.notFound('Support ticket not found');

    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message content required' });

    ticket.messages.push({
      id: uuidv4(),
      sender_id: req.user!.id,
      sender_role: req.user!.role,
      message,
      created_at: new Date().toISOString(),
    });
    ticket.status = req.user!.role === 'PLAYER' ? 'IN_PROGRESS' : 'WAITING_FOR_USER';
    ticket.updated_at = new Date().toISOString();

    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/support/disputes
router.post('/disputes', authenticate, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { tournamentId, matchId, category, reason, evidenceUrl } = req.body;
    if (!reason || !category) {
      return res.status(400).json({ success: false, message: 'Reason and category are required' });
    }

    const disputeId = uuidv4();
    const disputeNumber = `DSP-${Date.now().toString().slice(-6)}`;

    const dispute: Dispute = {
      id: disputeId,
      dispute_number: disputeNumber,
      user_id: req.user!.id,
      category,
      tournament_id: tournamentId,
      match_id: matchId,
      reason,
      evidence_url: evidenceUrl,
      status: 'OPEN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.disputes.set(disputeId, dispute);

    AuditService.log({
      actorId: req.user!.id,
      actorRole: 'PLAYER',
      action: 'RAISE_DISPUTE',
      entity: 'disputes',
      entityId: disputeId,
      afterState: { category, reason },
    });

    res.status(201).json({ success: true, data: dispute });
  } catch (err) {
    next(err);
  }
});

export const supportRouter = router;
