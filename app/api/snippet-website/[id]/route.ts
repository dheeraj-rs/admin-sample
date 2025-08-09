import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db-connect';
import SnippetWebsite from '@/models/SnippetWebsite';

// GET single item by ID
export async function GET(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    await dbConnect();
    const item = await SnippetWebsite.findById(params.id).lean();
    if (!item) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Snippet Website not found',
          timestamp: new Date().toISOString()
        }, 
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: item,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    if (error.name === 'CastError') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid ID format',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch item',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// DELETE single item by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    await dbConnect();
    const deletedItem = await SnippetWebsite.findByIdAndDelete(params.id).lean();
    if (!deletedItem) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Snippet Website not found',
          timestamp: new Date().toISOString()
        }, 
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Snippet Website deleted successfully',
      data: deletedItem,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    if (error.name === 'CastError') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid ID format',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to delete item',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// PUT/UPDATE single item by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    await dbConnect();
    const data = await request.json();
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    const updatedItem = await SnippetWebsite.findByIdAndUpdate(
      params.id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        lean: true
      }
    );
    if (!updatedItem) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Snippet Website not found',
          timestamp: new Date().toISOString()
        }, 
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: 'Snippet Website updated successfully',
      data: updatedItem,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    if (error.name === 'CastError') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid ID format',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
        if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          details: validationErrors,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to update item',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}