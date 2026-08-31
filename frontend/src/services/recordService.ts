import { storage, db } from "@/firebaseconfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from "firebase/firestore";

export async function uploadPatientReport(
  file: File,
  patientId: string,
  appointmentId?: string
) {
  const filePath = `medical_records/${patientId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, filePath);

  const uploadTask = await uploadBytesResumable(storageRef, file);
  const downloadUrl = await getDownloadURL(uploadTask.ref);

  const payload = {
    patientId,
    appointmentId: appointmentId || null,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    fileUrl: downloadUrl,
    uploadedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "medical_records"), payload);
  return { id: docRef.id, ...payload };
}