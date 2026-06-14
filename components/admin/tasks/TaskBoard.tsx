'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import TaskCard from './TaskCard';
import { updateTaskStatus } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface TaskBoardProps {
    initialTasks: any[];
}

export default function TaskBoard({ initialTasks }: TaskBoardProps) {
    const [tasks, setTasks] = useState(initialTasks);
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [assigneeFilter, setAssigneeFilter] = useState('all');
    
    const router = useRouter();

    // Avoid hydration mismatch by only rendering dnd after mount
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

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
        const newStatus = destination.droppableId; // status is our droppableId

        // Optimistic UI update
        const updatedTasks = tasks.map(t => 
            t.id === taskId ? { ...t, status: newStatus } : t
        );
        setTasks(updatedTasks);

        try {
            await updateTaskStatus(taskId, newStatus);
            router.refresh();
        } catch (error) {
            console.error('Failed to update task status:', error);
            // Rollback on error
            setTasks(initialTasks);
            toast.error('Fehler beim Aktualisieren des Status');
        }
    };

    if (!isMounted) return null;

    // Unique assignees for filter options
    const uniqueAssignees = Array.from(
        new Set(initialTasks.map(t => t.assignedTo).filter(Boolean))
    ) as string[];

    // Filter tasks based on filters and search
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = 
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (task.car && `${task.car.brand} ${task.car.model} ${task.car.plate}`.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesPriority = priorityFilter === 'all' || task.priority?.toLowerCase() === priorityFilter.toLowerCase();
        
        const matchesAssignee = assigneeFilter === 'all' || 
            (assigneeFilter === 'unassigned' && !task.assignedTo) ||
            task.assignedTo === assigneeFilter;
            
        return matchesSearch && matchesPriority && matchesAssignee;
    });

    const getColumnTasks = (status: string) => filteredTasks.filter(t => t.status === status);

    const columns = [
        { id: 'todo', title: 'Zu erledigen', color: 'bg-slate-400/80', badgeColor: 'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-400 border border-slate-205/10' },
        { id: 'in_progress', title: 'In Bearbeitung', color: 'bg-indigo-550', badgeColor: 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-405 border border-indigo-205/10' },
        { id: 'done', title: 'Erledigt', color: 'bg-emerald-550', badgeColor: 'bg-emerald-55 text-emerald-650 dark:bg-emerald-950/40 dark:text-emerald-405 border border-emerald-205/10' }
    ];

    return (
        <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
            {/* Filter Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-900 p-4.5 rounded-3xl border border-gray-100/80 dark:border-gray-800/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Aufgaben suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 dark:bg-gray-850 border border-gray-100/50 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500/30 focus:ring-2 focus:ring-indigo-500/5 rounded-2xl text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 outline-none transition-all"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-550 uppercase tracking-wider">Priorität:</span>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="bg-gray-50/50 dark:bg-gray-850 text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-100/50 dark:border-gray-800 rounded-xl px-3 py-2.5 focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500/30 outline-none cursor-pointer transition-all"
                        >
                            <option value="all">Alle</option>
                            <option value="low">Gering</option>
                            <option value="medium">Mittel</option>
                            <option value="high">Hoch</option>
                            <option value="urgent">Dringend</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-550 uppercase tracking-wider">Zuweisung:</span>
                        <select
                            value={assigneeFilter}
                            onChange={(e) => setAssigneeFilter(e.target.value)}
                            className="bg-gray-50/50 dark:bg-gray-850 text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-100/50 dark:border-gray-800 rounded-xl px-3 py-2.5 focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500/30 outline-none cursor-pointer transition-all"
                        >
                            <option value="all">Alle</option>
                            <option value="unassigned">Nicht zugewiesen</option>
                            {uniqueAssignees.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0 overflow-y-auto md:overflow-hidden pb-4">
                    {columns.map(column => {
                        const columnTasks = getColumnTasks(column.id);
                        return (
                            <div key={column.id} className="flex flex-col bg-slate-50/40 dark:bg-gray-900/30 rounded-[2rem] p-5 border border-slate-100/80 dark:border-gray-800/80 min-h-[400px] md:min-h-0">
                                <div className="flex items-center justify-between mb-4.5 px-1.5">
                                    <h3 className="font-bold text-gray-750 dark:text-gray-200 flex items-center gap-2.5 uppercase tracking-wider text-[11px]">
                                        <span className={`w-2 h-2 rounded-full ${column.color}`} />
                                        {column.title}
                                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black ${column.badgeColor}`}>
                                            {columnTasks.length}
                                        </span>
                                    </h3>
                                    <Link 
                                        href="/admin/tasks/new"
                                        className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all shadow-sm"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Link>
                                </div>
                                
                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`flex-1 overflow-y-auto pr-1.5 custom-scrollbar min-h-[150px] transition-all rounded-2xl p-2 ${
                                                snapshot.isDraggingOver 
                                                    ? 'bg-indigo-50/30 dark:bg-indigo-950/10 border-2 border-dashed border-indigo-200/50 dark:border-indigo-900/30' 
                                                    : 'border-2 border-transparent'
                                            }`}
                                        >
                                            {columnTasks.map((task, index) => (
                                                <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`transition-all ${snapshot.isDragging ? 'rotate-[1.5deg] scale-[1.02] z-50 shadow-2xl' : ''}`}
                                                        >
                                                            <TaskCard task={task} />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>
        </div>
    );
}
