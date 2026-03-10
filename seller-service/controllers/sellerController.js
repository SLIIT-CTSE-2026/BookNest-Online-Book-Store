import Seller from '../models/Seller.js';

export const createSellerProfile = async (req, res) => {
  try {
    const { userId, name, email, role, createDate } = req.body;

    // Basic validation
    if (!userId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'userId, name, and email are required'
      });
    }

    // Check if profile already exists
    const existingSeller = await Seller.findOne({ userId });
    if (existingSeller) {
      return res.status(200).json({
        success: true,
        message: 'Seller profile already exists',
        data: { seller: existingSeller }
      });
    }

    // Create seller profile
    const sellerData = {
      userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role || 'seller',
      createDate: createDate || new Date()
    };

    const newSeller = new Seller(sellerData);
    await newSeller.save();

    res.status(201).json({
      success: true,
      message: 'Seller profile created successfully',
      data: {
        seller: newSeller
      }
    });

  } catch (error) {
    console.error('Create seller profile error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all sellers
export const getAllSellers = async (req, res) => {
  try {
    const search = req.query.search || '';

    // Build search filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } }
      ];
    }

    const sellers = await Seller.find(filter).select('-__v').sort({ createDate: -1 });

    res.status(200).json({
      success: true,
      message: 'Sellers retrieved successfully',
      data: {
        sellers,
        count: sellers.length
      }
    });
  } catch (error) {
    console.error('Get sellers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get seller by ID
export const getSellerById = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await Seller.findOne({ userId: sellerId }).select('-__v');
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Seller retrieved successfully',
      data: {
        seller
      }
    });
  } catch (error) {
    console.error('Get seller by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update seller
export const updateSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const updateData = req.body;

    // Check if requesting user matches the seller ID
    if (req.user.userId !== sellerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own profile.'
      });
    }

    // Remove fields that shouldn't be updated here
    delete updateData.userId;
    delete updateData.email; // Email updates should go through auth service
    delete updateData.role;

    // Validate update data
    if (updateData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(updateData.phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    const seller = await Seller.findOneAndUpdate(
      { userId: sellerId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Seller updated successfully',
      data: {
        seller
      }
    });
  } catch (error) {
    console.error('Update seller error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete seller
export const deleteSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Only sellers can delete sellers, or users can delete their own account
    if (req.user.role !== 'seller' && req.user.userId !== sellerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only sellers can delete seller accounts.'
      });
    }

    const seller = await Seller.findOneAndDelete({ userId: sellerId });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Seller deleted successfully'
    });
  } catch (error) {
    console.error('Delete seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};