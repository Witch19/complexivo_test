from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Test, Order
from .serializers import TestSerializer, OrderSerializer
from .permissions import IsAdminOrReadOnly


class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all().order_by("id")
    serializer_class = TestSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ["movie_title"]
    ordering_fields = ["id", "movie_title", "room", "price", "available_seats"]


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related("test").all().order_by("-id")
    serializer_class = OrderSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

   
    filterset_fields = ["test"]

    search_fields = ["customer_name", "status", "test_id"]

    ordering_fields = ["id", "created_at", "seats", "status", "test_id"]

    def get_permissions(self):
        # Público: SOLO listar Reservas
        if self.action == "list":
            return [AllowAny()]
        return super().get_permissions()