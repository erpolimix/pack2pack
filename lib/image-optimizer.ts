/**
 * Utilidades para optimizar imágenes antes de subir a Supabase
 * Reduce costes de storage hasta 70%
 */

export const imageOptimizer = {
  /**
   * Comprime imagen antes de upload
   * @param file Archivo original
   * @param maxWidth Ancho máximo (default: 1200px)
   * @param quality Calidad JPEG/WebP (default: 0.8)
   * @returns File comprimido
   */
  async compressImage(
    file: File,
    maxWidth: number = 1200,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const img = new Image()
        
        img.onload = () => {
          // Calcular dimensiones manteniendo aspect ratio
          let width = img.width
          let height = img.height
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
          
          // Crear canvas para redimensionar
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('No se pudo obtener contexto 2D'))
            return
          }
          
          // Dibujar imagen redimensionada
          ctx.drawImage(img, 0, 0, width, height)
          
          // Convertir a blob con compresión
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Error al comprimir imagen'))
                return
              }
              
              // Crear nuevo File con mismo nombre
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '.jpg'), // Forzar .jpg
                {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                }
              )
              
              console.log(`[Image Optimizer] Original: ${(file.size / 1024).toFixed(0)}KB → Comprimido: ${(compressedFile.size / 1024).toFixed(0)}KB`)
              
              resolve(compressedFile)
            },
            'image/jpeg',
            quality
          )
        }
        
        img.onerror = () => reject(new Error('Error al cargar imagen'))
        img.src = e.target?.result as string
      }
      
      reader.onerror = () => reject(new Error('Error al leer archivo'))
      reader.readAsDataURL(file)
    })
  },

  /**
   * Valida que el archivo sea una imagen y no exceda tamaño máximo
   * @param file Archivo a validar
   * @param maxSizeMB Tamaño máximo en MB (default: 5MB)
   */
  validateImage(file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } {
    // Validar tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Formato no válido. Usa JPG, PNG o WebP'
      }
    }
    
    // Validar tamaño
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `La imagen es muy grande. Máximo ${maxSizeMB}MB`
      }
    }
    
    return { valid: true }
  },

  /**
   * Genera thumbnail (miniatura) para previews
   * @param file Archivo original
   * @param size Tamaño del thumbnail (default: 200px)
   */
  async createThumbnail(file: File, size: number = 200): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const img = new Image()
        
        img.onload = () => {
          const canvas = document.createElement('canvas')
          
          // Thumbnail cuadrado (crop al centro)
          const minDim = Math.min(img.width, img.height)
          const sx = (img.width - minDim) / 2
          const sy = (img.height - minDim) / 2
          
          canvas.width = size
          canvas.height = size
          
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('No se pudo obtener contexto 2D'))
            return
          }
          
          ctx.drawImage(
            img,
            sx, sy, minDim, minDim, // Source
            0, 0, size, size // Destination
          )
          
          resolve(canvas.toDataURL('image/jpeg', 0.7))
        }
        
        img.onerror = () => reject(new Error('Error al cargar imagen'))
        img.src = e.target?.result as string
      }
      
      reader.onerror = () => reject(new Error('Error al leer archivo'))
      reader.readAsDataURL(file)
    })
  }
}
