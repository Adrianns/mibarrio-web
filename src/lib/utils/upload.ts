import { supabase } from '$lib/supabase';

const BUCKET = 'provider-photos';

/**
 * Compress an image using Canvas API.
 * Returns a WebP blob at the specified max width and quality.
 */
export function compressImage(file: File, maxWidth: number, quality: number): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(file);

		img.onload = () => {
			URL.revokeObjectURL(url);

			let width = img.width;
			let height = img.height;

			if (width > maxWidth) {
				height = Math.round((height * maxWidth) / width);
				width = maxWidth;
			}

			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;

			const ctx = canvas.getContext('2d');
			if (!ctx) {
				reject(new Error('Canvas context not available'));
				return;
			}

			ctx.drawImage(img, 0, 0, width, height);

			canvas.toBlob(
				(blob) => {
					if (blob) resolve(blob);
					else reject(new Error('Compression failed'));
				},
				'image/webp',
				quality
			);
		};

		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('Failed to load image'));
		};

		img.src = url;
	});
}

/**
 * Derive the thumbnail URL from a full image URL.
 * For compressed uploads (.webp), replaces `.webp` with `_thumb.webp`.
 * For legacy uploads (non-webp), returns the original URL as fallback.
 */
export function getThumbUrl(fullUrl: string): string {
	if (fullUrl.endsWith('.webp')) {
		return fullUrl.replace(/\.webp$/, '_thumb.webp');
	}
	return fullUrl;
}

/**
 * Upload a file to the provider-photos bucket.
 * Compresses the image and uploads both full and thumbnail versions.
 */
export async function uploadPhoto(
	userId: string,
	file: File,
	type: 'logo' | 'gallery' | 'banner'
): Promise<{ url: string | null; thumbUrl: string | null; error: string | null }> {
	const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
	const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
	if (!allowedExts.includes(ext)) {
		return { url: null, thumbUrl: null, error: 'Formato no permitido. Usá JPG, PNG o WebP.' };
	}

	if (file.size > 5 * 1024 * 1024) {
		return { url: null, thumbUrl: null, error: 'La imagen no puede superar los 5MB.' };
	}

	const timestamp = Date.now();
	const fullPath = `${userId}/${type}/${timestamp}.webp`;
	const thumbPath = `${userId}/${type}/${timestamp}_thumb.webp`;

	try {
		// Compress both versions in parallel
		const fullMaxWidth = type === 'banner' ? 1920 : 1600;
		const fullQuality = type === 'banner' ? 0.9 : 0.85;
		const [fullBlob, thumbBlob] = await Promise.all([
			compressImage(file, fullMaxWidth, fullQuality),
			compressImage(file, 400, 0.6)
		]);

		// Upload both in parallel
		const [fullResult, thumbResult] = await Promise.all([
			supabase.storage.from(BUCKET).upload(fullPath, fullBlob, {
				cacheControl: '31536000',
				contentType: 'image/webp',
				upsert: false
			}),
			supabase.storage.from(BUCKET).upload(thumbPath, thumbBlob, {
				cacheControl: '31536000',
				contentType: 'image/webp',
				upsert: false
			})
		]);

		if (fullResult.error) {
			console.error('Full upload error:', fullResult.error);
			return { url: null, thumbUrl: null, error: 'Error al subir la imagen.' };
		}

		if (thumbResult.error) {
			console.error('Thumb upload error:', thumbResult.error);
			// Thumbnail failed but full succeeded - still usable
		}

		const {
			data: { publicUrl }
		} = supabase.storage.from(BUCKET).getPublicUrl(fullPath);

		const {
			data: { publicUrl: thumbPublicUrl }
		} = supabase.storage.from(BUCKET).getPublicUrl(thumbPath);

		return {
			url: publicUrl,
			thumbUrl: thumbResult.error ? null : thumbPublicUrl,
			error: null
		};
	} catch (err) {
		console.error('Compression error:', err);
		return { url: null, thumbUrl: null, error: 'Error al procesar la imagen.' };
	}
}

/**
 * Delete a file from the provider-photos bucket by its public URL.
 * Also deletes the associated thumbnail if it exists.
 */
export async function deletePhoto(publicUrl: string): Promise<{ error: string | null }> {
	const match = publicUrl.match(/\/storage\/v1\/object\/public\/provider-photos\/(.+)$/);
	if (!match) {
		return { error: 'URL inválida' };
	}

	const path = decodeURIComponent(match[1]);
	const thumbPath = path.replace(/\.webp$/, '_thumb.webp');

	// Delete both full and thumbnail
	const { error } = await supabase.storage.from(BUCKET).remove([path, thumbPath]);

	if (error) {
		console.error('Delete error:', error);
		return { error: 'Error al eliminar la imagen.' };
	}

	return { error: null };
}
