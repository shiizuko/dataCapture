'use client'
import { useState } from 'react';
import supabase from '../..//utils/supabaseClient.js';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nome, setName] = useState('');

  async function handleSignup() {
    const { error } = await supabase
      .from('user-ipiranga')
      .insert([{ email, telefone, nome }])
      .single();

    if (error) {
      alert('Erro ao cadastrar: ' + error.message);
    } else {
      alert('Cadastro realizado com sucesso!');
    }
  }

  return (
    <div className='text-red-500'>
      <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="telefone" />
      <input type="text" value={nome} onChange={(e) => setName(e.target.value)} placeholder="Nome" />
      <button onClick={handleSignup}>Cadastrar</button>
    </div>
  );
}

