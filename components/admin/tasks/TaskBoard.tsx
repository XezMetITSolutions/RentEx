
'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Clock, CheckCircle, PlayCircle, Circle } from 'lucide-react';
import TaskCard from './TaskCard';
import { updateTaskStatus } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

interface TaskBoardProps {
    initialTasks: any[];
}

export default function TaskBoard({ initialTasks }: TaskBoardProps) {
    const [tasks, setTasks] = useState(initialTasks);
    const [isMounted, setIsMounted] = useState(false);
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
            alert('Fehler beim Aktualisieren des Status');
        }
    };

    if (!isMounted) return null;

    const getColumnTasks = (status: string) => tasks.filter(t => t.status === status);

    const columns = [
        { id: 'todo', title: 'Zu erledigen', color: 'bg-slate-400', badgeColor: 'bg-gray-200 dark:bg-gray-700 text-gray-600' },
        { id: 'in_progress', title: 'In Bearbeitung', color: 'bg-blue-500', badgeColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700' },
        { id: 'done', title: 'Erledigt', color: 'bg-green-500', badgeColor: 'bg-green-100 dark:bg-green-900/30 text-green-700' }
    ];

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                {columns.map(column => {
                    const columnTasks = getColumnTasks(column.id);
                    return (
                        <div key={column.id} className="flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2 uppercase tracking-tighter text-sm">
                                    <div className={`w-2.5 h-2.5 rounded-full ${column.color}`}></div>
                                    {column.title}
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${column.badgeColor}`}>
                                        {columnTasks.length}
                                    </span>
                                </h3>
                                <button className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            
                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[100px] transition-colors rounded-xl p-2 ${
                                            snapshot.isDraggingOver ? 'bg-blue-50/50 dark:bg-blue-900/10 border-2 border-dashed border-blue-200 dark:border-blue-800' : ''
                                        }`}
                                    >
                                        {columnTasks.map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`transition-all ${snapshot.isDragging ? 'rotate-2 scale-105 z-50' : ''}`}
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
    );
}
