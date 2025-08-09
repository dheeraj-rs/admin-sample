import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db-connect';
import Websites from '@/models/Websites';

export const dynamic = 'force-dynamic';

// GET single item
export async function GET(
  request: NextRequest,
  { params }: any
) {
  try {
    await dbConnect();
    const item = await Websites.findById(params.id).lean().exec();
    
    if (!item) {
      return NextResponse.json({ error: 'Websites not found' }, { status: 404 });
    }
    
    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Websites' },
      { status: 500 }
    );
  }
}

// DELETE item
export async function DELETE(
  request: NextRequest,
  { params }: any
) {
  try {
    await dbConnect();
    const deletedItem = await Websites.findByIdAndDelete(params.id);
    
    if (!deletedItem) {
      return NextResponse.json({ error: 'Websites not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Websites deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete item' },
      { status: 500 }
    );
  }
}

// PUT/UPDATE item
export async function PUT(
  request: NextRequest,
  { params }: any
) {
  try {
    await dbConnect();
    const data = await request.json();
    
    const updatedItem = await Websites.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    ).lean();
    
    if (!updatedItem) {
      return NextResponse.json({ error: 'Websites not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedItem);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update item' },
      { status: 500 }
    );
  }
}