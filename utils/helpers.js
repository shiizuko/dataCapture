import supabaseLocal from './supabaseLocalClient';
import supabaseRemote from './supabaseRemoteClient';

export const syncData = async () => {
  try {
    const { data: users, error } = await supabaseLocal.from('user-ipiranga')
      .select('*')
      .eq('sync', false);

    if (error) {
      console.error('Erro ao obter dados locais:', error);
      return;
    }

    if (users.length > 0) {
      console.log(`Sincronizando ${users.length} usuários...`);
      const now = new Date().toISOString();
      const updateUserPromises = users.map(async (user) => {
        const updatedUser = { ...user, sync: true, last_sync: now };
        const { error: remoteError } = await supabaseRemote.from('user-ipiranga').upsert(updatedUser, { returning: 'minimal' });

        if (remoteError) {
          console.error('Erro ao sincronizar com a nuvem:', remoteError);
          return null;
        }

        const { error: localError } = await supabaseLocal.from('user-ipiranga').update(updatedUser).match({ id: user.id });
        if (localError) {
          console.error('Erro ao atualizar dados locais:', localError);
          return null;
        }

        console.log('Usuário sincronizado com sucesso na nuvem:', user);
        return updatedUser;
      });

      await Promise.all(updateUserPromises);
      console.log('Sincronização completa.');
    } else {
      console.log('Nenhum dado para sincronizar.');
    }
  } catch (error) {
    console.error('Erro na sincronização:', error);
  }
};

export const notify = (message, type) => {
    alert(message)
  // add biblioteca de notificações
  console.log(`${type.toUpperCase()}: ${message}`);
};
