import { onPaid, processDomainDocument } from '@/utils/supabase-admin'

export async function GET (req: Request) {
  const { searchParams } = new URL(req.url)

  const document_id = searchParams.get('document_id')

  if (!document_id) {
    return new Response(JSON.stringify({ error: 'document_id is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  try {
    let result = await onPaid(document_id, 'amir@f.inc', 'domain')

    return new Response(
      JSON.stringify({
        message: 'Payment processed successfully',
        result: result
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error(error)

    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing the payment'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
