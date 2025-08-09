import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db-connect';
import CodeLibrary, { ICodeLibrary } from '@/models/CodeLibrary';

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();
    
    await dbConnect();
    const item = await CodeLibrary.findOne({ elementId: id }) as ICodeLibrary | null;
    
    if (!item) {
      return NextResponse.json(
        { error: 'Code library item not found' },
        { status: 404 }
      );
    }
    
    // Increment views - now TypeScript knows _id exists
    await CodeLibrary.findByIdAndUpdate(item._id, { $inc: { views: 1 } });
    
    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch code library item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();
    await dbConnect();
    const data = await request.json();
    
    const updatedItem = await CodeLibrary.findOneAndUpdate(
      { elementId: id },
      data,
      { new: true, runValidators: true }
    ).lean();
    
    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Code library item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedItem);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update code library item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();
    await dbConnect();
    const deletedItem = await CodeLibrary.findOneAndDelete({ elementId: id });
    
    if (!deletedItem) {
      return NextResponse.json(
        { error: 'Code library item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Code library item deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete code library item' },
      { status: 500 }
    );
  }
}