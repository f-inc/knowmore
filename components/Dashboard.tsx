'use client';

import { useSupabase } from '@/app/supabase-provider';
import { useEffect, useState } from 'react';

type UserDocument = {
  id: number;
  paid: boolean;
};

type DashboardProps = {
  user: any;
};

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const { supabase } = useSupabase();

  useEffect(() => {
    fetchUserDocuments();
  }, []);

  const fetchUserDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('owner', user.id)
        .eq('paid', true);

      console.log('data:', data);

      if (error) {
        throw error;
      }

      if (data) {
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching user documents:', error);
    }
  };

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <h2>Your Documents:</h2>
      <ul style={{ color: 'white' }}>
        {documents.map((document) => (
          <li key={document.id}>
            <h3>{document.id}</h3>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
