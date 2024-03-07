// import { useSupabase } from '@/app/supabase-provider';
// import { useState, useEffect } from 'react';

// interface Document {
//   id: string;
//   total_leads: number;
// }

// const useDocument = (documentId: string): Document | null => {
//   const { supabase } = useSupabase();

//   const [document, setDocument] = useState<Document | null>(null);

//   useEffect(() => {
//     const fetchDocument = async () => {
//       try {
//         const { data, error } = await supabase
//           .from('documents')
//           .select('*')
//           .eq('id', documentId)
//           .single();

//         if (error) {
//           throw new Error(error.message);
//         }

//         setDocument(data);
//       } catch (error) {
//         console.error('Error fetching document:', error);
//       }
//     };

//     fetchDocument();
//   }, [documentId]);

//   return document;
// };

// export default useDocument;
