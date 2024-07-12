'use client'
import { useState, useEffect } from 'react';
import supabaseLocal from '@/utils/supabaseLocalClient';

export default function SyncStatusPage() {
  const [syncStats, setSyncStats] = useState({ total: 0, synced: 0, lastSync: null });
  const [loading, setLoading] = useState(true);

  const fetchSyncStats = async () => {
    try {
      const { data: totalData, error: totalError } = await supabaseLocal
        .from('user-ipiranga')
        .select('*', { count: 'exact' });
      
      const { data: syncedData, error: syncedError } = await supabaseLocal
        .from('user-ipiranga')
        .select('*', { count: 'exact' })
        .eq('sync', true);

      const { data: lastSyncData, error: lastSyncError } = await supabaseLocal
        .from('user-ipiranga')
        .select('last_sync')
        .order('last_sync', { ascending: false })
        .limit(1);

      if (totalError || syncedError || lastSyncError) {
        console.error('Erro ao buscar dados de sincronização:', totalError, syncedError, lastSyncError);
      } else {
        setSyncStats({
          total: totalData.length,
          synced: syncedData.length,
          lastSync: lastSyncData[0]?.last_sync
        });
      }
    } catch (error) {
      console.error('Erro ao executar consulta de sincronização:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncStats();
    const intervalId = setInterval(fetchSyncStats, 5000);  
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Status de Sincronização dos Usuários</h1>
      <hr className="mb-4" />

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 shadow rounded-lg">
            <p className="text-lg">Total de Usuários</p>
            <p className="text-xl font-semibold text-blue-500">{syncStats.total}</p>
          </div>

          <div className="bg-white p-4 shadow rounded-lg">
            <p className="text-lg">Usuários Sincronizados</p>
            <p className="text-xl font-semibold text-green-500">{syncStats.synced}</p>
          </div>

          <div className="bg-white p-4 shadow rounded-lg">
            <p className="text-lg">Última Sincronização</p>
            <p className="text-sm">{syncStats.lastSync ? new Date(syncStats.lastSync).toLocaleString() : 'Nenhuma'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
