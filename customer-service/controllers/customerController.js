import Customer from '../models/Customer.js';
import jwt from 'jsonwebtoken';

// Create a new customer
export const createCustomer = async (req, res) => {
  try {
    const { customerName, customerEmail, customerPassword } = req.body;

    // Basic validation
    if (!customerName || customerName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required'
      });
    }

    if (!customerEmail || customerEmail.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer email is required'
      });
    }

    if (!customerPassword || customerPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password is required and must be at least 6 characters'
      });
    }

    // Sanitize data
    const customerData = {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPassword: customerPassword
    };

    // Check email already exists
    const existingCustomer = await Customer.findOne({ customerEmail: customerData.customerEmail });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }

    const newCustomer = new Customer(customerData);
    await newCustomer.save();

    // Remove password from response
    const { customerPassword: _, ...customerResponse } = newCustomer.toObject();

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: {
        customer: customerResponse
      }
    });
  } catch (error) {
    console.error('Create customer error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Customer with this email already exists'
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
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } }
      ];
    }

    // Get all customers without pagination
    const customers = await Customer.find(filter)
      .sort({ createDate: -1 });

    res.status(200).json({
      success: true,
      message: 'Customers retrieved successfully',
      data: {
        customers
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
    const customer = await Customer.findOne({ customerId });

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
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update customer profile
export const updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { customerName, customerEmail, customerPassword } = req.body;
    
    // Basic validation
    if (!customerName || customerName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required'
      });
    }

    if (!customerEmail || customerEmail.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer email is required'
      });
    }

    // Sanitize and prepare update data
    const updateData = {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase()
    };

    // If password is provided, validate and add to update data
    if (customerPassword) {
      if (customerPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters'
        });
      }
      updateData.customerPassword = customerPassword;
    }

    const customer = await Customer.findOneAndUpdate(
      { customerId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Remove password from response
    const { customerPassword: _, ...customerResponse } = customer.toObject();

    res.status(200).json({
      success: true,
      message: 'Customer profile updated successfully',
      data: {
        customer: customerResponse
      }
    });

  } catch (error) {
    console.error('Update customer error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete customer profile
export const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findOneAndDelete({ customerId });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer profile deleted successfully',
      data: {
        deletedCustomer: {
          customerId: customer.customerId,
          customerName: customer.customerName,
          customerEmail: customer.customerEmail
        }
      }
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

// Customer login
export const loginCustomer = async (req, res) => {
  try {
    const { customerEmail, customerPassword } = req.body;

    // Basic validation
    if (!customerEmail || !customerPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find customer with password field included
    const customer = await Customer.findOne({ 
      customerEmail: customerEmail.toLowerCase() 
    }).select('+customerPassword');

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isValidPassword = await customer.comparePassword(customerPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        customerId: customer.customerId,
        customerEmail: customer.customerEmail 
      },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { customerPassword: _, ...customerResponse } = customer.toObject();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        customer: customerResponse,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const registerCustomer = async (req, res) => {
  return createCustomer(req, res);
};