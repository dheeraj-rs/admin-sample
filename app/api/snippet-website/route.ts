import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db-connect';
import SnippetWebsite from '@/models/SnippetWebsite';

// POST method - Create new item
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const timestamp = new Date();
    const itemData = {
      name: data.name ?? '',
      websiteType: data.websiteType ?? '',
      paymentType: data.paymentType ?? '',
      paymentAmount: data.paymentAmount ?? 0,
      publishedUrl: data.publishedUrl ?? '',
      author: data.author ?? '',
      version: data.version ?? '',
      support: data.support ?? '',
      thumbnail: data.thumbnail ?? '',
      screenshots: Array.isArray(data.screenshots) ? data.screenshots : [],
      features: Array.isArray(data.features) ? data.features : [],
      technologies: Array.isArray(data.technologies) ? data.technologies : [],
      description: data.description ?? '',
      longDescription: data.longDescription ?? '',
      snippet: Array.isArray(data.snippet) ? data.snippet : [],
      createdAt: data.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    const newItem = new SnippetWebsite(itemData);
    const savedItem = await newItem.save();
    return NextResponse.json(savedItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message ?? 'Failed to create item',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET method - Retrieve items with search, filters, and pagination
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;
    
    // Search parameter
    const search = searchParams.get('search') || '';
    
    // Filter parameters
    const websiteType = searchParams.get('websiteType') || '';
    const paymentType = searchParams.get('paymentType') || '';
    
    // Additional filter parameters (optional)
    const author = searchParams.get('author') || '';
    const minPaymentAmount = searchParams.get('minPaymentAmount');
    const maxPaymentAmount = searchParams.get('maxPaymentAmount');
    
    // Sort parameters
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build filter query
    const filterQuery: any = {};
    
    // Search functionality (searches in name, description, and technologies)
    if (search) {
      filterQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { longDescription: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { technologies: { $in: [new RegExp(search, 'i')] } },
        { features: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Website type filter
    if (websiteType) {
      filterQuery.websiteType = { $regex: websiteType, $options: 'i' };
    }
    
    // Payment type filter
    if (paymentType) {
      filterQuery.paymentType = { $regex: paymentType, $options: 'i' };
    }
    
    // Author filter
    if (author) {
      filterQuery.author = { $regex: author, $options: 'i' };
    }
    
    // Payment amount range filter
    if (minPaymentAmount || maxPaymentAmount) {
      filterQuery.paymentAmount = {};
      if (minPaymentAmount) {
        filterQuery.paymentAmount.$gte = parseFloat(minPaymentAmount);
      }
      if (maxPaymentAmount) {
        filterQuery.paymentAmount.$lte = parseFloat(maxPaymentAmount);
      }
    }
    
    // Build sort object
    const sortObject: any = {};
    sortObject[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute queries
    const [items, totalCount] = await Promise.all([
      SnippetWebsite.find(filterQuery)
        .sort(sortObject)
        .skip(skip)
        .limit(limit)
        .lean(),
      SnippetWebsite.countDocuments(filterQuery)
    ]);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const currentItems = items.length;
    
    // Prepare response
    const response = {
      success: true,
      data: items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        currentItems,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      },
      filters: {
        search,
        websiteType,
        paymentType,
        author,
        minPaymentAmount,
        maxPaymentAmount,
        sortBy,
        sortOrder
      },
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message ?? 'Failed to fetch items',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}