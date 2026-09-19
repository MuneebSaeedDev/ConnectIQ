import { useState, useEffect } from 'react';

// Mock data based on the requested screen
const MOCK_EXPRESSIONS = [
  {
    id: 'exp-001',
    name: 'Calculate Order Total',
    description: 'Calculates the final order total including tax and shipping',
    category: 'Numeric',
    returnType: 'Decimal',
    fieldsUsed: 4,
    pipelinesUsage: 12,
    status: 'Active',
    version: '1.2.0',
    lastUpdated: '2026-09-19T10:30:00Z',
    updatedBy: 'sarah.chen@example.com'
  },
  {
    id: 'exp-002',
    name: 'Normalize Customer Name',
    description: 'Standardizes customer names with proper casing and trimmed whitespace',
    category: 'String',
    returnType: 'String',
    fieldsUsed: 2,
    pipelinesUsage: 45,
    status: 'Active',
    version: '2.1.0',
    lastUpdated: '2026-09-18T14:20:00Z',
    updatedBy: 'alex.kumar@example.com'
  },
  {
    id: 'exp-003',
    name: 'Calculate Customer Age',
    description: 'Determines age based on birth date and current date',
    category: 'Date/Time',
    returnType: 'Integer',
    fieldsUsed: 1,
    pipelinesUsage: 8,
    status: 'Draft',
    version: '0.1.0',
    lastUpdated: '2026-09-17T09:15:00Z',
    updatedBy: 'david.wilson@example.com'
  },
  {
    id: 'exp-004',
    name: 'Generate Full Name',
    description: 'Combines first, middle (if present), and last name',
    category: 'String',
    returnType: 'String',
    fieldsUsed: 3,
    pipelinesUsage: 32,
    status: 'Active',
    version: '1.0.0',
    lastUpdated: '2026-09-15T11:45:00Z',
    updatedBy: 'sarah.chen@example.com'
  },
  {
    id: 'exp-005',
    name: 'Calculate Discounted Price',
    description: 'Applies promotional discounts to base price',
    category: 'Numeric',
    returnType: 'Decimal',
    fieldsUsed: 3,
    pipelinesUsage: 0,
    status: 'Deprecated',
    version: '1.4.2',
    lastUpdated: '2026-09-01T16:20:00Z',
    updatedBy: 'alex.kumar@example.com'
  },
  {
    id: 'exp-006',
    name: 'Standardize Account Identifier',
    description: 'Formats account IDs to the required 12-character format',
    category: 'String',
    returnType: 'String',
    fieldsUsed: 1,
    pipelinesUsage: 104,
    status: 'Active',
    version: '3.0.0',
    lastUpdated: '2026-08-20T08:30:00Z',
    updatedBy: 'emily.park@example.com'
  }
];

export function useCustomExpressions() {
  const [expressions, setExpressions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedReturnType, setSelectedReturnType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Table state
  const [sortField, setSortField] = useState('lastUpdated');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Simulate API fetch
  useEffect(() => {
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setExpressions(MOCK_EXPRESSIONS);
      setIsLoading(false);
    }, 600);
  }, []);

  // Filter logic
  const filteredExpressions = expressions.filter((exp) => {
    const matchesSearch = 
      searchQuery === '' || 
      exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
    const matchesReturnType = selectedReturnType === 'All' || exp.returnType === selectedReturnType;
    const matchesStatus = selectedStatus === 'All' || exp.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesCategory && matchesReturnType && matchesStatus;
  });

  // Sort logic
  const sortedExpressions = [...filteredExpressions].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalItems = sortedExpressions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedExpressions = sortedExpressions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(paginatedExpressions.map((exp) => exp.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    }
  };

  const refetch = () => {
    setIsLoading(true);
    setTimeout(() => {
      setExpressions([...MOCK_EXPRESSIONS]);
      setSelectedItems([]);
      setIsLoading(false);
    }, 600);
  };

  return {
    expressions: paginatedExpressions,
    isLoading,
    isError,
    error,
    refetch,
    
    // Filters
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedReturnType,
    setSelectedReturnType,
    selectedStatus,
    setSelectedStatus,
    
    // Table sorting
    sortField,
    sortDirection,
    handleSort,
    
    // Selection
    selectedItems,
    handleSelectAll,
    handleSelectItem,
    
    // Pagination
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      setCurrentPage
    }
  };
}
