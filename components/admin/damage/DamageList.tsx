'use client';

import React from 'react';
import { 
    AlertTriangle, 
    Calendar, 
    ChevronRight, 
    MapPin, 
    User,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';

interface DamageRecord {
    id: number;
    type: string;
    description: string | null;
    reportedDate: string | Date;
    status: string;
    severity: string | null;
    car: {
        brand: string;
        model: string;
        plate: string;
        imageUrl: string | null;
    };
    rental: {
        customer: {
            firstName: string;
            lastName: string;
        } | null;
    } | null;
}

export default function DamageList({ records }: { records: DamageRecord[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map((record) => (
                <Link 
                    key={record.id}
                    href={`/admin/damage/${record.id}`}
                    className="group bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 block"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                {record.car.brand} {record.car.model}
                            </h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                {record.car.plate}
                            </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            record.status === 'open' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                        }`}>
                            {record.status}
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2 text-rose-500">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-tight">{record.type}</span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 italic">
                            "{record.description || 'Keine Beschreibung'}"
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                                {format(new Date(record.reportedDate), 'dd. MMM yyyy', { locale: de })}
                            </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                    </div>
                </Link>
            ))}

            {records.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white dark:bg-gray-900 rounded-[2.5rem] border border-dashed border-gray-200">
                    <CheckCircle2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Keine Schäden protokolliert</p>
                </div>
            )}
        </div>
    );
}
