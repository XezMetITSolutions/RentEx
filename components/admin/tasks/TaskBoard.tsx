/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
    Plus,
    Clock,
    CheckCircle,
    PlayCircle,
    Circle,
    Search,
    X,
    Filter,
    AlertTriangle,
    RotateCcw,
    LayoutGrid,
    List,
    Car,
    User,
    Calendar,
    ArrowUpRight,
    Edit2,
    Trash2
} from 'lucide-react';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal';
import { updateTaskStatus, deleteTask } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';

interface CarItem {
    id: number;
    brand: string;
    model: string;
    plate: string;
}

interface StaffItem {
    id: number;
    name: string;
    role: string;
}

interface TaskBoardProps {
    initialTasks: any[];
    cars?: CarItem[];
    staffMembers?: StaffItem[];
}

export default function TaskBoard({ initialTasks, cars = [], staffMembers = [] }: TaskBoardProps) {
    const [tasks, setTasks] = useState(initialTasks);
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
    const [onlyOverdue, setOnlyOverdue] = useState(false);
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

    // Create Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createModalStatus, setCreateModalStatus] = useState<string>('todo');

    // Edit Modal state for list view
    const [editingTask, setEditingTask] = useState<any | null>(null);

    const router = useRouter();

    // Avoid hydration mismatch by only rendering dnd after mount
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    // Unique assignees for filter
    const assignees = useMemo(() => {
        const set = new Set<string>();
        tasks.forEach(t => {
            if (t.assignedTo) set.add(t.assignedTo);
        });
        return Array.from(set).sort();
    }, [tasks]);

    // Filtered tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch =
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (task.assignedTo && task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (task.car && (
                    task.car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    task.car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    task.car.plate.toLowerCase().includes(searchQuery.toLowerCase())
                ));

            const matchesPriority =
                priorityFilter === 'all' || task.priority === priorityFilter;

            const matchesAssignee =
                assigneeFilter === 'all' ||
                (assigneeFilter === 'unassigned' && !task.assignedTo) ||
                task.assignedTo === assigneeFilter;

            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
            const matchesOverdue = !onlyOverdue || isOverdue;

            return matchesSearch && matchesPriority && matchesAssignee && matchesOverdue;
        });
    }, [tasks, searchQuery, priorityFilter, assigneeFilter, onlyOverdue]);

    // Stats calculations
    const stats = useMemo(() => {
        const total = tasks.length;
        const todo = tasks.filter(t => t.status === 'todo').length;
        const inProgress = tasks.filter(t => t.status === 'in_progress').length;
        const done = tasks.filter(t => t.status === 'done').length;
        const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;

        return { total, todo, inProgress, done, overdue };
    }, [tasks]);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const taskId = parseInt(draggableId, 10);
        const newStatus = destination.droppableId;

        // Optimistic UI update
        const updatedTasks = tasks.map(t => 
            t.id === taskId ? { ...t, status: newStatus } : t
        );
        setTasks(updatedTasks);

        try {
            const res = await updateTaskStatus(taskId, newStatus);
            if (res && 'error' in res && res.error) {
                throw new Error(res.error);
            }
            router.refresh();
        } catch (error: any) {
            console.error('Failed to update task status:', error);
            setTasks(initialTasks);
            toast.error(error.message || 'Fehler beim Aktualisieren des Status');
        }
    };

    const handleOpenCreateModal = (status = 'todo') => {
        setCreateModalStatus(status);
        setIsCreateModalOpen(true);
    };

    const handleTaskCreated = (newTask: any) => {
        setTasks(prev => [newTask, ...prev]);
    };

    const handleTaskDeleted = (taskId: number) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
    };

    const handleTaskUpdated = (updatedTask: any) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t));
    };

    const columns = [
        { 
            id: 'todo', 
            title: 'Zu erledigen', 
            color: 'bg-slate-400', 
            badgeColor: 'bg-hm-paper-2 text-hm-muted border border-hm-rule',
            icon: Circle 
        },
        { 
            id: 'in_progress', 
            title: 'In Bearbeitung', 
            color: 'bg-blue-500', 
            badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20',
            icon: PlayCircle 
        },
        { 
            id: 'done', 
            title: 'Erledigt', 
            color: 'bg-emerald-500', 
            badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
            icon: CheckCircle 
        }
    ];

    const hasActiveFilters = searchQuery !== '' || priorityFilter !== 'all' || assigneeFilter !== 'all' || onlyOverdue;

    if (!isMounted) return null;

    return (
        <div className="space-y-6">
            {/* Top KPI Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] p-4 border border-hm-rule shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-hm-muted">Aufgaben Gesamt</span>
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                            <Circle className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-hm-ink mt-2 font-mono">{stats.total}</p>
                    <p className="text-xs text-hm-muted mt-1">
                        {stats.todo} offen · {stats.inProgress} in Arbeit
                    </p>
                </div>

                <div className={clsx(
                    "bg-hm-paper rounded-[var(--hm-radius-card)] p-4 border shadow-sm transition-all",
                    stats.overdue > 0 ? "border-red-500/40 bg-red-500/5" : "border-hm-rule"
                )}>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-hm-muted">Überfällig</span>
                        <div className={clsx(
                            "p-2 rounded-lg",
                            stats.overdue > 0 ? "bg-red-500/10 text-red-600 animate-pulse" : "bg-hm-paper-2 text-hm-muted"
                        )}>
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                    </div>
                    <p className={clsx(
                        "text-2xl font-bold mt-2 font-mono",
                        stats.overdue > 0 ? "text-red-600 dark:text-red-400" : "text-hm-ink"
                    )}>
                        {stats.overdue}
                    </p>
                    <p className="text-xs text-hm-muted mt-1">
                        {stats.overdue > 0 ? "Erfordert sofortige Aufmerksamkeit" : "Alle Fristen eingehalten"}
                    </p>
                </div>

                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] p-4 border border-hm-rule shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-hm-muted">In Bearbeitung</span>
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                            <PlayCircle className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-hm-ink mt-2 font-mono">{stats.inProgress}</p>
                    <p className="text-xs text-hm-muted mt-1">
                        Aktive Team-Workflows
                    </p>
                </div>

                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] p-4 border border-hm-rule shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-hm-muted">Erledigt</span>
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                            <CheckCircle className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-hm-ink mt-2 font-mono">{stats.done}</p>
                    <p className="text-xs text-hm-muted mt-1">
                        Erfolgreich abgeschlossen
                    </p>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-hm-paper rounded-[var(--hm-radius-card)] p-4 border border-hm-rule shadow-sm space-y-3">
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hm-muted" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Aufgaben durchsuchen (Titel, Person, Fahrzeug)..."
                            className="w-full h-10 pl-10 pr-4 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 text-hm-ink placeholder:text-hm-muted text-sm focus:outline-none focus:border-hm-accent focus:ring-1 focus:ring-hm-accent transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-hm-muted hover:text-hm-ink p-1"
                                title="Suche leeren"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Priority Filter */}
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="h-9 px-3 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 text-hm-ink text-xs font-medium focus:outline-none focus:border-hm-accent"
                        >
                            <option value="all">Alle Prioritäten</option>
                            <option value="urgent">Nur Dringend 🚨</option>
                            <option value="high">Nur Hoch</option>
                            <option value="medium">Nur Mittel</option>
                            <option value="low">Nur Gering</option>
                        </select>

                        {/* Assignee Filter */}
                        {assignees.length > 0 && (
                            <select
                                value={assigneeFilter}
                                onChange={(e) => setAssigneeFilter(e.target.value)}
                                className="h-9 px-3 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 text-hm-ink text-xs font-medium focus:outline-none focus:border-hm-accent"
                            >
                                <option value="all">Alle Zuständigen</option>
                                <option value="unassigned">— Unzugewiesen —</option>
                                {assignees.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        )}

                        {/* Overdue toggle */}
                        <button
                            onClick={() => setOnlyOverdue(!onlyOverdue)}
                            className={clsx(
                                "h-9 px-3 rounded-[var(--hm-radius-input)] border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                                onlyOverdue
                                    ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
                                    : "bg-hm-paper-2 text-hm-muted border-hm-rule hover:text-hm-ink"
                            )}
                        >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Überfällig ({stats.overdue})</span>
                        </button>

                        {/* View Mode Toggle */}
                        <div className="inline-flex rounded-[var(--hm-radius-input)] p-1 bg-hm-paper-2 border border-hm-rule">
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={clsx(
                                    "p-1.5 rounded-md transition-all",
                                    viewMode === 'kanban'
                                        ? "bg-hm-paper text-hm-ink shadow-xs"
                                        : "text-hm-muted hover:text-hm-ink"
                                )}
                                title="Kanban-Board"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={clsx(
                                    "p-1.5 rounded-md transition-all",
                                    viewMode === 'list'
                                        ? "bg-hm-paper text-hm-ink shadow-xs"
                                        : "text-hm-muted hover:text-hm-ink"
                                )}
                                title="Tabellenansicht"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Reset Filter Button */}
                        {hasActiveFilters && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setPriorityFilter('all');
                                    setAssigneeFilter('all');
                                    setOnlyOverdue(false);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[var(--hm-radius-input)] text-xs text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 transition-all cursor-pointer"
                                title="Filter zurücksetzen"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Kanban or List Mode */}
            {viewMode === 'kanban' ? (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        {columns.map(column => {
                            const columnTasks = filteredTasks.filter(t => t.status === column.id);

                            return (
                                <div 
                                    key={column.id} 
                                    className="flex flex-col bg-hm-paper-2/60 dark:bg-zinc-900/40 rounded-[var(--hm-radius-card)] p-4 border border-hm-rule shadow-xs"
                                >
                                    {/* Column Header with WORKING + BUTTON */}
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                                            <h3 className="font-bold text-hm-ink text-sm uppercase tracking-tight">
                                                {column.title}
                                            </h3>
                                            <span className={clsx(
                                                "px-2 py-0.5 rounded-full text-[11px] font-mono font-bold",
                                                column.badgeColor
                                            )}>
                                                {columnTasks.length}
                                            </span>
                                        </div>

                                        {/* Working Column Add Button */}
                                        <button 
                                            onClick={() => handleOpenCreateModal(column.id)}
                                            className="text-hm-muted hover:text-hm-ink p-1.5 hover:bg-hm-paper rounded-[var(--hm-radius-input)] transition-all cursor-pointer border border-transparent hover:border-hm-rule shadow-2xs"
                                            title={`Neue Aufgabe in "${column.title}" erstellen`}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    
                                    <Droppable droppableId={column.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={clsx(
                                                    "flex-1 overflow-y-auto pr-1 min-h-[160px] transition-colors rounded-xl p-1",
                                                    snapshot.isDraggingOver
                                                        ? "bg-blue-500/5 border-2 border-dashed border-blue-500/30"
                                                        : ""
                                                )}
                                            >
                                                {columnTasks.length === 0 ? (
                                                    <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-hm-rule rounded-xl text-hm-muted">
                                                        <span className="text-xs">Keine Aufgaben</span>
                                                        <button
                                                            onClick={() => handleOpenCreateModal(column.id)}
                                                            className="mt-2 text-[11px] font-semibold text-hm-accent hover:underline flex items-center gap-1"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                            <span>Aufgabe hinzufügen</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    columnTasks.map((task, index) => (
                                                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={clsx(
                                                                        "transition-all",
                                                                        snapshot.isDragging && "rotate-2 scale-102 z-50 shadow-2xl"
                                                                    )}
                                                                >
                                                                    <TaskCard 
                                                                        task={task} 
                                                                        onTaskDeleted={handleTaskDeleted}
                                                                        onTaskUpdated={handleTaskUpdated}
                                                                    />
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))
                                                )}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            );
                        })}
                    </div>
                </DragDropContext>
            ) : (
                /* List / Table Mode */
                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-hm-paper-2 border-b border-hm-rule text-hm-muted uppercase tracking-wider font-mono">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Titel & Beschreibung</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold">Priorität</th>
                                    <th className="px-4 py-3 font-semibold">Zuständig</th>
                                    <th className="px-4 py-3 font-semibold">Fällig</th>
                                    <th className="px-4 py-3 font-semibold">Fahrzeug</th>
                                    <th className="px-4 py-3 font-semibold text-right">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hm-rule">
                                {filteredTasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-hm-muted">
                                            Keine passenden Aufgaben gefunden.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTasks.map(task => {
                                        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

                                        return (
                                            <tr key={task.id} className="hover:bg-hm-paper-2/40 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <div className="font-bold text-hm-ink text-sm">{task.title}</div>
                                                    {task.description && (
                                                        <div className="text-hm-muted text-xs line-clamp-1 mt-0.5">
                                                            {task.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className={clsx(
                                                        "px-2.5 py-1 rounded-full text-[10px] font-semibold border",
                                                        task.status === 'done' ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" :
                                                        task.status === 'in_progress' ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" :
                                                        "bg-hm-paper-2 text-hm-muted border-hm-rule"
                                                    )}>
                                                        {task.status === 'done' ? 'Erledigt' : task.status === 'in_progress' ? 'In Bearbeitung' : 'Zu erledigen'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className={clsx(
                                                        "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase",
                                                        task.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                                        task.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                                        task.priority === 'low' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                    )}>
                                                        {task.priority || 'Normal'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-hm-ink font-medium">
                                                    {task.assignedTo || <span className="text-hm-muted italic">Unzugewiesen</span>}
                                                </td>
                                                <td className="px-4 py-3.5 font-mono">
                                                    {task.dueDate ? (
                                                        <span className={clsx(
                                                            isOverdue ? "text-red-600 font-bold" : "text-hm-muted"
                                                        )}>
                                                            {format(new Date(task.dueDate), 'dd.MM.yyyy', { locale: de })}
                                                        </span>
                                                    ) : (
                                                        <span className="text-hm-muted">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    {task.car ? (
                                                        <Link
                                                            href={`/admin/fleet/${task.car.id}`}
                                                            className="text-hm-accent hover:underline font-medium inline-flex items-center gap-1"
                                                        >
                                                            <span>{task.car.brand} {task.car.model}</span>
                                                            <ArrowUpRight className="w-3 h-3" />
                                                        </Link>
                                                    ) : (
                                                        <span className="text-hm-muted">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => setEditingTask(task)}
                                                            className="p-1.5 text-hm-muted hover:text-hm-ink rounded-md hover:bg-hm-paper-2"
                                                            title="Bearbeiten"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Quick Task Creation Modal */}
            {isCreateModalOpen && (
                <CreateTaskModal
                    defaultStatus={createModalStatus}
                    cars={cars}
                    staffMembers={staffMembers}
                    onClose={() => setIsCreateModalOpen(false)}
                    onTaskCreated={handleTaskCreated}
                />
            )}

            {/* Edit Task Modal for List View */}
            {editingTask && (
                <EditTaskModal
                    task={editingTask}
                    onClose={() => setEditingTask(null)}
                    onTaskDeleted={handleTaskDeleted}
                    onTaskUpdated={handleTaskUpdated}
                />
            )}
        </div>
    );
}
