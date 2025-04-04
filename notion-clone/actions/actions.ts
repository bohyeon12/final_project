'use server'

import { adminDb } from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";
import { storage } from "@/firebase";
import { ref, uploadBytes, deleteObject, getDownloadURL } from "firebase/storage";

export async function createNewDocument() {
  auth.protect();
  const { sessionClaims } = await auth();

  const docCollectionRef = adminDb.collection("documents");
  const docRef = await docCollectionRef.add({
    title: "New Doc",
  });

  await adminDb
    .collection("users")
    .doc(sessionClaims?.email!)
    .collection("rooms")
    .doc(docRef.id)
    .set(
      {
        userId: sessionClaims?.email!,
        role: "owner",
        createdAt: new Date(),
        roomId: docRef.id,
      },
      {
        merge: true,
      }
    );

  return { docId: docRef.id };
}

export async function deleteDocument(roomId: string) {
  auth.protect();
  console.log("deleteDocument", roomId);
  try {
    await deleteAllImagesInDocument(roomId);
    await adminDb.collection("documents").doc(roomId).delete();

    const query = await adminDb
      .collection("rooms")
      .where("roomId", "==", roomId)
      .get();

    const batch = adminDb.batch();
    // Delete the room reference in the user's collection for every user in the room
    query.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    // Delete the room in Liveblocks
    await liveblocks.deleteRoom(roomId);

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function inviteUserToDocument(roomId: string, email: string) {
  auth.protect();
  console.log("inviteUserToDocument, roomId, email");
  try {
    await adminDb
      .collection("users")
      .doc(email)
      .collection("rooms")
      .doc(roomId)
      .set({
        userId: email,
        role: "editor",
        createAt: new Date(),
        roomId,
      });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function removeUserFromDocument(roomId: string, email: string) {
  auth.protect();
  console.log("removeUserFromDocument", roomId, email);

  try {
    await adminDb
      .collection("users")
      .doc(email)
      .collection("rooms")
      .doc(roomId)
      .delete();
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function handleImageUpload(
  file: File,
  roomId: string,
  blockId: string
): Promise<string | null> {
  try {
    // Create a reference to the image in Firebase Storage
    const imageRef = ref(storage, `images/${roomId}/${blockId}`);
    
    // Upload the file directly to Firebase Storage
    await uploadBytes(imageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(imageRef);
    
    // Store metadata in Firestore
    await adminDb.collection("images").doc(roomId).collection("blocks").doc(blockId).set({
      fileName: file.name,
      imageUrl: downloadURL,
      createdAt: new Date(),
      contentType: file.type,
      size: file.size,
      blockId: blockId,
      width: 640,
    }, { merge: true });

    return downloadURL;
  } catch (error) {
    console.error("Image upload failed:", error);
    throw error; // Re-throw to handle error in caller
  }
}

export async function deleteAllImagesInDocument(roomId: string) {
  try {
    const batch = adminDb.batch();
    const deletePromises: Promise<void>[] = [];

    // Get all blocks in the specific room
    const blocksSnapshot = await adminDb
      .collection("images")
      .doc(roomId)
      .collection("blocks")
      .get();

    if (blocksSnapshot.empty) {
      console.log(`No images found for roomId: ${roomId}`);
      return { success: true };
    }

    // Delete all blocks and their storage references
    blocksSnapshot.docs.forEach((doc) => {
      const imageData = doc.data();
      if (imageData.imageUrl) {
        const imageRef = ref(storage, `images/${roomId}/${doc.id}`);
        deletePromises.push(deleteObject(imageRef));
      }
      batch.delete(doc.ref);
    });

    // Wait for all storage deletions to complete
    await Promise.all(deletePromises);
    // Commit the Firestore batch
    await batch.commit();

    // Delete the room document itself
    await adminDb.collection("images").doc(roomId).delete();

    return { success: true };
  } catch (error) {
    console.error("Error deleting images:", error);
    return { success: false };
  }
}

export async function getImageWidth(roomId: string, blockId: string) {
  try {
    const docRef = adminDb.collection("images").doc(roomId).collection("blocks").doc(blockId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      console.log(`No image found for roomId: ${roomId}, blockId: ${blockId}`);
      return 640; // Return default width if document doesn't exist
    }
    
    const data = doc.data();
    return data?.width || 640; // Return stored width or default if not set
  } catch (error) {
    console.error("Error getting image width:", error);
    return 640; // Return default width on error
  }
}

export async function updateImageWidth(roomId: string, blockId: string, width: number) {
  try {
    const docRef = adminDb.collection("images").doc(roomId).collection("blocks").doc(blockId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      console.log(`No image found for roomId: ${roomId}, blockId: ${blockId}`);
      return { success: false };
    }
    
    await docRef.update({
      width: width
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating image width:", error);
    return { success: false };
  }
}
  
