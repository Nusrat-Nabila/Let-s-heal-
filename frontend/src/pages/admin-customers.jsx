import React, { useState, useEffect, useMemo } from 'react';
import { FiUsers, FiMail, FiPhone, FiTrash2, FiEye, FiSearch, FiFilter, FiLoader, FiUser, FiCalendar, FiRefreshCw, FiAlertTriangle, FiChevronDown, FiChevronUp, FiEdit, FiImage } from 'react-icons/fi';
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const API_BASE = 'http://localhost:8000';

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const userRole = localStorage.getItem('user_role');

      if (!token || userRole !== 'admin') {
        console.error('Unauthorized access attempt');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/list_customer/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        console.error('Failed to fetch customers:', response.status);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
      setRefreshLoading(false);
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/view_customer_profile/${customerId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedCustomer(data);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const deleteCustomer = async (customerId) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE}/api/delete_customer/${customerId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('Customer deleted successfully!');
        fetchCustomers();
        setSelectedCustomer(null);
        setDeleteConfirm(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete customer.');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('An error occurred while deleting the customer.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  // Calculate statistics
  const stats = useMemo(() => ({
    total: customers.length,
    active: customers.filter(cust => cust.is_active !== false).length,
    recent: customers.filter(cust => {
      if (!cust.date_joined) return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(cust.date_joined) > weekAgo;
    }).length
  }), [customers]);

  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers.filter(customer => {
      const matchesSearch = 
        customer.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customer_phone?.toString().includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && customer.is_active !== false) ||
        (statusFilter === 'inactive' && customer.is_active === false);
      
      return matchesSearch && matchesStatus;
    });

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [customers, searchTerm, statusFilter, sortConfig]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'CU';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };


  return (
    <div id ="admin-customers">
      <Navbar />
      <div className="min-h-screen bg-purple-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-purple-100">
                  <FiUsers className="w-8 h-8 text-purple-800" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-purple-800">Customer Management</h1>
                  <p className="text-purple-700 mt-1">Manage and monitor customer accounts</p>
                </div>
              </div>
              
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-900">{stats.total}</div>
                    <div className="text-purple-500 text-sm font-medium">Total Customers</div>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiUsers className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-900">{stats.active}</div>
                    <div className="text-purple-500 text-sm font-medium">Active Customers</div>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiUser className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-900">{stats.recent}</div>
                    <div className="text-purple-500 text-sm font-medium">New This Week</div>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiCalendar className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-900">
                      {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                    </div>
                    <div className="text-purple-500 text-sm font-medium">Active Rate</div>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-6 bg-white rounded-xl border border-purple-200 p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex-1 w-full lg:max-w-md">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search customers by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="flex items-center gap-2 px-3 py-2.5 border border-purple-300 rounded-lg bg-purple-50">
                  <FiFilter className="w-4 h-4 text-purple-600" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent focus:outline-none text-purple-800 font-medium"
                  >
                    <option value="all">All Customers</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="text-sm text-gray-600 font-medium bg-purple-50 px-3 py-2 rounded-lg">
                  {filteredAndSortedCustomers.length} of {customers.length} customers
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Customers List */}
            <div className="xl:col-span-2 bg-white rounded-xl border border-purple-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-purple-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-purple-900 flex items-center gap-2">
                  <FiUsers className="w-5 h-5 text-purple-600" />
                  Customer Directory
                </h2>
              </div>
              
              <div className="overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-6 bg-white border-b border-purple-200 text-xs font-semibold text-purple-500 uppercase tracking-wider">
                  <div 
                    className="col-span-5 flex items-center gap-2 cursor-pointer hover:text-purple-700 transition-colors" 
                    onClick={() => handleSort('customer_name')}
                  >
                    Customer Information
                    {sortConfig.key === 'customer_name' && (
                      sortConfig.direction === 'asc' ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />
                    )}
                  </div>
                  <div className="col-span-3">Contact Details</div>
                  <div 
                    className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-purple-700 transition-colors"
                    onClick={() => handleSort('date_joined')}
                  >
                    Member Since
                    {sortConfig.key === 'date_joined' && (
                      sortConfig.direction === 'asc' ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />
                    )}
                  </div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>
                
                <div className="divide-y divide-purple-200 max-h-[600px] overflow-y-auto">
                  {filteredAndSortedCustomers.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiUser className="w-8 h-8 text-purple-400" />
                      </div>
                      <h3 className="text-purple-900 font-semibold mb-2">No customers found</h3>
                      <p className="text-purple-600 text-sm">
                        {customers.length === 0 
                          ? 'No customer accounts have been created yet.'
                          : 'Try adjusting your search or filter criteria.'
                        }
                      </p>
                    </div>
                  ) : (
                    filteredAndSortedCustomers.map((customer) => (
                      <div 
                        key={customer.id} 
                        className={`grid grid-cols-12 gap-4 p-6 hover:bg-purple-50 cursor-pointer transition-all duration-200 ${
                          selectedCustomer?.id === customer.id ? 'bg-purple-50 border-l-4 border-l-purple-600' : 'border-l-4 border-l-transparent'
                        }`}
                        onClick={() => fetchCustomerDetails(customer.id)}
                      >
                        <div className="col-span-5 flex items-center gap-4">
                          {/* Customer Image */}
                          {customer.customer_image ? (
                            <img 
                              src={getImageUrl(customer.customer_image)} 
                              alt={customer.customer_name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-12 h-12 bg-purple-800 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                              customer.customer_image ? 'hidden' : 'flex'
                            }`}
                          >
                            {getInitials(customer.customer_name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-purple-900 truncate">
                              {customer.customer_name || 'Unnamed Customer'}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">ID: {customer.id}</span>
                              {customer.customer_gender && customer.customer_gender !== 'no choice' && (
                                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full capitalize">
                                  {customer.customer_gender}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-span-3">
                          <div className="flex items-center gap-2 text-purple-600 mb-2">
                            <FiMail className="w-4 h-4 text-purple-500" />
                            <span className="text-sm truncate">{customer.customer_email}</span>
                          </div>
                          {customer.customer_phone && (
                            <div className="flex items-center gap-2 text-purple-600">
                              <FiPhone className="w-4 h-4 text-purple-500" />
                              <span className="text-sm">{customer.customer_phone}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="col-span-2 flex items-center text-purple-500 text-sm">
                          <FiCalendar className="w-4 h-4 mr-2 text-purple-500" />
                          {formatDate(customer.date_joined)}
                        </div>
                        
                        <div className="col-span-2 flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchCustomerDetails(customer.id);
                            }}
                            className="p-2 text-purple-400 hover:text-purple-600 hover:bg-white rounded-lg transition-all duration-200 shadow-sm border border-transparent hover:border-gray-200"
                            title="View details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(customer);
                            }}
                            className="p-2 text-purple-400 hover:text-purple-600 hover:bg-white rounded-lg transition-all duration-200 shadow-sm border border-transparent hover:border-gray-200"
                            title="Delete customer"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Customer Details Panel */}
            <div className="bg-white rounded-xl border border-purple-200 shadow-sm h-fit sticky top-8 overflow-hidden">
              <div className="p-6 border-b border-purple-200 bg-purple-50">
                <h2 className="text-xl font-semibold text-purple-900 flex items-center gap-2">
                  <FiEye className="w-5 h-5 text-purple-600" />
                  Customer Details
                </h2>
              </div>
              
              {selectedCustomer ? (
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Header with Profile Image */}
                    <div className="flex items-start gap-4 pb-6 border-b border-purple-200">
                      {selectedCustomer.customer_image ? (
                        <img 
                          src={getImageUrl(selectedCustomer.customer_image)} 
                          alt={selectedCustomer.customer_name}
                          className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-purple-800 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                          {getInitials(selectedCustomer.customer_name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-purple-900 text-xl mb-2">
                          {selectedCustomer.customer_name || 'Unnamed Customer'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm text-purple-500 bg-purple-100 px-2 py-1 rounded">ID: {selectedCustomer.id}</span>
                          {selectedCustomer.customer_gender && selectedCustomer.customer_gender !== 'no choice' && (
                            <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded capitalize">
                              {selectedCustomer.customer_gender}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-purple-600" />
                        Contact Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="p-2 bg-white rounded-lg border border-purple-200">
                            <FiMail className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Email Address</p>
                            <p className="text-purple-900 font-medium">{selectedCustomer.customer_email}</p>
                          </div>
                        </div>
                        {selectedCustomer.customer_phone && (
                          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="p-2 bg-white rounded-lg border border-purple-200">
                              <FiPhone className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Phone Number</p>
                              <p className="text-purple-900 font-medium">{selectedCustomer.customer_phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Account Information */}
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-purple-600" />
                        Account Information
                      </h4>
                      <div className="space-y-3">
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Member Since</p>
                          <p className="text-purple-900 font-medium">{formatDate(selectedCustomer.date_joined)}</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Account Status</p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            selectedCustomer.is_active === false 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {selectedCustomer.is_active === false ? 'Inactive' : 'Active'}
                          </span>
                        </div>
                        {selectedCustomer.customer_age && (
                          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Age</p>
                            <p className="text-purple-900 font-medium">{selectedCustomer.customer_age} years</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-purple-200">
                      <button
                        onClick={() => setDeleteConfirm(selectedCustomer)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-800 text-white rounded-lg  hover:bg-purple-700 transition-all duration-200 font-semibold shadow-sm"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Delete Customer Account
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiEye className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-purple-900 font-semibold mb-2">No Customer Selected</h3>
                  <p className="text-purple-600 text-sm">Select a customer from the list to view detailed information</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-purple-200 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiAlertTriangle className="w-6 h-6 text-purple-800" />
              </div>
              <h3 className="text-lg font-semibold text-purple-900">Delete Customer</h3>
            </div>
            
            <p className="text-purple-900 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.customer_name || 'this customer'}</strong>'s account? This action cannot be undone and all their data will be permanently removed.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCustomer(deleteConfirm.id)}
                disabled={processing}
                className="flex-1 px-4 py-3 bg-purple-800 text-purple-200 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {processing ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiTrash2 className="w-4 h-4" />}
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminCustomers;