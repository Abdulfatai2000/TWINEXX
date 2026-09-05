import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const generateRandomPin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateUniquePin = async () => {
  let isUnique = false;
  let pin = '';
  
  while (!isUnique) {
    pin = generateRandomPin();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('pin', '==', pin));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      isUnique = true;
    }
  }
  
  return pin;
};
