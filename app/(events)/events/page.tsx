'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/uis/card'
import { Badge } from '@/components/uis/badge'
import { Button } from '@/components/uis/button'
import { Input } from '@/components/uis/input'
import { Label } from '@/components/uis/label'
import { Textarea } from '@/components/uis/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/uis/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/uis/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/uis/tabs'
import {
  Calendar,
  Trophy,
  Users,
  Plus,
  X,
  Gamepad2,
  Clock,
  Coins,
  Crown,
  Target,
  Medal,
} from 'lucide-react'

type EventRule = 'winner-takes-all' | 'top-3' | 'participation' | 'score-based'

interface Participant {
  id: string
  name: string
  walletAddress: string
}

interface Event {
  id: string
  name: string
  description: string
  game: string
  date: string
  time: string
  entryFee: number
  prizePool: number
  maxParticipants: number
  rule: EventRule
  participants: Participant[]
  status: 'upcoming' | 'live' | 'completed'
}

const games = [
  { id: 'dodge-master', name: 'Dodge Master', icon: '🎯' },
  { id: 'catch-fruit', name: 'Catch the Fruit', icon: '🍎' },
  { id: 'rhythm-move', name: 'Rhythm Move', icon: '🎵' },
  { id: 'fitness-challenge', name: 'Fitness Challenge', icon: '💪' },
  { id: 'punch-targets', name: 'Punch the Targets', icon: '🥊' },
  { id: 'flappy-arms', name: 'Flappy Arms', icon: '🦅' },
]

