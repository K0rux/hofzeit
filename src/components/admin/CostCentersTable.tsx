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
import { EditCostCenterDialog } from './EditCostCenterDialog'
import { DeleteCostCenterDialog } from './DeleteCostCenterDialog'
import type { CostCenter } from '@/app/admin/cost-centers/page'

type CostCentersTableProps = {
  costCenters: CostCenter[]
  onCostCenterUpdated: () => void
}

export function CostCentersTable({ costCenters, onCostCenterUpdated }: CostCentersTableProps) {
  const [editingCostCenter, setEditingCostCenter] = useState<CostCenter | null>(null)
  const [deletingCostCenter, setDeletingCostCenter] = useState<CostCenter | null>(null)

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
                  <TableHead>Nummer</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Erstellt am</TableHead>
                  <TableHead>Verwendungen</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costCenters.map((costCenter) => (
                  <TableRow key={costCenter.id}>
                    {/* Name */}
                    <TableCell>
                      <p className="font-medium">{costCenter.name}</p>
                    </TableCell>

                    {/* Number */}
                    <TableCell>
                      {costCenter.number ? (
                        <Badge variant="outline">{costCenter.number}</Badge>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">-</p>
                      )}
                    </TableCell>

                    {/* Description */}
                    <TableCell>
                      {costCenter.description ? (
                        <p className="text-sm text-muted-foreground max-w-md truncate">
                          {costCenter.description}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Keine Beschreibung</p>
                      )}
                    </TableCell>

                    {/* Created At */}
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(costCenter.createdAt)}
                      </div>
                    </TableCell>

                    {/* Usage Count */}
                    <TableCell>
                      <Badge variant={costCenter.usageCount > 0 ? 'default' : 'secondary'}>
                        <Hash className="h-3 w-3 mr-1" />
                        {costCenter.usageCount} Zeiterfassungen
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCostCenter(costCenter)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Bearbeiten
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeletingCostCenter(costCenter)}
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
        {costCenters.map((costCenter) => (
          <Card key={costCenter.id}>
            <CardContent className="p-4 space-y-4">
              {/* Cost Center Header */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-lg">{costCenter.name}</p>
                  {costCenter.number && <Badge variant="outline">{costCenter.number}</Badge>}
                </div>
                {costCenter.description && (
                  <p className="text-sm text-muted-foreground mt-1">{costCenter.description}</p>
                )}
              </div>

              {/* Cost Center Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Erstellt am</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(costCenter.createdAt)}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Verwendungen</p>
                  <Badge variant={costCenter.usageCount > 0 ? 'default' : 'secondary'}>
                    <Hash className="h-3 w-3 mr-1" />
                    {costCenter.usageCount}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setEditingCostCenter(costCenter)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Bearbeiten
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => setDeletingCostCenter(costCenter)}
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
      {editingCostCenter && (
        <EditCostCenterDialog
          costCenter={editingCostCenter}
          open={!!editingCostCenter}
          onOpenChange={(open) => !open && setEditingCostCenter(null)}
          onCostCenterUpdated={() => {
            setEditingCostCenter(null)
            onCostCenterUpdated()
          }}
        />
      )}

      {/* Delete Dialog */}
      {deletingCostCenter && (
        <DeleteCostCenterDialog
          costCenter={deletingCostCenter}
          open={!!deletingCostCenter}
          onOpenChange={(open) => !open && setDeletingCostCenter(null)}
          onCostCenterDeleted={() => {
            setDeletingCostCenter(null)
            onCostCenterUpdated()
          }}
        />
      )}
    </>
  )
}
