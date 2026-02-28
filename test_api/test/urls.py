from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import TestViewSet, OrderViewSet
from .catalog_types_views import labTests_types_list_create, labTests_types_detail
from .order_events_views import order_events_list_create, order_events_detail

router = DefaultRouter()
router.register(r"Tests", TestViewSet, basename="Tests")
router.register(r"Orders", OrderViewSet, basename="Orders")

urlpatterns = [
    # Mongo
    path("catalog-types/", labTests_types_list_create),
    path("catalog-types/<str:id>/", labTests_types_detail),
    path("order-events/", order_events_list_create),
    path("order-events/<str:id>/", order_events_detail),
]

urlpatterns += router.urls