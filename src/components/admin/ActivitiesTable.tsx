'use client'

import { useState } from 'react'
import { Edit, Trash2, Calendar, Hash } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EditActivityDialog } from './EditActivityDialog'
import { DeleteActivityDialog } from './DeleteActivityDialog'
import type { Activity } from '@/app/admin/activities/page'

type ActivitiesTableProps = {
  activities: Activity[]
  onActivityUpdated: () => void
}

export function ActivitiesTable({ activities, onActivityUpdated }: ActivitiesTableProps) {
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Erstellt am</TableHead>
                  <TableHead>Verwendungen</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    {/* Name */}
                    <TableCell>
                      <p className="font-medium">{activity.name}</p>
                    </TableCell>

                    {/* Description */}
                    <TableCell>
                      {activity.description ? (
                        <p className="text-sm text-muted-foreground max-w-md truncate">
                          {activity.description}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Keine Beschreibung</p>
                      )}
                    </TableCell>

                    {/* Created At */}
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(activity.createdAt)}
                      </div>
                    </TableCell>

                    {/* Usage Count */}
                    <TableCell>
                      <Badge variant={activity.usageCount > 0 ? 'default' : 'secondary'}>
                        <Hash className="h-3 w-3 mr-1" />
                        {activity.usageCount} Zeiterfassungen
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingActivity(activity)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Bearbeiten
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeletingActivity(activity)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Löschen
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {activities.map((activity) => (
          <Card key={activity.id}>
            <CardContent className="p-4 space-y-4">
              {/* Activity Header */}
              <div>
                <p className="font-medium text-lg">{activity.name}</p>
                {activity.description && (
                  <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                )}
              </div>

              {/* Activity Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Erstellt am</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(activity.createdAt)}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Verwendungen</p>
                  <Badge variant={activity.usageCount > 0 ? 'default' : 'secondary'}>
                    <Hash className="h-3 w-3 mr-1" />
                    {activity.usageCount}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setEditingActivity(activity)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Bearbeiten
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => setDeletingActivity(activity)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Löschen
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingActivity && (
        <EditActivityDialog
          activity={editingActivity}
          open={!!editingActivity}
          onOpenChange={(open) => !open && setEditingActivity(null)}
          onActivityUpdated={() => {
            setEditingActivity(null)
            onActivityUpdated()
          }}
        />
      )}

      {/* Delete Dialog */}
      {deletingActivity && (
        <DeleteActivityDialog
          activity={deletingActivity}
          open={!!deletingActivity}
          onOpenChange={(open) => !open && setDeletingActivity(null)}
          onActivityDeleted={() => {
            setDeletingActivity(null)
            onActivityUpdated()
          }}
        />
      )}
    </>
  )
}
