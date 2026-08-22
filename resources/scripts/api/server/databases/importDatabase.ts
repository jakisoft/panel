import http from '@/api/http';

export default (uuid: string, databaseId: string, file: File): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);

        http.post(`/api/client/servers/${uuid}/databases/${databaseId}/import`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then((response) => resolve(response.data))
            .catch(reject);
    });
};
