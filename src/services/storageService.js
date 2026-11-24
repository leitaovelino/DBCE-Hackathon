/**
 * GoaSmart Platform - Firebase Storage Service for Marketplace Images
 * 
 * Handles:
 * - File validation (< 5 MB, JPG/PNG/WEBP)
 * - Uploads to business-images/{ownerUid}/{listingId}/{filename}
 * - Category-specific fallbacks
 * - Resilient error handling and bucket availability diagnostics
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase.js';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Validates file type and size.
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No image file selected.' };
  }

  if (!SUPPORTED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Invalid file format. Supported image types are JPG, PNG, and WEBP.'
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeInMB} MB) exceeds the 5 MB limit. Please select a smaller photo.`
    };
  }

  return { valid: true };
}

/**
 * Converts a File to a Base64 Data URL (used for instant preview and offline fallback)
 * @param {File} file
 * @returns {Promise<string>}
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a business owner photo to Firebase Storage.
 * 
 * Target Storage Path:
 * business-images/{ownerUid}/{listingId}/{sanitized-fileName}
 * 
 * @param {File} file
 * @param {string} ownerUid
 * @param {string} listingId
 * @returns {Promise<{ downloadUrl: string, storagePath: string, isFallback?: boolean }>}
 */
export async function uploadBusinessPhoto(file, ownerUid, listingId) {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (!ownerUid) {
    throw new Error('Authenticated ownerUid is required to upload business images.');
  }

  const cleanListingId = listingId || `listing-${Date.now()}`;
  const ext = file.name ? file.name.split('.').pop().toLowerCase() : 'jpg';
  const cleanExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
  const storagePath = `business-images/${ownerUid}/${cleanListingId}/photo-${Date.now()}.${cleanExt}`;

  try {
    const storageRef = ref(storage, storagePath);
    const metadata = {
      contentType: file.type,
      customMetadata: {
        ownerUid,
        listingId: cleanListingId,
        uploadedAt: new Date().toISOString()
      }
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return {
      downloadUrl,
      storagePath,
      isFallback: false
    };
  } catch (error) {
    const errorMsg = error.message || error.code || 'Storage upload error';
    console.warn(
      'Firebase Storage upload attempt resulted in:',
      errorMsg
    );

    // If bucket is not provisioned in Firebase Console (e.g. Spark plan pending bucket activation),
    // do NOT store image binaries in Firestore. Return diagnostic information and category fallback.
    const isBucketMissing = errorMsg.includes('does not exist') || errorMsg.includes('404') || error.code === 'storage/bucket-not-found' || error.code === 'storage/project-not-found';
    
    return {
      downloadUrl: null,
      storagePath: null,
      isFallback: true,
      error: errorMsg,
      isBucketMissing,
      notice: isBucketMissing 
        ? 'Firebase Storage bucket has not been provisioned yet in Firebase Console (Spark Plan). A GoaSmart category-verified photograph has been assigned.'
        : `Storage upload issue: ${errorMsg}. Fallback category image applied.`
    };
  }
}

/**
 * Returns a category-specific fallback image for listings without an uploaded photo.
 * @param {string} category
 * @returns {string} local image path
 */
export function getCategoryFallbackImage(category = '') {
  const cat = String(category).toLowerCase();

  if (cat.includes('food') || cat.includes('dine') || cat.includes('restaurant') || cat.includes('culinary') || cat.includes('cafe')) {
    return '/images/marketplace/fallback-restaurant.jpg';
  }

  if (cat.includes('stay') || cat.includes('homestay') || cat.includes('villa') || cat.includes('resort') || cat.includes('room')) {
    return '/images/marketplace/fallback-homestay.jpg';
  }

  if (cat.includes('craft') || cat.includes('handicraft') || cat.includes('art') || cat.includes('shop') || cat.includes('souvenir')) {
    return '/images/marketplace/fallback-handicraft.jpg';
  }

  if (cat.includes('tour') || cat.includes('activity') || cat.includes('adventure') || cat.includes('kayak') || cat.includes('scuba') || cat.includes('guide')) {
    return '/images/marketplace/fallback-activity.jpg';
  }

  // Default fallback
  return '/images/destinations/north-goa/baga-beach.jpg';
}
