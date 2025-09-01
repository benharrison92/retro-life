import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')
    
    if (!GOOGLE_PLACES_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Google Places API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { query, location } = await req.json()
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Build the search URL
    let searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}`
    
    // Add location bias if provided
    if (location && location.lat && location.lng) {
      searchUrl += `&location=${location.lat},${location.lng}&radius=50000`
    }
    
    // Focus on restaurants and similar places
    searchUrl += '&type=restaurant|cafe|food|establishment'

    console.log('Searching places with query:', query)
    
    const response = await fetch(searchUrl)
    const data = await response.json()
    
    if (data.error_message) {
      console.error('Google Places API error:', data.error_message)
      return new Response(
        JSON.stringify({ error: data.error_message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Transform the results to our format
    const places = data.results?.map((place: any) => ({
      place_id: place.place_id,
      name: place.name,
      formatted_address: place.formatted_address,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      types: place.types,
      geometry: place.geometry,
      photos: place.photos?.slice(0, 3).map((photo: any) => ({
        photo_reference: photo.photo_reference,
        width: photo.width,
        height: photo.height
      })) || []
    })) || []

    console.log('Found places:', places.length)

    return new Response(
      JSON.stringify({ places }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in google-places-search function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})