const eventRules = [
  {
    id: 'winner-takes-all',
    name: 'Winner Takes All',
    description: '1st place wins 100% of the prize pool',
    icon: Crown,
    distribution: '100% to winner',
  },
  {
    id: 'top-3',
    name: 'Top 3 Split',
    description: 'Prize split: 50% / 30% / 20%',
    icon: Medal,
    distribution: '50% / 30% / 20%',
  },
  {
    id: 'participation',
    name: 'Participation Rewards',
    description: 'All players earn based on performance',
    icon: Users,
    distribution: 'Performance based',
  },
  {
    id: 'score-based',
    name: 'Score Multiplier',
    description: 'Rewards proportional to score',
    icon: Target,
    distribution: 'Score weighted',
  },
]

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      name: 'Friday Night Dodge Showdown',
      description: 'Compete against the best dodge players for the grand prize!',
      game: 'dodge-master',
      date: '2026-02-21',
      time: '20:00',
      entryFee: 0.5,
      prizePool: 25,
      maxParticipants: 50,
      rule: 'winner-takes-all',
      participants: [
        { id: '1', name: 'Player1', walletAddress: '0x742d...4a8f' },
        { id: '2', name: 'ProGamer', walletAddress: '0x123d...9a2c' },
      ],
      status: 'upcoming',
    },
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [newEventData, setNewEventData] = useState({
    name: '',
    description: '',
    game: '',
    date: '',
    time: '',
    entryFee: '',
    maxParticipants: '',
    rule: '' as EventRule,
  })
  const [newParticipant, setNewParticipant] = useState({ name: '', walletAddress: '' })

  const handleCreateEvent = () => {
    if (!newEventData.name || !newEventData.game || !newEventData.rule) return

    const prizePool = parseFloat(newEventData.entryFee) * parseInt(newEventData.maxParticipants) * 0.95

    const event: Event = {
      id: Date.now().toString(),
      name: newEventData.name,
      description: newEventData.description,
      game: newEventData.game,
      date: newEventData.date,
      time: newEventData.time,
      entryFee: parseFloat(newEventData.entryFee) || 0,
      prizePool: prizePool || 0,
      maxParticipants: parseInt(newEventData.maxParticipants) || 20,
      rule: newEventData.rule,
      participants: [],
      status: 'upcoming',
    }

    setEvents([...events, event])
    setIsCreateDialogOpen(false)
    setNewEventData({
      name: '',
      description: '',
      game: '',
      date: '',
      time: '',
      entryFee: '',
      maxParticipants: '',
      rule: '' as EventRule,
    })
  }

  const handleAddParticipant = (eventId: string) => {
    if (!newParticipant.name || !newParticipant.walletAddress) return

    setEvents(
      events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              participants: [
                ...event.participants,
                {
                  id: Date.now().toString(),
                  name: newParticipant.name,
                  walletAddress: newParticipant.walletAddress,
                },
              ],
            }
          : event
      )
    )
    setNewParticipant({ name: '', walletAddress: '' })
  }

  const handleRemoveParticipant = (eventId: string, participantId: string) => {
    setEvents(
      events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              participants: event.participants.filter((p) => p.id !== participantId),
            }
          : event
      )
    )
  }

  const getGameInfo = (gameId: string) => games.find((g) => g.id === gameId)
  const getRuleInfo = (ruleId: EventRule) => eventRules.find((r) => r.id === ruleId)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
      case 'live':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
      case 'completed':
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-balance mb-2">Events</h1>
              <p className="text-muted-foreground text-pretty">
                Create and join competitive gaming events with real prizes
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>
                    Set up a competitive event with custom rules and prizes
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-name">Event Name</Label>
                    <Input
                      id="event-name"
                      placeholder="Friday Night Tournament"
                      value={newEventData.name}
                      onChange={(e) => setNewEventData({ ...newEventData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your event..."
                      value={newEventData.description}
                      onChange={(e) =>
                        setNewEventData({ ...newEventData, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="game">Game</Label>
                      <Select
                        value={newEventData.game}
                        onValueChange={(value: string) => setNewEventData({ ...newEventData, game: value })}
                      >
                        <SelectTrigger id="game">
                          <SelectValue placeholder="Select game" />
                        </SelectTrigger>
                        <SelectContent>
                          {games.map((game) => (
                            <SelectItem key={game.id} value={game.id}>
                              {game.icon} {game.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rule">Prize Rule</Label>
                      <Select
                        value={newEventData.rule}
                        onValueChange={(value: string) =>
                          setNewEventData({ ...newEventData, rule: value as EventRule })
                        }
                      >
                        <SelectTrigger id="rule">
                          <SelectValue placeholder="Select rule" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventRules.map((rule) => (
                            <SelectItem key={rule.id} value={rule.id}>
                              {rule.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Start Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEventData.date}
                        onChange={(e) => setNewEventData({ ...newEventData, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Start Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newEventData.time}
                        onChange={(e) => setNewEventData({ ...newEventData, time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Finish Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEventData.date}
                        onChange={(e) => setNewEventData({ ...newEventData, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Finish Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newEventData.time}
                        onChange={(e) => setNewEventData({ ...newEventData, time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="entry-fee">Entry Fee (SOL)</Label>
                      <Input
                        id="entry-fee"
                        type="number"
                        step="0.1"
                        placeholder="0.5"
                        value={newEventData.entryFee}
                        onChange={(e) =>
                          setNewEventData({ ...newEventData, entryFee: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-participants">Max Participants</Label>
                      <Input
                        id="max-participants"
                        type="number"
                        placeholder="50"
                        value={newEventData.maxParticipants}
                        onChange={(e) =>
                          setNewEventData({ ...newEventData, maxParticipants: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  {newEventData.rule && (
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {getRuleInfo(newEventData.rule) && (
                            <>
                              {(() => {
                                const RuleIcon = getRuleInfo(newEventData.rule)!.icon
                                return <RuleIcon className="h-5 w-5 text-primary mt-0.5" />
                              })()}
                              <div className="flex-1">
                                <h4 className="font-medium">
                                  {getRuleInfo(newEventData.rule)!.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {getRuleInfo(newEventData.rule)!.description}
                                </p>
                                <p className="text-sm font-medium text-primary mt-1">
                                  Distribution: {getRuleInfo(newEventData.rule)!.distribution}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <Button onClick={handleCreateEvent} className="w-full">
                    Create Event
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {['upcoming', 'live', 'completed'].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {events.filter((e) => e.status === status).length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No {status} events</p>
                  </CardContent>
                </Card>
              ) : (
                events
                  .filter((e) => e.status === status)
                  .map((event) => {
                    const game = getGameInfo(event.game)
                    const rule = getRuleInfo(event.rule)
                    return (
                      <Card key={event.id} className="overflow-hidden">
                        <div className="grid md:grid-cols-3 gap-0">
                          {/* Left Section - Event Info */}
                          <div className="md:col-span-2 p-6 border-r">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-2xl font-bold text-balance">{event.name}</h3>
                                  <Badge className={`border ${getStatusColor(event.status)}`}>
                                    {event.status}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground text-pretty mb-4">
                                  {event.description}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                  <div className="flex items-center gap-2">
                                    <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                      {game?.icon} {game?.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                      {event.date} at {event.time}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                      {event.participants.length} / {event.maxParticipants}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Prize Rule Info */}
                            {rule && (
                              <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-3">
                                    {(() => {
                                      const RuleIcon = rule.icon
                                      return <RuleIcon className="h-5 w-5 text-primary" />
                                    })()}
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-sm">{rule.name}</h4>
                                      <p className="text-xs text-muted-foreground">
                                        {rule.description}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-2xl font-bold text-primary">
                                        {event.prizePool.toFixed(2)} SOL
                                      </div>
                                      <div className="text-xs text-muted-foreground">Prize Pool</div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>

                          {/* Right Section - Participants */}
                          <div className="p-6 bg-muted/30">
                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Participants ({event.participants.length})
                            </h4>

                            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                              {event.participants.map((participant) => (
                                <div
                                  key={participant.id}
                                  className="flex items-center justify-between gap-2 p-2 bg-background rounded-lg"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">{participant.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {participant.walletAddress}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveParticipant(event.id, participant.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>

                            {event.participants.length < event.maxParticipants && (
                              <div className="space-y-2">
                                <Input
                                  placeholder="Player name"
                                  value={newParticipant.name}
                                  onChange={(e) =>
                                    setNewParticipant({ ...newParticipant, name: e.target.value })
                                  }
                                />
                                <Input
                                  placeholder="Wallet address"
                                  value={newParticipant.walletAddress}
                                  onChange={(e) =>
                                    setNewParticipant({
                                      ...newParticipant,
                                      walletAddress: e.target.value,
                                    })
                                  }
                                />
                                <Button
                                  className="w-full"
                                  size="sm"
                                  onClick={() => handleAddParticipant(event.id)}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Participant
                                </Button>
                              </div>
                            )}

                            <div className="mt-4 p-3 bg-background rounded-lg border">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Entry Fee</span>
                                <span className="font-semibold">{event.entryFee} SOL</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
