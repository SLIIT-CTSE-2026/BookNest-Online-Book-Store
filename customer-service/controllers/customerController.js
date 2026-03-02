import Customer from '../models/Customer.js';

// Create customer profile (called by auth service)
export const createCustomerProfile = async (req, res) => {
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
    const existingCustomer = await Customer.findOne({ userId });
    if (existingCustomer) {
      return res.status(200).json({
        success: true,
        message: 'Customer profile already exists',
        data: { customer: existingCustomer }
      });
    }

    // Create customer profile
    const customerData = {
      userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role || 'customer',
      createDate: createDate || new Date()
    };

    const newCustomer = new Customer(customerData);
    await newCustomer.save();

    res.status(201).json({
      success: true,
      message: 'Customer profile created successfully',
      data: {
        customer: newCustomer
      }
    });

  } catch (error) {
    console.error('Create customer profile error:', error);
    
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

// Get all customers
export const getAllCustomers = async (req, res) => {
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

    const customers = await Customer.find(filter).select('-__v').sort({ createDate: -1 });

    res.status(200).json({
      success: true,
      message: 'Customers retrieved successfully',
      data: {
        customers,
        count: customers.length
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Check if requesting user matches the customer ID or is authorized
    if (req.user.role !== 'seller' && req.user.userId !== customerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.'
      });
    }

    const customer = await Customer.findOne({ userId: customerId }).select('-__v');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer retrieved successfully',
      data: {
        customer
      }
    });
  } catch (error) {
    console.error('Get customer by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update customer
export const updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const updateData = req.body;

    // Check if requesting user matches the customer ID
    if (req.user.userId !== customerId) {
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

    const customer = await Customer.findOneAndUpdate(
      { userId: customerId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: {
        customer
      }
    });
  } catch (error) {
    console.error('Update customer error:', error);
    
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

// Delete customer
export const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Only sellers can delete customers, or users can delete their own account
    if (req.user.role !== 'seller' && req.user.userId !== customerId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only sellers can delete customer accounts.'
      });
    }

    const customer = await Customer.findOneAndDelete({ userId: customerId });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};