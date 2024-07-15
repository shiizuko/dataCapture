'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import supabaseLocal from '../../utils/supabaseLocalClient';
import { syncData, notify } from '../../utils/helpers.js';

export default function Signup() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    const handleOnline = () => syncData();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const onSubmit = async ({ email, telefone, nome }) => {
    try {
      const { data: existingUser, error: fetchError } = await supabaseLocal
        .from('user-ipiranga')
        .select('*')
        .or(`email.eq.${email},telefone.eq.${telefone}`);

      if (fetchError) {
        notify('Erro ao verificar dados existentes: ' + fetchError.message, 'error');
        return;
      }

      if (existingUser.length > 0) {
        notify('Email ou telefone já cadastrados.', 'error');
        return;
      }

      const { error: insertError } = await supabaseLocal
        .from('user-ipiranga')
        .insert([{ email, telefone, nome, sync: false }])
        .single();

      if (insertError) {
        notify('Erro ao cadastrar: ' + insertError.message, 'error');
      } else {
        notify('Cadastro realizado com sucesso!', 'success');
        reset(); 
        if (navigator.onLine) {
          syncData();
        }
      }
    } catch (error) {
      notify('Erro inesperado: ' + error.message, 'error');
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
