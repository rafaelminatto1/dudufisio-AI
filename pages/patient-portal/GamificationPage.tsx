
// pages/patient-portal/GamificationPage.tsx
import React from 'react';
import PageHeader from '../../components/PageHeader';
import { useAuth } from "../../contexts/AppContext";
import { useGamification } from '../../hooks/useGamification';
import { Skeleton } from '../../components/ui/skeleton';
import LevelProgress from '../../components/patient-portal/gamification/LevelProgress';
import StreakTracker from '../../components/patient-portal/gamification/StreakTracker';
import AchievementCard from '../../components/patient-portal/gamification/AchievementCard';
import PointsBreakdown from '../../components/patient-portal/gamification/PointsBreakdown';
import ChallengeCard from '../../components/patient-portal/gamification/ChallengeCard';
import RewardCard from '../../components/patient-portal/gamification/RewardCard';
import Leaderboard from '../../components/patient-portal/gamification/Leaderboard';
import RecentActivityList from '../../components/patient-portal/gamification/RecentActivityList';

const GamificationPage: React.FC = () => {
    const { user } = useAuth();
    const { progress, isLoading } = useGamification(user?.patientId || '');

    if (isLoading || !progress) {
        return (
            <>
                <PageHeader title="Meu Engajamento" subtitle="Acompanhe seu progresso e conquistas no tratamento." />
                <Skeleton className="h-24 w-full rounded-2xl mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
                </div>
            </>
        );
    }
    
    const {
        level,
        points,
        xpForNextLevel,
        pointsTowardsLevel,
        streak,
        achievements,
        pointsBreakdown,
        activeChallenges,
        completedChallenges,
        availableRewards,
        unlockedRewards,
        leaderboard,
        nextMilestone,
        recentActivities,
    } = progress;

    const unlockedAchievements = achievements.filter(a => a.unlocked);
    const availableRewardsMerged = [...availableRewards, ...unlockedRewards];

    return (
        <>
            <PageHeader
                title="Meu Engajamento"
                subtitle="Sua jornada de recuperação gamificada para te manter no caminho certo!"
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <LevelProgress
                    level={level}
                    totalPoints={points}
                    pointsTowardsLevel={pointsTowardsLevel}
                    xpForNextLevel={xpForNextLevel}
                />
                <StreakTracker streak={streak} />
                <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col justify-center">
                    <h3 className="text-lg font-semibold text-slate-800">Próxima recompensa</h3>
                    <p className="text-sm text-slate-500 mt-1">{nextMilestone.description}</p>
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Meta</span>
                            <span>{points} / {nextMilestone.targetPoints} pts</span>
                        </div>
                        <div className="w-full h-3 bg-slate-200 rounded-full">
                            <div
                                className="h-3 bg-teal-500 rounded-full"
                                style={{ width: `${Math.min(100, ((nextMilestone.targetPoints - nextMilestone.pointsRemaining) / nextMilestone.targetPoints) * 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 text-right mt-1">
                            Faltam {Math.max(0, nextMilestone.pointsRemaining)} pts
                        </p>
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-sm text-slate-600">Conquistas desbloqueadas</p>
                        <p className="text-3xl font-bold text-teal-500">{unlockedAchievements.length} / {achievements.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <PointsBreakdown items={pointsBreakdown} />
                <RecentActivityList activities={recentActivities} />
            </div>

            {!!activeChallenges.length && (
                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Desafios em andamento</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activeChallenges.map(challenge => (
                            <ChallengeCard key={challenge.id} challenge={challenge} />
                        ))}
                    </div>
                </section>
            )}

            {!!completedChallenges.length && (
                <section className="mb-8">
                    <h3 className="text-lg font-semibold text-slate-700 mb-3">Desafios concluídos recentemente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {completedChallenges.map(challenge => (
                            <ChallengeCard key={challenge.id} challenge={challenge} />
                        ))}
                    </div>
                </section>
            )}

            {!!availableRewardsMerged.length && (
                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Recompensas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableRewardsMerged.map(reward => (
                            <RewardCard key={reward.id} reward={reward} />
                        ))}
                    </div>
                </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Leaderboard entries={leaderboard} highlightPatientId={user?.patientId ?? undefined} />
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Resumo de conquistas</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {achievements.slice(0, 4).map(achievement => (
                            <AchievementCard key={achievement.id} achievement={achievement} />
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Galeria de Conquistas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {achievements.map(ach => (
                        <AchievementCard key={ach.id} achievement={ach} />
                    ))}
                </div>
            </div>
        </>
    );
};

export default GamificationPage;
