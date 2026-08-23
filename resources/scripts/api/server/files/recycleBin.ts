import getFileContents from '@/api/server/files/getFileContents';
import saveFileContents from '@/api/server/files/saveFileContents';
import createDirectory from '@/api/server/files/createDirectory';
import renameFiles from '@/api/server/files/renameFiles';
import deleteFiles from '@/api/server/files/deleteFiles';
import { cleanDirectoryPath } from '@/helpers';

export interface TrashItem {
    id: string;
    name: string;
    originalDirectory: string;
    trashPath: string;
    isFile: boolean;
    size: number;
    deletedAt: number;
}

interface TrashMetadata {
    items: TrashItem[];
}

export const TRASH_DIR = '/.trash';
export const TRASH_META_FILE = '/.trash/.meta.json';
export const AUTO_CLEAR_DAYS = 7;
const AUTO_CLEAR_MS = AUTO_CLEAR_DAYS * 24 * 60 * 60 * 1000;

export const formatDaysRemaining = (deletedAt: number): string => {
    const elapsed = Date.now() - deletedAt;
    const remainingMs = AUTO_CLEAR_MS - elapsed;
    if (remainingMs <= 0) return 'Expired';
    const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
    return `${remainingDays} ${remainingDays === 1 ? 'day' : 'days'} left`;
};

export const getTrashItems = async (uuid: string): Promise<TrashItem[]> => {
    let metadata: TrashMetadata = { items: [] };

    try {
        const raw = await getFileContents(uuid, TRASH_META_FILE);
        if (raw) {
            metadata = JSON.parse(raw);
            if (!Array.isArray(metadata.items)) {
                metadata.items = [];
            }
        }
    } catch {
        // File doesn't exist or failed to load
        return [];
    }

    // Auto-clear logic: Remove items older than 7 days
    const now = Date.now();
    const expired = metadata.items.filter((item) => now - item.deletedAt > AUTO_CLEAR_MS);
    const active = metadata.items.filter((item) => now - item.deletedAt <= AUTO_CLEAR_MS);

    if (expired.length > 0) {
        try {
            await deleteFiles(uuid, TRASH_DIR, expired.map((item) => item.id));
            metadata.items = active;
            await saveFileContents(uuid, TRASH_META_FILE, JSON.stringify(metadata, null, 2));
        } catch {
            // Ignore auto-clear failure
        }
    }

    return active.sort((a, b) => b.deletedAt - a.deletedAt);
};

export const moveToTrash = async (
    uuid: string,
    directory: string,
    files: { name: string; isFile: boolean; size: number }[]
): Promise<void> => {
    if (!files.length) return;

    // Ensure .trash directory exists
    try {
        await createDirectory(uuid, '/', '.trash');
    } catch {
        // Directory may already exist
    }

    // Load existing metadata
    let metadata: TrashMetadata = { items: [] };
    try {
        const raw = await getFileContents(uuid, TRASH_META_FILE);
        if (raw) {
            metadata = JSON.parse(raw);
            if (!Array.isArray(metadata.items)) metadata.items = [];
        }
    } catch {
        metadata = { items: [] };
    }

    const cleanDir = cleanDirectoryPath(directory);
    const newItems: TrashItem[] = [];
    const renamePayload: { from: string; to: string }[] = [];

    for (const file of files) {
        const timestamp = Date.now();
        const rand = Math.random().toString(36).substring(2, 6);
        const trashId = `${timestamp}_${rand}_${file.name}`;
        const sourcePath = cleanDir === '/' ? file.name : `${cleanDir.replace(/^\//, '')}/${file.name}`;
        const targetPath = `.trash/${trashId}`;

        renamePayload.push({
            from: sourcePath,
            to: targetPath,
        });

        newItems.push({
            id: trashId,
            name: file.name,
            originalDirectory: cleanDir,
            trashPath: targetPath,
            isFile: file.isFile,
            size: file.size,
            deletedAt: timestamp,
        });
    }

    // Perform rename/move from root
    await renameFiles(uuid, '/', renamePayload);

    // Save updated metadata
    metadata.items.push(...newItems);
    await saveFileContents(uuid, TRASH_META_FILE, JSON.stringify(metadata, null, 2));
};

export const restoreTrashItem = async (uuid: string, item: TrashItem): Promise<void> => {
    // Ensure destination directory exists if not root
    if (item.originalDirectory && item.originalDirectory !== '/') {
        const parts = cleanDirectoryPath(item.originalDirectory).replace(/^\//, '').split('/');
        let current = '';
        for (const part of parts) {
            if (!part) continue;
            try {
                await createDirectory(uuid, current || '/', part);
            } catch {
                // Ignore if exists
            }
            current = current ? `${current}/${part}` : part;
        }
    }

    const cleanDir = cleanDirectoryPath(item.originalDirectory);
    const destPath = cleanDir === '/' ? item.name : `${cleanDir.replace(/^\//, '')}/${item.name}`;

    // Move file back from .trash
    await renameFiles(uuid, '/', [
        {
            from: `.trash/${item.id}`,
            to: destPath,
        },
    ]);

    // Update metadata
    let metadata: TrashMetadata = { items: [] };
    try {
        const raw = await getFileContents(uuid, TRASH_META_FILE);
        if (raw) metadata = JSON.parse(raw);
    } catch {
        // Ignore
    }

    metadata.items = (metadata.items || []).filter((i) => i.id !== item.id);
    await saveFileContents(uuid, TRASH_META_FILE, JSON.stringify(metadata, null, 2));
};

export const restoreAllTrashItems = async (uuid: string, items: TrashItem[]): Promise<void> => {
    for (const item of items) {
        try {
            await restoreTrashItem(uuid, item);
        } catch {
            // continue with next
        }
    }
};

export const deleteTrashItemPermanently = async (uuid: string, item: TrashItem): Promise<void> => {
    await deleteFiles(uuid, TRASH_DIR, [item.id]);

    let metadata: TrashMetadata = { items: [] };
    try {
        const raw = await getFileContents(uuid, TRASH_META_FILE);
        if (raw) metadata = JSON.parse(raw);
    } catch {
        // Ignore
    }

    metadata.items = (metadata.items || []).filter((i) => i.id !== item.id);
    await saveFileContents(uuid, TRASH_META_FILE, JSON.stringify(metadata, null, 2));
};

export const emptyTrash = async (uuid: string, items?: TrashItem[]): Promise<void> => {
    if (items && items.length > 0) {
        const ids = items.map((i) => i.id);
        ids.push('.meta.json');
        await deleteFiles(uuid, TRASH_DIR, ids);
    } else {
        await deleteFiles(uuid, '/', ['.trash']);
    }
};
