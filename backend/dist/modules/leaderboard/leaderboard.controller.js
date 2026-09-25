"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderboardRouter = void 0;
const express_1 = require("express");
const data_store_1 = require("../../database/data-store");
const router = (0, express_1.Router)();
// GET /api/v1/leaderboard
router.get('/', (req, res) => {
    const { period } = req.query; // TODAY, WEEKLY, MONTHLY, ALL_TIME
    // Aggregate user profiles and sort by total earnings & wins
    const players = Array.from(data_store_1.store.profiles.values())
        .filter((p) => p.username !== 'SystemAdmin')
        .map((p) => ({
        userId: p.user_id,
        username: p.username,
        avatarUrl: p.avatar_url,
        ffIgn: p.ff_ign || p.username,
        totalTournaments: p.total_tournaments,
        totalWins: p.total_wins,
        totalEarnings: p.total_earnings,
        winRate: p.total_tournaments > 0 ? ((p.total_wins / p.total_tournaments) * 100).toFixed(1) + '%' : '0%',
    }))
        .sort((a, b) => b.totalEarnings - a.totalEarnings);
    // Assign ranks
    const rankedList = players.map((player, index) => ({
        rank: index + 1,
        ...player,
    }));
    res.json({
        success: true,
        data: {
            period: period || 'ALL_TIME',
            topPlayers: rankedList.slice(0, 50),
        },
    });
});
exports.leaderboardRouter = router;
