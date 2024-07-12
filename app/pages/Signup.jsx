'use client'
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import supabaseLocal from '../../utils/supabaseLocalClient';
import supabaseRemote from '../../utils/supabaseRemoteClient';

export default function Signup() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const syncData = async () => {
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
      users.forEach(async (user) => {
        const updatedUser = { ...user, sync: true, last_sync: now };
        const { error } = await supabaseRemote.from('user-ipiranga').upsert(updatedUser, { returning: 'minimal' });
        if (error) {
          console.error('Erro ao sincronizar com a nuvem:', error);
        } else {
          await supabaseLocal.from('user-ipiranga').update(updatedUser).match({ id: user.id });
          console.log('Usuário sincronizado com sucesso na nuvem:', user);
        }
      });
    } else {
      console.log('Nenhum dado para sincronizar.');
    }
  };

  useEffect(() => {
    const handleOnline = () => syncData();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const onSubmit = async ({ email, telefone, nome }) => {
    const { data: existingUser, error: fetchError } = await supabaseLocal
      .from('user-ipiranga')
      .select('*')
      .or(`email.eq.${email},telefone.eq.${telefone}`);

    if (fetchError) {
      alert('Erro ao verificar dados existentes: ' + fetchError.message);
      return;
    }

    if (existingUser.length > 0) {
      alert('Email ou telefone já cadastrados.');
      return;
    }

    const { error: insertError } = await supabaseLocal
      .from('user-ipiranga')
      .insert([{ email, telefone, nome, sync: false }])
      .single();

    if (insertError) {
      alert('Erro ao cadastrar: ' + insertError.message);
    } else {
      alert('Cadastro realizado com sucesso!');
      reset(); 
      if (navigator.onLine) {
        syncData();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='text-red-500'>
      <input type="text" {...register('email', { required: true })} placeholder="Email" />
      {errors.email && <span>Email é obrigatório</span>}
      <input type="text" {...register('telefone', { required: true })} placeholder="Telefone" />
      {errors.telefone && <span>Telefone é obrigatório</span>}
      <input type="text" {...register('nome', { required: true })} placeholder="Nome" />
      {errors.nome && <span>Nome é obrigatório</span>}
      <button type="submit">Cadastrar</button>
    </form>
  );
}
