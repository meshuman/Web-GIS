from django.urls import path
from . import views

urlpatterns = [
    path('gee-data/', views.gee_data_view, name='gee_data'),
    path('leafmap/', views.leaflet_map_view, name='leaflet_map'),
]