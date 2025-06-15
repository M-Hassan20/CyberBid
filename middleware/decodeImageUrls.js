const cloudinary = require('../utils/cloudinary');

const decodeImageUrls = async (req, res, next) => {
  try {
    const {imageUrls} = req.body;

    if(!imageUrls || !Array.isArray(imageUrls)) {
      return res.status(400).json({error: 'Invalid image URLs format'});
    }
    const userId = req.user?.id || 'defaultUser';

    const uploadImages = await Promise.all(
      imageUrls.map(async(img, index) => {
        if(!img.url) {
          throw new Error('Missing URL in image at index: ', index);
        }

        const uploadResult = await cloudinary.uploader.upload(uploadImages.url, {
          folder: `Cyberbid/items/${userId}`,
          public_id: `${Date.now()}_${index}`,
          overwrite: true
        });

        return {
          url: uploadResult.secure_url,
          is_featured: img.is_featured || false,
          display_order: img.display_order || index
        };

      })
    );
    req.body.imageUrls = uploadImages;
    next();
  }
  catch(error) {
    console.error('Cloudinary Upload Error: ', error);
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
};
module.exports = decodeImageUrls;