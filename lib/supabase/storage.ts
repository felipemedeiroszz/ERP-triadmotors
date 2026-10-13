import { createClient } from './client'

const BUCKET_NAME = 'product-images'

export async function uploadProductImage(
  productId: string,
  file: File,
  isPrimary: boolean = false,
  position: number = 0
) {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${isPrimary ? 'primary' : `secondary-${position}`}.${fileExt}`
  const filePath = `${productId}/${fileName}`

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    })

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)

  return {
    path: data.path,
    url: publicUrl,
  }
}

export async function deleteProductImage(path: string) {
  const supabase = createClient()
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path])

  if (error) throw error
}

export async function getProductImageUrl(path: string) {
  const supabase = createClient()
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)

  return data.publicUrl
}

export async function uploadCompanyLogo(file: File) {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `logo.${fileExt}`
  const filePath = `company/${fileName}`

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)

  return {
    path: data.path,
    url: publicUrl,
  }
}
