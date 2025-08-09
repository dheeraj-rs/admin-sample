import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db-connect';
import CodeLibrary from '@/models/CodeLibrary';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const url = new URL(request.url);
    
    // Extract query parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search');
    const hashtags = url.searchParams.get('hashtags');
    const componentType = url.searchParams.get('componentType');
    const complexity = url.searchParams.get('complexity');
    
    // Build query
    const query: any = {};
    
    // Improved search functionality with regex for partial matching
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
      query.$or = [
        { title: { $regex: searchRegex } },
        { elementId: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { hashtags: { $regex: searchRegex } }
      ];
    }
    
    // Add hashtags filter
    if (hashtags) {
      const tagList = hashtags.split(',').map(tag => tag.trim());
      query.hashtags = { $in: tagList };
    }
    
    // Add componentType filter
    if (componentType) {
      query.componentType = componentType;
    }
    
    // Add complexity filter
    if (complexity) {
      query.complexity = complexity;
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await CodeLibrary.countDocuments(query);
    
    // Get paginated results
    const items = await CodeLibrary.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    return NextResponse.json({
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: items
    });
    
  } catch (error: any) {
    console.error('Error fetching code library:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch code library' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Generate unique elementId if not provided
    if (!data.elementId) {
      data.elementId = `${data.componentType}-${Date.now()}`;
    }
    
    const codeLibrary = new CodeLibrary(data);
    await codeLibrary.save();
    
    return NextResponse.json(codeLibrary, { status: 201 });
  } catch (error: any) {
    console.error('Error creating code library item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create code library item' },
      { status: 500 }
    );
  }
}