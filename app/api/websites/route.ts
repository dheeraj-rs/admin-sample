import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db-connect';
import Websites from '@/models/Websites';
import FilterOption, { FilterOptionLean, IOptionItem } from '@/models/FilterOption';
export const dynamic = 'force-dynamic';

// GET endpoint to fetch items with pagination, category filter, search functionality
// and time-based filtering
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    // Extract filter parameters from URL
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const type = url.searchParams.get('type');
    const technologies = url.searchParams.get('technologies');
    const search = url.searchParams.get('search');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const noPaginationParam = url.searchParams.get('noPagination');
    const initialCategory = url.searchParams.get('initialCategory');
    
    // Explicitly check for the noPagination parameter
    const noPagination = noPaginationParam === 'true';
    
    // Extract pagination parameters
    let page = 1;
    let limit = 20;
    
    if (!noPagination) {
      const pageParam = url.searchParams.get('page');
      const limitParam = url.searchParams.get('limit');
      
      // Only parse pagination params if they exist and noPagination is false
      if (pageParam) {
        page = parseInt(pageParam, 10);
      }
      
      if (limitParam) {
        limit = parseInt(limitParam, 10);
      }
    }
    
    const skip = (page - 1) * limit;
    
    // Build query object based on provided filters
    const query: any = {};
    
    // Handle the two use cases differently:
    // 1. initialCategory parameter is present - category is pre-filtered
    // 2. regular filtering with optional category filter
    
    if (initialCategory && initialCategory !== 'all') {
      // Case 1: Initial category filtering is enforced
      query.category = initialCategory;
    } else if (category && category !== 'all') {
      // Case 2: Regular filtering
      query.category = category;
    }
    
    // Add type filter if provided and not 'all'
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // Add technologies filter if provided and not 'all'
    if (technologies && technologies !== 'all') {
      // Support for multiple technologies (comma separated)
      if (technologies.includes(',')) {
        const techList = technologies.split(',').map(t => t.trim());
        query.technologies = { $in: techList };
      } else {
        // Single technology case
        query.technologies = { $regex: technologies, $options: 'i' };
      }
    }
    
    // Add time-based filtering if dates are provided
    if (startDate || endDate) {
      query.createdAt = {};
      
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Add search functionality if search term is provided
    if (search) {
      const searchConditions = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { technologies: { $regex: search, $options: 'i' } }
      ];
      query.$or = searchConditions;
    }
    
    // Always get total count for metadata
    const totalCount = await Websites.countDocuments(query);
    
    // Prepare the base query
    let itemsQuery = Websites.find(query);
    
    // Sort by createdAt date (newest first) by default
    itemsQuery = itemsQuery.sort({ createdAt: -1 });
    
    // Apply pagination only if noPagination is false
    if (!noPagination) {
      itemsQuery = itemsQuery.skip(skip).limit(limit);
    }
    
    // Execute query with filters
    const items = await itemsQuery.lean().exec();
    
    // Return response with appropriate structure
    if (noPagination) {
      // For non-paginated responses, only return items
      return NextResponse.json({ items });
    } else {
      // For paginated responses, include pagination metadata
      return NextResponse.json({
        items,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit)
        }
      });
    }
  } catch (error: any) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// HEAD endpoint to fetch all available filter options
export async function HEAD(request: NextRequest) {
  try {
    await dbConnect();
    
    // Create default option arrays
    let categoryOptions: IOptionItem[] = [];
    let typeOptions: IOptionItem[] = [];
    let techOptions: IOptionItem[] = [];
    
    // First try to get filter options from FilterOption model
    const categoryOptionDoc = await FilterOption.findOne({ type: 'category' }).lean().exec() as FilterOptionLean | null;
    const typeOptionDoc = await FilterOption.findOne({ type: 'type' }).lean().exec() as FilterOptionLean | null;
    const techOptionDoc = await FilterOption.findOne({ type: 'technology' }).lean().exec() as FilterOptionLean | null;
    
    // If filter options exist in the database, use them
    if (categoryOptionDoc && Array.isArray(categoryOptionDoc.options)) {
      categoryOptions = categoryOptionDoc.options;
    }
    
    if (typeOptionDoc && Array.isArray(typeOptionDoc.options)) {
      typeOptions = typeOptionDoc.options;
    }
    
    if (techOptionDoc && Array.isArray(techOptionDoc.options)) {
      techOptions = techOptionDoc.options;
    }
    
    // If any options aren't available from the database, use fallback
    if (categoryOptions.length === 0 || typeOptions.length === 0 || techOptions.length === 0) {
      // Find distinct categories, types and technologies from items
      const categoriesFromDb = await Websites.distinct('category').exec();
      const typesFromDb = await Websites.distinct('type').exec();
      
      // For technologies, handle array fields
      const items = await Websites.find({ technologies: { $exists: true } })
                           .select('technologies')
                           .lean()
                           .exec();
      
      // Extract and flatten the technologies arrays
      const technologiesSet = new Set<string>();
      items.forEach(item => {
        if (Array.isArray(item.technologies)) {
          item.technologies.forEach((tech: string) => technologiesSet.add(tech));
        } else if (typeof item.technologies === 'string') {
          technologiesSet.add(item.technologies);
        }
      });
      
      const technologiesFromDb = [...technologiesSet];
      
      // Format the data as options
      if (categoryOptions.length === 0) {
        categoryOptions = [
          { label: 'All', value: 'all' },
          ...categoriesFromDb.map(cat => ({ label: cat, value: cat }))
        ];
      }
      
      if (typeOptions.length === 0) {
        typeOptions = [
          { label: 'All', value: 'all' },
          ...typesFromDb.map(type => ({ label: type, value: type }))
        ];
      }
      
      if (techOptions.length === 0) {
        techOptions = [
          { label: 'All', value: 'all' },
          ...technologiesFromDb.map(tech => ({ label: tech, value: tech }))
        ];
      }
    }
    
    // Return the formatted options
    return NextResponse.json({
      categoryOptions,
      typeOptions,
      techOptions
    });
  } catch (error: any) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}

// POST endpoint to create new item
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Add timestamp for time-based filtering
    const timestamp = new Date();
    
    // Create complete item object with all fields
    const itemData = {
      name: data.name,
      title: data.title,
      url: data.url,
      type: data.type,
      category: data.category,
      technologies: data.technologies || [],
      framework: data.framework || 'Flutter',
      price: typeof data.price === 'number' ? data.price : 0,
      image: data.image,
      description: data.description,
      rating: typeof data.rating === 'number' ? data.rating : 0,
      downloads: typeof data.downloads === 'number' ? data.downloads : 0,
      features: Array.isArray(data.features) ? data.features : [],
      screenshots: Array.isArray(data.screenshots) ? data.screenshots : [],
      longDescription: data.longDescription || '',
      techStack: Array.isArray(data.techStack) ? data.techStack : [],
      version: data.version || '',
      author: data.author || '',
      support: data.support || '',
      fileSize: data.fileSize || '',
      timeToComplete: data.timeToComplete,
      estimatedTime: data.estimatedTime,
      createdAt: data.createdAt || timestamp,
      updatedAt: timestamp
    };
    
    // Create and save the item
    const newItem = new Websites(itemData);
    const savedItem = await newItem.save();
    
    // Fetch the complete saved item
    const completeItem = await Websites.findById(savedItem._id)
      .lean()
      .exec();
    
    return NextResponse.json(completeItem, { status: 201 });
  } catch (error: any) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create item' },
      { status: 500 }
    );
  }
}