import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const reportId = formData.get('reportId') as string

    if (!file || !reportId) {
      return NextResponse.json({ error: 'file and reportId are required' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileName = `${reportId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`

    const { data, error } = await supabase.storage
      .from('report-photos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      throw error
    }

    const { data: urlData } = supabase.storage
      .from('report-photos')
      .getPublicUrl(data.path)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
