import { create } from 'zustand';
import { Proposal } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';

interface ProposalState {
  proposals: Proposal[];
  loading: boolean;
  fetchProposals: (userId: string) => Promise<void>;
  addProposal: (proposal: Proposal) => Promise<string>;
  updateProposal: (id: string, updates: Partial<Proposal>) => Promise<void>;
  deleteProposal: (id: string) => Promise<void>;
  getProposal: (id: string) => Promise<Proposal | null>;
}

export const useProposalStore = create<ProposalState>((set) => ({
  proposals: [],
  loading: false,
  fetchProposals: async (userId) => {
    set({ loading: true });
    try {
      const q = query(
        collection(db, 'proposals'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const proposals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proposal));
      set({ proposals, loading: false });
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'proposals');
      set({ loading: false });
    }
  },
  addProposal: async (proposal) => {
    try {
      const docRef = doc(collection(db, 'proposals'));
      await setDoc(docRef, proposal);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'proposals');
      return '';
    }
  },
  updateProposal: async (id, updates) => {
    try {
      const docRef = doc(db, 'proposals', id);
      await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
      set(state => ({
        proposals: state.proposals.map(p => p.id === id ? { ...p, ...updates } : p)
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `proposals/${id}`);
    }
  },
  deleteProposal: async (id) => {
    try {
      await deleteDoc(doc(db, 'proposals', id));
      set(state => ({
        proposals: state.proposals.filter(p => p.id !== id)
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `proposals/${id}`);
    }
  },
  getProposal: async (id) => {
    try {
      const docRef = doc(db, 'proposals', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Proposal;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `proposals/${id}`);
      return null;
    }
  },
}));
