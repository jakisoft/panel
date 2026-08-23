import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { WithClassname } from '@/components/types';

export default ({ className }: WithClassname) => {
    const { id } = useParams<{ id: string }>();

    return (
        <NavLink
            to={`/server/${id}/files/trash`}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-sm bg-rose-600 hover:bg-rose-500 text-white ${className || ''}`}
            title={'Buka Sampah (Trash)'}
        >
            <Trash2 size={16} />
            <span>Sampah</span>
        </NavLink>
    );
};
