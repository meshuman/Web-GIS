import logging
log = logging.getLogger("error")

from django.shortcuts import render
from ee.ee_exception import EEException


# Import necessary modules
import ee
from django.http import JsonResponse

# Initialize Earth Engine
ee.Initialize(project='ee-shumanbaral')

def image_to_map_id(image_name, vis_params={}):
    """
    Get map_id parameters
    """
    try:
        ee_image = ee.Image(image_name)
        map_id = ee_image.getMapId(vis_params)
        tile_url = map_id['tile_fetcher'].url_format
        return tile_url

    except EEException:
        log.exception('An error occurred while attempting to retrieve the map id.')

# Define a Django view to retrieve GEE daclsta and return it as JSON
def gee_data_view(request):
    def mask_s2_clouds(image):

        qa = image.select('QA60')

        # Bits 10 and 11 are clouds and cirrus, respectively.
        cloud_bit_mask = 1 << 10
        cirrus_bit_mask = 1 << 11

        # Both flags should be set to zero, indicating clear conditions.
        mask = (
            qa.bitwiseAnd(cloud_bit_mask)
            .eq(0)
            .And(qa.bitwiseAnd(cirrus_bit_mask).eq(0))
        )

        return image.updateMask(mask).divide(10000)

    dataset = (
        ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
        .filterDate('2023-01-01', '2024-01-30')
        # Pre-filter to get less cloudy granules.
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
        .map(mask_s2_clouds)
    )

    visualization = {
        'min': 0.0,
        'max': 0.3,
        'bands': ['B4', 'B3', 'B2'],
    }
    mapurl = image_to_map_id(dataset.mean(), visualization)
    return JsonResponse({'mapurl':mapurl})

def leaflet_map_view(request):
    return render(request, 'geemap.html')
