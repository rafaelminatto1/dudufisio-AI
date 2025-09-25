import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Calendar,
  Clock,
  TrendingUp,
  MessageSquare,
  Activity,
  Target,
  ChevronRight,
  Bell,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { PatientDashboard as PatientDashboardData, PatientId } from '../../types/checkin';
import { PatientPortalService } from '../../lib/patient-portal/PatientPortalService';

interface PatientDashboardProps {
  patientId: PatientId;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ patientId }) => {
  const [dashboardData, setDashboardData] = useState<PatientDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const portalService = new PatientPortalService();

  useEffect(() => {
    loadDashboard();
  }, [patientId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await portalService.getPatientDashboard(patientId);
      setDashboardData(data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">{error || 'No data available'}</p>
        <Button onClick={loadDashboard} className="mt-4">Try Again</Button>
      </div>
    );
  }

  const {
    upcomingAppointments,
    recentSessions,
    treatmentProgress,
    prescribedExercises,
    unreadMessages,
    nextAppointment,
    progressSummary
  } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
        <p className="opacity-90">Here's your treatment progress and upcoming activities.</p>
      </div>

      {/* Next Appointment Card */}
      {nextAppointment && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Next Appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">
                  {nextAppointment.scheduledTime.toLocaleDateString()} at{' '}
                  {nextAppointment.scheduledTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-sm text-gray-600">{nextAppointment.type}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Duration: {nextAppointment.duration} minutes
                </p>
              </div>
              <Button>
                Check-in
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pain Level</p>
                <p className="text-2xl font-bold">{treatmentProgress.painLevel}/10</p>
              </div>
              <Activity className="h-8 w-8 text-red-500" />
            </div>
            <div className="mt-2">
              <Progress
                value={(10 - treatmentProgress.painLevel) * 10}
                className="h-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                {progressSummary.painReduction.toFixed(0)}% improvement
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mobility</p>
                <p className="text-2xl font-bold">{treatmentProgress.mobilityScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Progress value={treatmentProgress.mobilityScore} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {progressSummary.mobilityIncrease.toFixed(0)}% mobility
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Adherence</p>
                <p className="text-2xl font-bold">{progressSummary.adherenceRate}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Progress value={progressSummary.adherenceRate} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                Exercise compliance
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-2xl font-bold">{unreadMessages.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {unreadMessages.length > 0 ? 'Unread messages' : 'All caught up!'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Exercises */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Today's Exercises
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {prescribedExercises.slice(0, 3).map((exercise) => (
              <div key={exercise.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{exercise.name}</h4>
                  <p className="text-sm text-gray-600">
                    {exercise.sets} sets × {exercise.reps} reps
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {exercise.difficulty}
                  </Badge>
                </div>
                <Button size="sm" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              </div>
            ))}
            <Button className="w-full" variant="outline">
              View All Exercises
            </Button>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
              {unreadMessages.length > 0 && (
                <Badge variant="destructive">{unreadMessages.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unreadMessages.slice(0, 3).map((message) => (
              <div key={message.id} className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{message.from}</p>
                    <p className="text-sm text-gray-800 mt-1">{message.subject}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                  {!message.read && (
                    <Badge variant="destructive" className="ml-2">New</Badge>
                  )}
                </div>
              </div>
            ))}
            <Button className="w-full" variant="outline">
              View All Messages
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Treatment Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Treatment Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {treatmentProgress.goals.map((goal, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                {goal.achieved ? (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
                <span className={goal.achieved ? 'text-green-700 line-through' : ''}>
                  {goal.description}
                </span>
                <Badge variant={goal.achieved ? 'default' : 'secondary'} className="ml-auto">
                  {goal.achieved ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
            ))}
          </div>

          {progressSummary.nextGoals.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Next Goals:</h4>
              <ul className="list-disc list-inside space-y-1">
                {progressSummary.nextGoals.map((goal, index) => (
                  <li key={index} className="text-sm text-gray-700">{goal}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Sessions Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSessions.slice(0, 3).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{session.date.toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">
                    {session.therapistNotes || 'Treatment session completed'}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500">
                      Duration: {session.duration}min
                    </span>
                    {session.painLevel && (
                      <span className="text-xs text-gray-500">
                        Pain: {session.painLevel}/10
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant="outline">Completed</Badge>
              </div>
            ))}
            <Button className="w-full" variant="outline">
              View Treatment History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {progressSummary.completedExercises}
            </p>
            <p className="text-sm text-gray-600">Sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {progressSummary.overallImprovement.toFixed(0)}%
            </p>
            <p className="text-sm text-gray-600">Improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {upcomingAppointments.length}
            </p>
            <p className="text-sm text-gray-600">Upcoming</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {treatmentProgress.goals.filter(g => g.achieved).length}
            </p>
            <p className="text-sm text-gray-600">Goals Met</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};