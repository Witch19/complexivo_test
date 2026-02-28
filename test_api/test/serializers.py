from rest_framework import serializers
from .models import Test, Order

class TestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Test
        fields = ["id", "test_name", "sample_type", "price", "is_available"]

        
class OrderSerializer(serializers.ModelSerializer):
    # Cambiamos el nombre de la variable de 'test' a 'test_id'
    test_id = serializers.PrimaryKeyRelatedField(
        queryset=Test.objects.all(), 
        source="test" # Esto le dice a Django que guarde 'test_id' en el campo 'test' del modelo
    )

    class Meta:
        model = Order
        fields = ["id", "test_id", "patient_name", "status", "result_summary", "created_at"]