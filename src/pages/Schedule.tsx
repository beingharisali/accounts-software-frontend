import { useState, useMemo } from 'react';
import { useBatches } from '@/context/BatchContext';
import { useStudents } from '@/context/StudentContext';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Calendar, Clock, MapPin, Users, GraduationCap } from 'lucide-react';
import { ROOMS, DAYS_OPTIONS } from '@/types/batch';

export default function Schedule() {
  const { batches } = useBatches();
  const { students } = useStudents();
  const [daysFilter, setDaysFilter] = useState<string>('all');
  const [roomFilter, setRoomFilter] = useState<string>('all');

  const activeBatches = useMemo(() => {
    return batches
      .filter(batch => {
        const isActive = batch.status === 'active';
        const matchesDays = daysFilter === 'all' || batch.days === daysFilter;
        const matchesRoom = roomFilter === 'all' || batch.room === roomFilter;
        return isActive && matchesDays && matchesRoom;
      })
      .sort((a, b) => a.timing.localeCompare(b.timing));
  }, [batches, daysFilter, roomFilter]);

  const getStudentCount = (batchNumber: string) => {
    return students.filter(s => s.batch === batchNumber && s.status !== 'DROP').length;
  };

  const getBatchStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/15 text-success';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      case 'freeze':
        return 'bg-warning/15 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header mb-1">Class Schedule</h1>
        <p className="text-sm text-muted-foreground">
          View active batches by days and rooms
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={daysFilter} onValueChange={setDaysFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Days</SelectItem>
            {DAYS_OPTIONS.map(day => (
              <SelectItem key={day} value={day}>{day}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={roomFilter} onValueChange={setRoomFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by Room" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rooms</SelectItem>
            {ROOMS.map(room => (
              <SelectItem key={room} value={room}>{room}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Schedule Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeBatches.map(batch => {
          const studentCount = getStudentCount(batch.batchNumber);
          return (
            <div 
              key={batch.id}
              className="bg-card rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-semibold text-primary">
                    {batch.batchNumber}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getBatchStatusColor(batch.status)}`}>
                    {batch.status.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{batch.course}</h3>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Trainer:</span>
                  <span className="font-medium">{batch.trainerName}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Days:</span>
                  <span className="font-medium">{batch.days}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Timing:</span>
                  <span className="font-medium">{batch.timing}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Room:</span>
                  <span className="font-medium">{batch.room}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Students:</span>
                  <span className="font-medium">{studentCount}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
                Started: {new Date(batch.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
          );
        })}
      </div>

      {activeBatches.length === 0 && (
        <div className="bg-card rounded-xl border border-border shadow-sm p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Active Batches</h3>
          <p className="text-muted-foreground">
            No active batches found matching your filter criteria
          </p>
        </div>
      )}

      {/* Room-wise Summary */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="section-header mb-0">Room-wise Schedule</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Active Batches</th>
                <th>Courses</th>
                <th>Total Students</th>
              </tr>
            </thead>
            <tbody>
              {ROOMS.map(room => {
                const roomBatches = batches.filter(b => b.room === room && b.status === 'active');
                const totalStudents = roomBatches.reduce((sum, b) => sum + getStudentCount(b.batchNumber), 0);
                const courses = [...new Set(roomBatches.map(b => b.course))];
                
                return (
                  <tr key={room}>
                    <td className="font-medium">{room}</td>
                    <td>
                      {roomBatches.length > 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {roomBatches.length}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td>
                      {courses.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {courses.map(course => (
                            <span 
                              key={course}
                              className="text-xs px-2 py-0.5 rounded bg-muted"
                            >
                              {course === 'Digital Marketing' ? 'DM' : 'WD'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td>{totalStudents || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
