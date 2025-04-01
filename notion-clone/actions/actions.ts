'use server'

import { adminDb } from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";

<<<<<<< HEAD
export async function createNewDocument(){
    auth.protect();
    const {sessionClaims} = await auth();

    const docCollectionRef = adminDb.collection("documents");
    const docRef = await docCollectionRef.add({
        title:"New Doc"
    })

      await adminDb.collection('users')
      .doc(sessionClaims?.email!)
      .collection('rooms')
      .doc(docRef.id).set({
        userId: sessionClaims?.email!,
        role : "owner",
        createdAt : new Date(),
        roomId : docRef.id,
      },{
        merge:true
      })

      return {docId:docRef.id};
}

export async function deleteDocument(roomId:string) {
  auth.protect();
  console.log("deleteDocument",roomId);
  try{
    await adminDb.collection("documents").doc(roomId).delete();

    const query = await adminDb.collection("rooms").where("roomId", "==", roomId).get();
  
    const batch = adminDb.batch();
    //delete the room reference in the user's collection for every user in the room
=======
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
>>>>>>> c350f983adaabd5b47b386329954a82136268f6f
    query.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

<<<<<<< HEAD
    // delete the room in liveblocks
    await liveblocks.deleteRoom(roomId);

    return {success:true};

  } catch(error){
    console.error(error);
    return {success:false};
  }
}

export async function inviteUserToDocument(roomId:string, email:string){
  auth.protect();
  console.log("inviteUserToDocument, roomId, email");  
  try{
    await adminDb.collection("users")
    .doc(email)
    .collection("rooms")
    .doc(roomId)
    .set({
      userId:email,
      role:"editor",
      createAt: new Date(),
      roomId,
    });

    return {success : true};
  } catch(error){
    console.error(error);
    return {success : false};
  }
} 

export async function removeUserFromDocument(roomId:string,email:string){
  auth.protect();
  console.log("removeUserFromDocument",roomId,email);

  try{
    await adminDb
    .collection("users")
=======
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
>>>>>>> c350f983adaabd5b47b386329954a82136268f6f
      .doc(email)
      .collection("rooms")
      .doc(roomId)
      .delete();
<<<<<<< HEAD
    return {success:true};
  }catch(error){
    console.error(error);
    return {success : false};
  }
}
=======
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export async function handleImageUpload(
  base64Image: string,
  roomId: string,
  blockId: string
): Promise<string | null> {
  try {
    // Validate base64 string size (1MB limit)
    const base64Size = Math.ceil((base64Image.length - 'data:image/jpeg;base64,'.length) * 0.75);
    if (base64Size > 1024 * 1024) { // 1MB in bytes
      throw new Error("Image size exceeds 1MB limit");
    }
    
    await adminDb.collection("images").doc(blockId).set({
      fileName: `image-${blockId}`,
      imageData: base64Image,
      createdAt: new Date(),
      roomId: roomId,
    }, { merge: true });

    return base64Image;
  } catch (error) {
    console.error("Image upload failed:", error);
    return null;
  }
}

export async function deleteImage(blockId: string) {
  try {
    await adminDb.collection("images").doc(blockId).delete();
    return { success: true };
  } catch (error) {
    console.error("Error deleting image:", error);
    return { success: false };
  }
}

export async function deleteAllImagesInDocument(roomId: string) {
  try {
    const query = await adminDb
      .collection("images")
      .where("roomId", "==", roomId)
      .get();
    if (query.empty) {
      console.log(`?? No images found for roomId: ${roomId}`);
      return { success: true };
    }
    const batch = adminDb.batch();
    // Delete all images associated with the document
    query.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error("Error deleting images:", error);
    return { success: false };
  }
}
>>>>>>> c350f983adaabd5b47b386329954a82136268f6f
